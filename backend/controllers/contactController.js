const HttpError = require("../models/http-error")
const emailService = require("../services/emailService")

const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body

    
    if (!name || !email || !subject || !message) {
      return next(new HttpError("All fields are required", 400))
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return next(new HttpError("Please provide a valid email address", 400))
    }

    // Send email notification
    await emailService.sendContactFormEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    })

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
    })
  } catch (error) {
    console.error("Contact form submission error:", error)
    return next(new HttpError("Failed to send message. Please try again later.", 500))
  }
}

module.exports = {
  sendContactMessage,
}
