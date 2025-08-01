const { body, validationResult } = require("express-validator")
const HttpError = require("../models/http-error")

// Comprehensive list of inappropriate words and phrases
const profanityWords = [
  // Profanity
  "fuck", "fucking", "fucked", "fucker", "shit", "shitting", "damn", "damned", "hell",
  "bitch", "bitching", "asshole", "ass", "bastard", "cunt", "whore", "slut", "prick",
  "dickhead", "dick", "cock", "penis", "vagina", "motherfucker", "cocksucker",
  "faggot", "fag", "nigger", "nigga", "retard", "retarded", "crap", "piss", "pissed",

  // Variations and leetspeak
  "f*ck", "f**k", "sh*t", "sh**", "b*tch", "a**hole", "d*mn", "@ss", "@sshole",
  "fuk", "fck", "sht", "btch", "dmn", "hll", "fuk", "phuck", "shyt", "biatch",

  // Hate speech and discriminatory language
  "nazi", "hitler", "terrorist", "kill yourself", "kys", "suicide", "die", "death",

  // Sexual content
  "porn", "sex", "sexual", "nude", "naked", "orgasm", "masturbate", "horny",

  // Drug references
  "weed", "marijuana", "cocaine", "heroin", "meth", "drugs", "high", "stoned"
]

// Advanced profanity detection function
const containsProfanity = (text) => {
  if (!text || typeof text !== 'string') return false

  const lowerText = text.toLowerCase()

  // Remove special characters and normalize text
  const normalizedText = lowerText.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ')

  return profanityWords.some(word => {
    // Check for exact word matches
    const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (wordRegex.test(normalizedText)) return true

    // Check for word with numbers/special chars mixed in (like f*ck, f1ck, etc.)
    const flexibleWord = word.replace(/[aeiou]/g, '[aeiou@3*]').replace(/[^aeiou@3*]/g, (char) => {
      const substitutions = {
        's': '[s$5z]',
        'o': '[o0@]',
        'i': '[i1!]',
        'e': '[e3]',
        'a': '[a@4]',
        't': '[t7]',
        'l': '[l1]',
        'g': '[g9]'
      }
      return substitutions[char] || char
    })

    const flexibleRegex = new RegExp(`\\b${flexibleWord}\\b`, 'i')
    return flexibleRegex.test(normalizedText)
  })
}

// Custom validator for profanity check
const checkProfanity = (value) => {
  if (containsProfanity(value)) {
    throw new Error('Content contains inappropriate language')
  }
  return true
}

// Custom validator for spam detection
const checkSpam = (value) => {
  if (!value || typeof value !== 'string') return true

  // Check for excessive repetition
  const words = value.toLowerCase().split(/\s+/)
  const wordCount = {}
  let maxRepetition = 0

  words.forEach(word => {
    if (word.length > 2) {
      wordCount[word] = (wordCount[word] || 0) + 1
      maxRepetition = Math.max(maxRepetition, wordCount[word])
    }
  })

  if (maxRepetition > 5) {
    throw new Error('Message appears to be spam (excessive word repetition)')
  }

  // Check for excessive capital letters
  const capsCount = (value.match(/[A-Z]/g) || []).length
  const totalLetters = (value.match(/[A-Za-z]/g) || []).length
  if (totalLetters > 0 && (capsCount / totalLetters) > 0.7) {
    throw new Error('Please avoid excessive use of capital letters')
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{4,}/i, // Same character repeated 5+ times
    /\b(https?:\/\/|www\.)/i, // URLs
    /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/i, // Email addresses in message
    /\b\d{10,}\b/g, // Phone numbers
  ]

  for (let pattern of suspiciousPatterns) {
    if (pattern.test(value)) {
      throw new Error('Message contains suspicious content or formatting')
    }
  }

  return true
}

const contactFormValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Name can only contain letters, spaces, apostrophes, and hyphens")
    .custom(checkProfanity)
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters")
    .custom(checkProfanity)
    .custom(checkSpam)
    .trim(),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters")
    .custom(checkProfanity)
    .custom(checkSpam)
    .trim()
]

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg)
    return next(new HttpError(errorMessages.join('. '), 400))
  }
  next()
}

module.exports = {
  contactFormValidation,
  handleValidationErrors,
  containsProfanity
}
