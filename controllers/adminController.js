// adminController.js

const User = require('../models/User');
const Event = require('../models/Event');
const Location = require('../models/Location');
const Game = require('../models/Game');
const Participation = require('../models/Participation');


// Update user role
// 1: normal user, 1001: admin, 2001: superadmin
exports.updateUserRole = async (req, res) => {
    console.log("received PATCH request to /api/admin/user/:userId");
    const userId = req.params.userId;
    const { role } = req.body;

    try {
        const user = await User.query().findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = role;
        await user.$query().patch();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.log("error updating user role", error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
}