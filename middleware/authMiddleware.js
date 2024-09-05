module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.status(401).json({ message: 'User is not authenticated' });
    },

    // At this time only to be used for comparing user id to user id in the request.
    isSelfOrAdmin: (req, res, next) => {
      if (req.isAuthenticated() && (req.user.id === req.params.id || req.user.userlevel >= 8)) {
        return next();
      }
      res.status(403).json({ message: 'Forbidden' });
    },

    isAdmin: (req, res, next) => {
      if (req.isAuthenticated() && req.user.userlevel >= 8) {
        return next();
      }
      res.status(403).json({ message: 'Forbidden' });
    }

  };
  