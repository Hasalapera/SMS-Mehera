
const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomer, addNote, deleteNote, getCustomerCount,searchCustomers } = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/all', getAllCustomers);
router.get('/count', getCustomerCount);
router.post('/add', createCustomer);

//customer search
router.get('/search', verifyToken, searchCustomers);

// Customer detail with notes
router.get('/:id', getCustomer);

// Note management
router.post('/:id/notes', verifyToken, addNote);
router.delete('/:id/notes/:noteId', verifyToken, deleteNote);

module.exports = router;

