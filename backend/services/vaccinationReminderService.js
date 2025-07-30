const Pet = require("../models/petModel")
const User = require("../models/userModel")
const emailService = require("./emailService")
const cron = require("node-cron")

class VaccinationReminderService {
  constructor() {
    this.reminderIntervals = [
      { days: 7, type: "week_before" },
      { days: 3, type: "three_days_before" },
      { days: 1, type: "one_day_before" },
      { days: 0, type: "due_today" },
    ]
  }

 
  initializeCronJob() {
    
    cron.schedule("0 9 * * *", async () => {
      console.log("Running vaccination reminder check...")
      await this.checkAndSendReminders()
    })

  }

 
  async checkAndSendReminders() {
    try {
      for (const interval of this.reminderIntervals) {
        await this.sendRemindersForInterval(interval)
      }
    } catch (error) {
      console.error("Error in vaccination reminder service:", error)
    }
  }

  async sendRemindersForInterval(interval) {
    try {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + interval.days)

     
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const petsWithDueVaccinations = await Pet.find({
        "vaccinations.nextVaccDate": {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).populate("user", "name email")

      console.log(`Found ${petsWithDueVaccinations.length} pets with vaccinations due in ${interval.days} days`)

      for (const pet of petsWithDueVaccinations) {
        const dueVaccinations = pet.vaccinations.filter((vaccination) => {
          const vaccDate = new Date(vaccination.nextVaccDate)
          return vaccDate >= startOfDay && vaccDate <= endOfDay
        })

        if (dueVaccinations.length > 0 && pet.user) {
          await this.sendVaccinationReminder(pet, dueVaccinations, interval)
        }
      }
    } catch (error) {
      console.error(`Error sending reminders for ${interval.type}:`, error)
    }
  }

  // Send vaccination reminder email
  async sendVaccinationReminder(pet, dueVaccinations, interval) {
    try {
      const reminderType = this.getReminderTypeText(interval.type)

      await emailService.sendVaccinationReminder({
        ownerEmail: pet.user.email,
        ownerName: pet.user.name,
        petName: pet.name,
        petType: pet.petType,
        petBreed: pet.breed,
        petAge: this.calculateAge(pet.dob),
        vaccinations: dueVaccinations,
        reminderType: reminderType,
        intervalType: interval.type,
      })

      console.log(`Vaccination reminder sent to ${pet.user.email} for pet ${pet.name} (${interval.type})`)
    } catch (error) {
      console.error(`Error sending vaccination reminder for pet ${pet.name}:`, error)
    }
  }

  getReminderTypeText(type) {
    const types = {
      week_before: "Due in 1 Week",
      three_days_before: "Due in 3 Days",
      one_day_before: "Due Tomorrow",
      due_today: "Due Today",
    }
    return types[type] || "Vaccination Due"
  }

  calculateAge(dob) {
    const today = new Date()
    const birthDate = new Date(dob)
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? "s" : ""}`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      if (months === 0) {
        return `${years} year${years !== 1 ? "s" : ""}`
      } else {
        return `${years} year${years !== 1 ? "s" : ""} and ${months} month${months !== 1 ? "s" : ""}`
      }
    }
  }


  async sendTestReminder(petId) {
    try {
      const pet = await Pet.findById(petId).populate("user", "name email")
      if (!pet) {
        throw new Error("Pet not found")
      }

      if (pet.vaccinations.length === 0) {
        throw new Error("No vaccinations found for this pet")
      }

      // Send test reminder for the first vaccination
      await this.sendVaccinationReminder(pet, [pet.vaccinations[0]], { days: 1, type: "one_day_before" })
      return { success: true, message: "Test reminder sent successfully" }
    } catch (error) {
      console.error("Error sending test reminder:", error)
      throw error
    }
  }

  async getUpcomingVaccinations(userId, days = 30) {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const pets = await Pet.find({ user: userId }).populate("user", "name email")

      const upcomingVaccinations = []

      pets.forEach((pet) => {
        pet.vaccinations.forEach((vaccination) => {
          const vaccDate = new Date(vaccination.nextVaccDate)
          if (vaccDate >= new Date() && vaccDate <= futureDate) {
            upcomingVaccinations.push({
              petName: pet.name,
              petId: pet._id,
              vaccinationName: vaccination.name,
              dueDate: vaccination.nextVaccDate,
              daysUntilDue: Math.ceil((vaccDate - new Date()) / (1000 * 60 * 60 * 24)),
            })
          }
        })
      })

      return upcomingVaccinations.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    } catch (error) {
      console.error("Error getting upcoming vaccinations:", error)
      throw error
    }
  }
}

module.exports = new VaccinationReminderService()
