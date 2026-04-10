const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomerCount } = require('../controllers/customerController');

router.get('/all', getAllCustomers);

// http://localhost:50001/api/customers/add
router.get('/count', getCustomerCount);
router.get('/all', getAllCustomers);
router.post('/add', createCustomer);

module.exports = router;