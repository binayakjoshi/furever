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
