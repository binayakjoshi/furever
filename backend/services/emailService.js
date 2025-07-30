const SibApiV3Sdk = require("sib-api-v3-sdk")

class EmailService {
  constructor() {
    // Initialize Brevo (formerly Sendinblue) client
    const defaultClient = SibApiV3Sdk.ApiClient.instance
    const apiKey = defaultClient.authentications["api-key"]
    apiKey.apiKey = process.env.BREVO_API_KEY

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  }

  async sendEmail({ to, subject, htmlContent }) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

      sendSmtpEmail.subject = subject
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = {
        name: process.env.SENDER_NAME || "Pet Care System",
        email: process.env.SENDER_EMAIL || "noreply@petcare.com",
      }
      sendSmtpEmail.to = [{ email: to }]

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail)
      console.log("Email sent successfully:", result)
      return result
    } catch (error) {
      console.error("Email sending failed:", error)
      throw error
    }
  }

  
  async sendVaccinationReminder({
    ownerEmail,
    ownerName,
    petName,
    petType,
    petBreed,
    petAge,
    vaccinations,
    reminderType,
    intervalType,
  }) {
    const subject = `🐾 Vaccination Reminder: ${petName} - ${reminderType}`

    
    const urgencyColor = this.getUrgencyColor(intervalType)
    const urgencyIcon = this.getUrgencyIcon(intervalType)

    const vaccinationsList = vaccinations
      .map((vacc) => {
        const dueDate = new Date(vacc.nextVaccDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        const lastVaccDate = new Date(vacc.vaccDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        return `
          <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${urgencyColor};">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${vacc.name}</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>📅 Due Date:</strong> ${dueDate}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>💉 Last Vaccination:</strong> ${lastVaccDate}
            </p>
          </div>
        `
      })
      .join("")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #667eea 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${urgencyIcon} Vaccination Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${reminderType}</p>
        </div>
        
        <div style="padding: 30px 20px; background: #f9f9f9;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Hello ${ownerName}! 👋</h2>
              <p style="color: #666; font-size: 16px; margin: 0;">
                This is a friendly reminder about <strong>${petName}</strong>'s upcoming vaccination${vaccinations.length > 1 ? "s" : ""}.
              </p>
            </div>

            <!-- Pet Information Card -->
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 20px;">🐾 Pet Information</h3>
              <div style="display: inline-block; text-align: left;">
                <p style="margin: 8px 0; color: #333; font-size: 16px;">
                  <strong>📛 Name:</strong> ${petName}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 16px;">
                  <strong>🐕 Type:</strong> ${petType}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 16px;">
                  <strong>🏷️ Breed:</strong> ${petBreed}
                </p>
                <p style="margin: 8px 0; color: #333; font-size: 16px;">
                  <strong>🎂 Age:</strong> ${petAge} old
                </p>
              </div>
            </div>

            <!-- Vaccinations Due -->
            <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 20px;">
              💉 Vaccination${vaccinations.length > 1 ? "s" : ""} Due:
            </h3>
            ${vaccinationsList}

            <!-- Important Alert -->
            <div style="background: ${this.getAlertBackground(intervalType)}; border: 2px solid ${this.getAlertBorder(intervalType)}; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h4 style="color: ${urgencyColor}; margin: 0 0 10px 0; font-size: 18px;">
                ${urgencyIcon} ${this.getAlertTitle(intervalType)}
              </h4>
              <p style="margin: 0; color: #333; line-height: 1.6; font-size: 16px;">
                ${this.getReminderMessage(intervalType, petName)}
              </p>
            </div>

            <!-- Helpful Tips -->
            <div style="background: linear-gradient(135deg, #f0f8ff 0%, #e8f5e8 100%); padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h4 style="color: #2196f3; margin: 0 0 15px 0; font-size: 18px;">💡 Helpful Tips:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8; font-size: 15px;">
                <li>📞 Contact your veterinarian to schedule the appointment</li>
                <li>📋 Bring ${petName}'s vaccination record and medical history</li>
                <li>🩺 Ensure ${petName} is healthy and not showing signs of illness</li>
                <li>😌 Keep ${petName} calm and comfortable during the visit</li>
                <li>💧 Bring water and a favorite toy for comfort</li>
                <li>⏰ Arrive 10-15 minutes early for check-in</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="background: #fff3e0; border: 1px solid #ffcc02; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <h4 style="color: #f57c00; margin: 0 0 10px 0; font-size: 18px;">📞 Need Help?</h4>
              <p style="margin: 0; color: #333; font-size: 15px;">
                If you have any questions about ${petName}'s vaccination schedule, 
                please contact your veterinarian or our support team.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                This reminder was sent automatically by the Pet Care System
              </p>
              <p style="color: #4caf50; font-size: 16px; margin: 0; font-weight: bold;">
                Keep your furry friend healthy and up-to-date with vaccinations! 🐾❤️
              </p>
            </div>

          </div>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: ownerEmail,
      subject,
      htmlContent,
    })
  }

  // Helper methods for vaccination emails
  getUrgencyColor(type) {
    const colors = {
      week_before: "#4caf50", // Green
      three_days_before: "#ff9800", // Orange
      one_day_before: "#f44336", // Red
      due_today: "#d32f2f", // Dark Red
    }
    return colors[type] || "#2196f3"
  }

  getUrgencyIcon(type) {
    const icons = {
      week_before: "📅",
      three_days_before: "⚠️",
      one_day_before: "🚨",
      due_today: "🔴",
    }
    return icons[type] || "💉"
  }

  getAlertBackground(type) {
    const backgrounds = {
      week_before: "#e8f5e8", // Light green
      three_days_before: "#fff3e0", // Light orange
      one_day_before: "#ffebee", // Light red
      due_today: "#ffebee", // Light red
    }
    return backgrounds[type] || "#e3f2fd"
  }

  getAlertBorder(type) {
    const borders = {
      week_before: "#4caf50",
      three_days_before: "#ff9800",
      one_day_before: "#f44336",
      due_today: "#d32f2f",
    }
    return borders[type] || "#2196f3"
  }

  getAlertTitle(type) {
    const titles = {
      week_before: "Upcoming Vaccination",
      three_days_before: "Vaccination Due Soon",
      one_day_before: "Urgent: Vaccination Due Tomorrow",
      due_today: "URGENT: Vaccination Due Today",
    }
    return titles[type] || "Vaccination Reminder"
  }

  getReminderMessage(type, petName) {
    const messages = {
      week_before: `${petName}'s vaccination is due in one week. This is a perfect time to schedule an appointment with your veterinarian to ensure availability.`,
      three_days_before: `${petName}'s vaccination is due in just 3 days! Please make sure you have an appointment scheduled. If not, contact your vet immediately.`,
      one_day_before: `${petName}'s vaccination is due tomorrow! Don't forget to take them to the vet. Make sure to bring their vaccination record.`,
      due_today: `${petName}'s vaccination is due TODAY! Please ensure they receive their vaccination as soon as possible to maintain their health protection.`,
    }
    return messages[type] || `Please schedule ${petName}'s vaccination appointment with your veterinarian.`
  }

  // Lost pet alert email
  async sendLostPetAlert({ ownerEmail, ownerName, petName, petDescription, contactInfo, location }) {
    const subject = `🚨 Lost Pet Alert: ${petName}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1>🐾 Lost Pet Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #e74c3c; margin-top: 0;">Missing: ${petName}</h2>
            
            <div style="margin: 15px 0;">
              <strong>Owner:</strong> ${ownerName}<br>
              <strong>Description:</strong> ${petDescription}<br>
              <strong>Last seen location:</strong> ${location}<br>
              <strong>Contact:</strong> ${contactInfo}
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>⚠️ If you have seen this pet:</strong><br>
              Please contact the owner immediately using the contact information above.
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666;">This alert was sent through the Pet Care System</p>
            </div>
          </div>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: ownerEmail,
      subject,
      htmlContent,
    })
  }

  // Send email when pet is found
  async sendFoundPetNotification({ ownerEmail, ownerName, petName, finderName, finderContact, message, location }) {
    const subject = `🎉 Great News! ${petName} May Have Been Found!`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 20px; text-align: center;">
          <h1>🎉 Pet Found Alert</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #00b894; margin-top: 0;">Good News About ${petName}!</h2>
            
            <p>Dear ${ownerName},</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Someone believes they may have found your pet!</strong>
            </div>
            
            <div style="margin: 15px 0;">
              <strong>Finder:</strong> ${finderName}<br>
              <strong>Contact:</strong> ${finderContact}<br>
              <strong>Location Found:</strong> ${location}<br>
              ${message ? `<strong>Message:</strong> ${message}<br>` : ""}
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>⚠️ Important:</strong><br>
              Please contact the finder immediately to verify if this is your pet. Always meet in a safe, public location.
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666;">This notification was sent through the Pet Care System</p>
            </div>
          </div>
        </div>
      </div>
    `

    return await this.sendEmail({
      to: ownerEmail,
      subject,
      htmlContent,
    })
  }
}

module.exports = new EmailService()
