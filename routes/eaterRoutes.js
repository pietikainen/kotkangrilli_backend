// eaterRoutes.js
const eaterController = require('../controllers/eaterController');

const express = require('express');
const router = express.Router();

// POST: Eater to participate to meal
router.post('/meals/:mealId', eaterController.postEater);

// GET: Eaters per meal ID
router.get('/meals/:mealId', eaterController.getEaters);

// DELETE: Delete eater participation to meal
router.delete('/:id', eaterController.deleteEater);

// PATCH: Set eater as paid (default: 0, eater: 1, chefConfirmed: 2)
router.patch('/set-paid/:id', eaterController.setPaid);



module.exports = router;










