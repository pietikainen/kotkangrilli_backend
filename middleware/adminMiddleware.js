module.exports = {
    ensureAdmin: (req, res, next) => {
        if (req.user.role === 8 || req.user.role === 9) {
            return next();
        }
        res.status(403).json({ message: 'Unauthorized.' });
    }
}