// controllers/memoController.js

const Memo = require('../models/Memo');

// GET:

exports.getAllMemos = async (req, res) => {
    try {
        const memos = await Memo.query()

        if (!memos) {
            return res.status(404).json({
                success: false,
                message: 'No memos found'
            })
        } else {
            return res.status(200).json({
                success: true,
                data: memos
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting memos',
            error: error.message
        })
    }
}