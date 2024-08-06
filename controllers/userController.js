const User = require('../models/User');

exports.getUser = async (req, res) => {
  try {
    const user = await User.query().findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user' });
  }
};
