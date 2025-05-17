const BookingRequest = require("../models/bookingRequest.model");
const Accommodation = require("../models/accommodation.model");
const User = require("../models/user.model"); // For searching users by name
const mongoose = require("mongoose");


exports.getAllBookingRequests = async (req, res) => {
  try {
    const { status: statusFilter, search } = req.query;
    let query = {};

    // If user is 'service', filter by residencies they manage
    if (req.user.role === "service") {
      const managedResidencies = await Accommodation.find({
        userId: req.user._id, // Accommodation.userId links to the manager
      }).select("_id");

      if (!managedResidencies.length) {
        return res.status(200).json({ success: true, data: [] }); // No residencies managed
      }
      const managedResidencyIds = managedResidencies.map((r) => r._id);
      query.residencyId = { $in: managedResidencyIds }; // Query by 'residencyId' field
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "paid") { // Assuming 'paid' is a direct status on BookingRequest
        query.status = "paid";
      } else if (statusFilter === "approved_awaiting_payment") { // For frontend filter
        query.status = "approved"; // Backend status is 'approved'
      } else {
        query.status = statusFilter;
      }
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      const matchingStudents = await User.find({ name: searchRegex }).select(
        "_id"
      );
      const studentIds = matchingStudents.map((s) => s._id);

      query.$or = [
        { studentId: { $in: studentIds } }, // Query by 'studentId' (the ObjectId ref)
        { roomNumber: searchRegex },
      ];
    }

    // Execute query and populate
    const bookingRequests = await BookingRequest.find(query)
      .populate("studentId", "name studentId universityInfo email") // Populate fields from User model. Ensure 'studentId' (custom), 'universityInfo', 'email' exist on User schema.
      .populate("residencyId", "title") // Populate title from Accommodation model
      .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

    // Transform data for frontend
    const formattedRequests = bookingRequests.map((req) => {
      // Safely access populated data
      const studentData = req.studentId || {}; // Default to empty object if not populated
      const residencyData = req.residencyId || {}; // Default to empty object

      return {
        id: req._id.toHexString(), // String version of MongoDB ObjectId
        _id: req._id, // Raw MongoDB ObjectId (optional for frontend, but good to have)

        // Student related info
        studentName: studentData.name || "N/A",
        studentIdentifier: studentData.studentId || "N/A", // This is the custom student ID from User model
        studentEmail: studentData.email || "N/A", // Email from User model
        universityInfo: studentData.universityInfo || {}, // University info from User model (default to empty obj)

        // Residency related info
        residencyTitle: residencyData.title || "N/A",
        residencyId: residencyData._id ? residencyData._id.toHexString() : null,

        // BookingRequest specific info
        roomNumber: req.roomNumber,
        // Use createdAt as applicationDate, as per your BookingRequest schema's timestamps: true
        applicationDate: req.createdAt,
        status: req.status,
        notes: req.notes,
        
        // Include all original BookingRequest fields that might be needed for actions or detailed view
        matriculeBac: req.matriculeBac,
        anneeBac: req.anneeBac,
        sex: req.sex,
        dateNaissance: req.dateNaissance,
        filiere: req.filiere,
        anneeEtude: req.anneeEtude,
        wilayaResidenceStudent: req.wilayaResidenceStudent,

        // Fields related to payment/rejection - only include if they exist on your BookingRequest schema
        // payment: req.payment, // If you have a payment sub-document
        // rejectionReason: req.rejectionReason,
        // assignedRoom: req.assignedRoomNumber,
      };
    });

    res.status(200).json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


// @desc    Approve a booking request
// @route   PUT /api/booking-requests/:id/approve
// @access  Private (Service, Admin)
exports.approveBookingRequest = async (req, res) => {
  try {
    const { notes } = req.body;
    
    // Frontend sends `req.id` (which is `_id`)
    const bookingRequest = await BookingRequest.findById(req.params.id);
    if (!bookingRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Booking request not found" });
    }
    console.log("bookingRequest", bookingRequest);
    // Authorization: Check if service user manages this residency
    if (req.user.role === "service") {
      const accommodation = await Accommodation.findById(
        bookingRequest.residencyId
      ); // bookingRequest.residency is populated
      console.log("accommodation", accommodation);
      if (
        !accommodation ||
        accommodation.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "User not authorized to update this request",
          });
      }
    }

    bookingRequest.status = "approved";
    // In the frontend, assignedRoom is set to requestedRoomNumber upon approval
    // So, we set assignedRoomNumber to requestedRoomNumber if not already set.
    bookingRequest.assignedRoomNumber =
      bookingRequest.assignedRoomNumber || bookingRequest.requestedRoomNumber;
    if (notes) bookingRequest.notes = notes;
    // Ensure payment status is 'pending' if not already paid, as approval means payment is now expected
    if (bookingRequest.payment?.status !== "paid") {
      bookingRequest.payment = {
        status: "pending",
        date: null,
        amount: null,
        method: null,
      };
    }

    const updatedRequest = await bookingRequest.save();
    // Repopulate after save or ensure virtuals/populated fields are correctly returned
    const populatedRequest = await BookingRequest.findById(updatedRequest._id);

    res.status(200).json({ success: true, data: populatedRequest });
  } catch (error) {
    console.error("Error approving booking request:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Reject a booking request
// @route   PUT /api/booking-requests/:id/reject
// @access  Private (Service, Admin)
exports.rejectBookingRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (
      !rejectionReason ||
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }

    const bookingRequest = await BookingRequest.findById(req.params.id);

    if (!bookingRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Booking request not found" });
    }

    // Authorization check
    if (req.user.role === "service") {
      const accommodation = await Accommodation.findById(
        bookingRequest.residencyId
      );
      if (
        !accommodation ||
        accommodation.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "User not authorized to update this request",
          });
      }
    }

    bookingRequest.status = "rejected";
    bookingRequest.rejectionReason = rejectionReason;
    const updatedRequest = await bookingRequest.save();
    const populatedRequest = await BookingRequest.findById(updatedRequest._id);

    res.status(200).json({ success: true, data: populatedRequest });
  } catch (error) {
    console.error("Error rejecting booking request:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Mark a booking request as paid
// @route   PUT /api/booking-requests/:id/mark-paid
// @access  Private (Service, Admin)
exports.markBookingAsPaid = async (req, res) => {
  try {
    // Frontend mock sends fixed payment details. Here we can make them dynamic.
    const { amount, method, date } = req.body.payment || {}; // Expect payment details in body

    const bookingRequest = await BookingRequest.findById(req.params.id);

    if (!bookingRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Booking request not found" });
    }

    // Authorization check
    if (req.user.role === "service") {
      const accommodation = await Accommodation.findById(
        bookingRequest.residencyId
      );
      if (
        !accommodation ||
        accommodation.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "User not authorized to update this request",
          });
      }
    }

    if (bookingRequest.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Booking must be approved before marking as paid.",
      });
    }

    bookingRequest.status = "paid";
    if (req.body.notes) bookingRequest.notes = req.body.notes; // Allow updating notes too

    const updatedRequest = await bookingRequest.save();
    const populatedRequest = await BookingRequest.findById(updatedRequest._id);

    res.status(200).json({ success: true, data: populatedRequest });
  } catch (error) {
    console.error("Error marking booking as paid:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


exports.createBookingRequest = async (req, res) => {
  try {
    const studentId = req.user.id; // From authMiddleware

    const {
      residencyId,
      roomNumber,
      matriculeBac,
      anneeBac,
      sex,
      dateNaissance,
      filiere,
      anneeEtude,
      wilayaResidenceStudent,
      notes,
    } = req.body;

    // --- Basic Validations ---
    if (!mongoose.Types.ObjectId.isValid(residencyId)) {
        return res.status(400).json({ success: false, message: "Invalid Accommodation ID format." });
    }
    const requiredFields = { residencyId, roomNumber, matriculeBac, anneeBac, sex, dateNaissance, filiere, anneeEtude, wilayaResidenceStudent};
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            return res.status(400).json({ success: false, message: `${field.replace(/([A-Z])/g, ' $1')} is required.` });
        }
    }
    if (isNaN(parseInt(roomNumber)) || parseInt(roomNumber) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid room number." });
    }


    // --- Check if Accommodation exists and room number is valid ---
    const residency = await Accommodation.findById(residencyId);
    if (!residency) {
      return res.status(404).json({ success: false, message: 'Accommodation not found.' });
    }
    if (parseInt(roomNumber) > residency.totalRoomCount) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} exceeds the total available rooms (${residency.totalRoomCount}) for this residency.`,
      });
    }

    // --- Check if student exists (should be guaranteed by auth, but good practice) ---
    const student = await User.findById(studentId);
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student making the request not found.' });
    }

    // --- Check if the student already has an active (pending or approved) request for ANY room in THIS residency ---
    // This rule might vary based on your policy (e.g., one active request per student overall, or per residency)
    const existingActiveRequestForResidency = await BookingRequest.findOne({
      studentId,
      residencyId,
      status: { $in: ['pending', 'approved', 'paid'] },
    });

    if (existingActiveRequestForResidency) {
      return res.status(400).json({
        success: false,
        message: `You already have an active booking request (status: ${existingActiveRequestForResidency.status}) for this residency. Please wait for it to be processed or cancel it before applying again.`,
      });
    }

    // --- Check if the specific roomNumber is already taken (approved/paid) by another student in this residency ---
    const roomAlreadyBooked = await BookingRequest.findOne({
      residencyId,
      roomNumber: roomNumber, // Ensure exact match if roomNumber is string
      status: { $in: ['approved', 'paid'] }, // 'pending' requests for the same room are usually allowed until one is approved
    });

    if (roomAlreadyBooked) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} in this residency is already booked or reserved. Please choose a different room.`,
      });
    }

    // --- Create and save the booking request ---
    const newBookingRequest = new BookingRequest({
      studentId,
      residencyId,
      roomNumber,
      matriculeBac,
      anneeBac,
      sex,
      dateNaissance: new Date(dateNaissance), // Ensure it's a Date object
      filiere,
      anneeEtude,
      wilayaResidenceStudent,
      notes: notes || '',
      status: 'pending', // Initial status
    });

    await newBookingRequest.save();

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. You will be notified once it is processed.',
      data: newBookingRequest,
    });

  } catch (error) {
    console.error('Error creating booking request:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error while creating booking request.' });
  }
};


