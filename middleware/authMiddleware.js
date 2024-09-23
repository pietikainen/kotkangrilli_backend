module.exports = {
  createAsyncCheck: (checkFn) => {
    return async (req, res, next) => {
      try {
        const isAllowed = await checkFn(req);
        if (isAllowed) {
          return next();
        }
        next('Forbidden');
      } catch (error) {
        next(error);
      }
    };
  },

  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({message: 'User is not authenticated'});
  },

  isAdmin: (req, res, next) => {
    if (req.user && req.user.userlevel >= 8) {
      return next();
    }
    res.status(403).json({message: 'Forbidden'});
  },

  isSelf: (idExtractor) => {
    return (req, res, next) => {
      if (req.user && req.user.id === idExtractor(req)) {
        return next();
      }
      res.status(403).json({message: 'Forbidden'});
    };
  },

  or: (...middlewares) => {
    return async (req, res, next) => {
      for (let middleware of middlewares) {
        try {
          await new Promise((resolve, reject) => {
            middleware(req, res, (err) => {
              if (err) reject(err); // If middleware fails, reject
              else resolve(); // If middleware succeeds, resolve
            });
          });
          return next(); // If any middleware succeeds, exit and proceed
        } catch (error) {
          // If middleware fails, continue to the next one
        }
      }
      // If all middlewares fail, send 403
      res.status(403).json({ message: 'Forbidden' });
    };
  }
};
