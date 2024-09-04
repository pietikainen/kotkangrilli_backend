module.exports = {
    ensureAdmin: (req, res, next) => {
        if (req.user.userlevel === 8 || req.user.userlevel === 9) {
            return next();
        }
        res.status(403).json({ message: 'Unauthorized.' });
    }
}