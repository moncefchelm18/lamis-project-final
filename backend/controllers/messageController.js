// controllers/messageController.js
const Message = require("../models/message.model");
const Accommodation = require("../models/accommodation.model"); // To check residency existence
const GeneralContactMessage = require("../models/GeneralContactMessage.model");
const mongoose = require("mongoose");

// @desc    Create a new contact message to a residency
// @route   POST /api/messages/contact-residency
// @access  Private (Student)
const contactResidency = async (req, res) => {
  try {
    const studentId = req.user.id; // From authMiddleware

    const { residencyId, content, email } = req.body;

    // --- Basic Validations ---
    if (!residencyId || !content || !email) {
      return res.status(400).json({
        success: false,
        message: "Residency ID, message content, and your email are required.",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(residencyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Residency ID format." });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // --- Check if Residency exists ---
    const residency = await Accommodation.findById(residencyId);
    if (!residency) {
      return res
        .status(404)
        .json({ success: false, message: "Residency not found." });
    }

    // --- Create and save the message ---
    const newMessage = new Message({
      studentId,
      residencyId,
      senderEmail: email, // Use the email provided in the form
      content,
      status: "unread",
    });

    await newMessage.save();

    // Optional: Implement a notification system here (e.g., email the residency manager)
    // if (residency.managerEmail) {
    //   sendEmailNotification(residency.managerEmail, `New Message from ${email}`, content);
    // }

    res.status(201).json({
      success: true,
      message: "Message sent successfully to the residency.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message to residency:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error while sending message." });
  }
};

const getMessagesForManagedResidencies = async (req, res) => {
  try {
    const serviceManagerId = req.user.id;

    // 1. Find all residencies managed by this service user
    const managedResidencies = await Accommodation.find({
      userId: serviceManagerId,
    }).select("_id title"); // Select _id and title

    if (!managedResidencies || managedResidencies.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "You do not manage any residencies.",
      });
    }

    const managedResidencyIds = managedResidencies.map(
      (residency) => residency._id
    );

    // 2. Find all messages where residencyId is in the list of managedResidencyIds
    // You can also add filters for status (unread, read, archived) from req.query if needed
    const { status: statusFilter, search } = req.query;
    let messageQuery = {
      residencyId: { $in: managedResidencyIds },
    };

    if (statusFilter && statusFilter !== "all") {
      messageQuery.status = statusFilter;
    }

    // Basic search on message content or sender email
    if (search) {
      const searchRegex = new RegExp(search, "i");
      messageQuery.$or = [
        { content: searchRegex },
        { senderEmail: searchRegex },
      ];
      // If you want to search by student name, you'd need another lookup or more complex query
    }

    const messages = await Message.find(messageQuery)
      .populate("studentId", "name email") // Populate sender's name and registered email
      .populate("residencyId", "title") // Populate residency title for context
      .sort({ createdAt: -1 }); // Show newest messages first

    // Optionally, format the messages if needed for the frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg._id, // or msg.id if virtual is set
      residencyTitle: msg.residencyId?.title || "N/A",
      residencyObjectId: msg.residencyId?._id, // For filtering or linking
      studentName: msg.studentId?.name || "N/A", // Name from User model
      studentRegisteredEmail: msg.studentId?.email || "N/A", // Registered email from User model
      senderEmail: msg.senderEmail, // Email from the form
      content: msg.content,
      status: msg.status,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    res.status(200).json({ success: true, data: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages for managed residencies:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages.",
    });
  }
};

// @desc    Update message status (e.g., mark as read/archived)
// @route   PUT /api/messages/:messageId/status
// @access  Private (Service)
const updateMessageStatus = async (req, res) => {
  try {
    const serviceManagerId = req.user.id;
    const { messageId } = req.params;
    const { status } = req.body; // Expected new status: 'read' or 'archived'

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message ID." });
    }

    if (!["read", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'read' or 'archived'.",
      });
    }

    const message = await Message.findById(messageId).populate(
      "residencyId",
      "userId"
    );

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }

    // Authorization: Check if the message belongs to a residency managed by this service user
    if (
      !message.residencyId ||
      message.residencyId.userId.toString() !== serviceManagerId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this message.",
      });
    }

    message.status = status;
    await message.save();

    // Repopulate for consistent response structure
    const updatedPopulatedMessage = await Message.findById(message._id)
      .populate("studentId", "name email")
      .populate("residencyId", "title");

    res.status(200).json({
      success: true,
      data: updatedPopulatedMessage,
      message: `Message marked as ${status}.`,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating message status.",
    });
  }
};

const handleLandingPageContact = async (req, res) => {
  try {
    const { firstName, lastName, senderEmail, content } = req.body;

    // --- Basic Validations ---
    if (!firstName || !senderEmail || !content) {
      return res.status(400).json({
        success: false,
        message: "First name, email, and message content are required.",
      });
    }
    if (!/\S+@\S+\.\S+/.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const newContactMessage = new GeneralContactMessage({
      firstName,
      lastName: lastName || "", // Optional
      senderEmail,
      content,
      status: "unread",
    });

    await newContactMessage.save();

    // TODO Optional: Implement an email notification to a predefined admin email list here
    // Example: sendEmailToAdmins('New Contact Form Submission', `From: ${firstName} ${lastName} <${senderEmail}>\n\nMessage:\n${content}`);

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you soon.",
      data: newContactMessage,
    });
  } catch (error) {
    console.error("Error saving landing page contact message:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({
      success: false,
      message: "Server error while sending your message.",
    });
  }
};

// @desc    Get all general contact messages (for Admin)
// @route   GET /api/messages/contact-admins
// @access  Private (Admin)
const getGeneralContactMessages = async (req, res) => {
  try {
    const {
      status: statusFilter,
      search,
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;
    let query = {};

    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { senderEmail: searchRegex },
        { content: searchRegex },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
    };

    const result = await GeneralContactMessage.paginate(query, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalMessages: result.totalDocs,
    });
  } catch (error) {
    console.error("Error fetching general contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contact messages.",
    });
  }
};

// @desc    Update status of a general contact message (for Admin)
// @route   PUT /api/messages/contact-admins/:messageId/status
// @access  Private (Admin)
const updateGeneralContactMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message ID." });
    }

    if (!["unread", "read", "archived", "replied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be 'unread', 'read', 'archived', or 'replied'.",
      });
    }

    const message = await GeneralContactMessage.findById(messageId);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
      message: `Message marked as ${status}.`,
    });
  } catch (error) {
    console.error("Error updating general contact message status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating message status.",
    });
  }
};

module.exports = {
  contactResidency,
  getMessagesForManagedResidencies,
  updateMessageStatus,
  handleLandingPageContact, // <-- EXPORT NEW
  getGeneralContactMessages, // <-- EXPORT NEW
  updateGeneralContactMessageStatus, // <-- EXPORT NEW
};
