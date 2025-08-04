const vaccinationReminderService = require("../services/vaccinationReminderService")

const getUpcomingVaccinations = async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days) || 30
    const upcomingVaccinations = await vaccinationReminderService.getUpcomingVaccinations(req.userData.userId, days)

    res.json({
      success: true,
      data: upcomingVaccinations,
      message: `Found ${upcomingVaccinations.length} upcoming vaccinations in the next ${days} days`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const triggerReminders = async (req, res) => {
  try {
    await vaccinationReminderService.checkAndSendReminders()
    res.json({
      success: true,
      message: "Vaccination reminders triggered successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const getVaccinationStats = async (req, res) => {
  try {
    const upcomingVaccinations = await vaccinationReminderService.getUpcomingVaccinations(req.userData.userId, 365)

    const stats = {
      totalUpcoming: upcomingVaccinations.length,
      dueThisWeek: upcomingVaccinations.filter((v) => v.daysUntilDue <= 7).length,
      dueThisMonth: upcomingVaccinations.filter((v) => v.daysUntilDue <= 30).length,
      overdue: upcomingVaccinations.filter((v) => v.daysUntilDue < 0).length,
    }

    res.json({
      success: true,
      data: stats,
      message: "Vaccination statistics retrieved successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  getUpcomingVaccinations,
  triggerReminders,
  getVaccinationStats,
}
