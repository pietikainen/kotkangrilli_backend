module.exports = {
    ensureAdmin: (req, res, next) => {
        if (req.user.role === 1001 || req.user.role === 2001) {
            return next();
        }
        res.status(403).json({ message: 'Unauthorized.' });
    }
}