exports.getStudentActiveRoomRequest = async (req, res) => {
  try {
    const studentId = req.user.id;

    const activeRequest = await BookingRequest.findOne({
      studentId: studentId,
      status: { $in: ["pending", "approved", "paid", "rejected"] },
    })
    .sort({ createdAt: -1 })
    .populate("residencyId", "title wilaya")
    .populate("studentId", "name");

    if (!activeRequest) {
      return res.status(200).json({ success: true, data: null });
    }

    console.log("Active request:", activeRequest);
    const formattedRequest = {
      id: activeRequest._id.toHexString(),
      residencyId: activeRequest.residencyId?._id.toHexString(),
      residencyTitle: activeRequest.residencyId?.title,
      roomNumber: activeRequest.roomNumber,
      status: activeRequest.status,
      applicationDate: activeRequest.createdAt,
      notes: activeRequest.notes,
      studentName: activeRequest.studentId?.name,
    };

    console.log("Formatted request:", formattedRequest); // Add this line t

    if (activeRequest.status === "Rejected" && activeRequest.rejectionReason) {
      formattedRequest.rejectionReason = activeRequest.rejectionReason;
    }

    if (
      activeRequest.assignedRoomNumber &&
      (activeRequest.status === "Approved - Awaiting Payment" || activeRequest.status === "Confirmed & Paid")
    ) {
      formattedRequest.assignedRoomNumber = activeRequest.assignedRoomNumber;
    }

    res.status(200).json({ success: true, data: formattedRequest });
  } catch (error) {
    console.error("Error fetching student's active room request:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Cancel student's own room booking request
// @route   DELETE /api/booking-requests/student/my-request/:id
// @access  Private (Student)
exports.cancelStudentRoomRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const requestId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ success: false, message: "Invalid request ID format." });
    }

    const bookingRequest = await BookingRequest.findById(requestId);

    if (!bookingRequest) {
      return res.status(404).json({ success: false, message: "Booking request not found." });
    }

    // Ensure the request belongs to the logged-in student
    if (bookingRequest.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this request." });
    }

    // Check if the request is in a cancellable state
    if (bookingRequest.status !== "pending") { // Or add other cancellable statuses
      return res.status(400).json({ success: false, message: `Request with status '${bookingRequest.status}' cannot be cancelled.` });
    }

    // Option 1: Actually delete the request
    // await bookingRequest.remove();
    // Option 2: Mark as 'cancelled'
    bookingRequest.status = "cancelled";
    await bookingRequest.save();

    res.status(200).json({ success: true, message: "Room request successfully cancelled." });
  } catch (error) {
    console.error("Error cancelling student's room request:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// @desc    Update student's own room booking request (Placeholder)
// @route   PUT /api/booking-requests/student/my-request/:id
// @access  Private (Student)
exports.updateStudentRoomRequest = async (req, res) => {
    try {
        const studentId = req.user.id;
        const requestId = req.params.id;
        const updates = req.body; // e.g., { notes: "New notes", matriculeBac: "..." }

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ success: false, message: "Invalid request ID format." });
        }

        const bookingRequest = await BookingRequest.findById(requestId);

        if (!bookingRequest) {
            return res.status(404).json({ success: false, message: "Booking request not found." });
        }

        if (bookingRequest.studentId.toString() !== studentId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this request." });
        }

        // Only allow updates if status is 'Pending Review'
        if (bookingRequest.status !== "Pending Review") {
            return res.status(400).json({ success: false, message: `Request with status '${bookingRequest.status}' cannot be edited.` });
        }

        // Whitelist allowed fields for update by student
        const allowedUpdates = ['notes', 'matriculeBac', 'anneeBac', 'sex', 'dateNaissance', 'filiere', 'anneeEtude', 'wilayaResidenceStudent'];
        for (const key in updates) {
            if (allowedUpdates.includes(key)) {
                bookingRequest[key] = updates[key];
            }
        }
        // Handle dateNaissance specifically if it comes as a string
        if (updates.dateNaissance) {
            bookingRequest.dateNaissance = new Date(updates.dateNaissance);
        }


        await bookingRequest.save();
        
        // Repopulate or reformat data as done in getStudentActiveRoomRequest if needed for response
        const populatedRequest = await BookingRequest.findById(bookingRequest._id)
                                    .populate("residencyId", "title wilaya")
                                    .populate("studentId", "name");

        const formattedRequest = { /* ... similar formatting as getStudentActiveRoomRequest ... */ 
            id: populatedRequest._id.toHexString(),
            // ... other fields
            notes: populatedRequest.notes, // Example
        };


        res.status(200).json({ success: true, message: "Request updated successfully.", data: formattedRequest });

    } catch (error) {
        console.error("Error updating student's room request:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
          }
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};