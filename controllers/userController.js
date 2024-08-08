const User = require('../models/User');

exports.getUser = async (req, res) => {
  try {
    const user = await User.query().findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.query();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
};