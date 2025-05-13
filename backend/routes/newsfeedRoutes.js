const express = require("express")
const router = express.Router()

// Define route handler with a callback function
router.get('/', (req, res) => {
    try {
        res.json({
            status: 'success',
            message: 'Newsfeed route working'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Add more routes as needed
router.get('/:id', (req, res) => {
    try {
        res.json({
            status: 'success',
            message: `Getting newsfeed with id: ${req.params.id}`
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router
