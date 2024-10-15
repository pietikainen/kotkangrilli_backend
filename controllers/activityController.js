const Activity = require("../models/Activity");

exports.getActivitiesByEventId = async (req, res) => {
    const eventId = req.params.eventId;

    try {
      const activities = await Activity.query().where('eventId', eventId)
      if (!activities) {
        return res.status(404).json({
          success: false,
          message: 'Activities not found'
        });
      }
      res.status(200).json({
        success: true,
        data: activities
      });
    } catch(err) {
      res.status(500).json({
        success: false,
        message: 'Error getting activities',
        error: err.message
      });
    }
}

exports.addActivity = async (req, res) => {
    const eventId = req.params.eventId;
    const activity = req.body;

    try {
      const newActivity = await Activity.query().insert({
        eventId,
        ...activity
      });
      res.status(201).json({
        success: true,
        data: newActivity
      });
    } catch(err) {
      res.status(500).json({
        success: false,
        message: 'Error adding activity',
        error: err.message
      });
    }
}

exports.updateActivity = async (req, res) => {
    const activityId = req.params.activityId;
    const activity = req.body;

    try {
      const updatedActivity = await Activity.query().updateAndFetchById(activityId, {
        ...activity
      });
      res.status(200).json({
        success: true,
        data: updatedActivity
      });
    } catch(err) {
      res.status(500).json({
        success: false,
        message: 'Error updating activity',
        error: err.message
      });
    }
}

exports.deleteActivity = async (req, res) => {
    const activityId = req.params.activityId;

    try {
      await Activity.query().deleteById(activityId);
      res.status(200).json({
        success: true,
        message: 'Activity deleted'
      });
    } catch(err) {
      res.status(500).json({
        success: false,
        message: 'Error deleting activity',
        error: err.message
      });
    }
}
