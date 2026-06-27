const express = require('express');
const router = express.Router();
const { createWorkshop, getWorkshops, deleteWorkshop, updateWorkshop } = require('../controllers/workshopController');

router.get('/', getWorkshops);
router.post('/', createWorkshop);
router.put('/:id', updateWorkshop); 
router.delete('/:id', deleteWorkshop);

module.exports = router;