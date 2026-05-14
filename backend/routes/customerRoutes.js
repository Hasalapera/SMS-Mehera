
const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomer, addNote, deleteNote, getCustomerCount,searchCustomers, reassignCustomers, assignSalesRep, getUnassignedCustomers, getCustomersByRep, getDeletedSalesReps, getReplacementCandidates  } = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/all', getAllCustomers);
router.get('/count', getCustomerCount);
router.post('/add', createCustomer);

//customer search
router.get('/search', verifyToken, searchCustomers);


// 1. take customer that releted to sales rep and get those customers list (Get Customers by Sales Rep)
router.get('/by-rep/:repId', verifyToken, isAdmin, getCustomersByRep);

// 2. take unassigned customers list (Get Unassigned Customers) not belong to any sales rep 
router.get('/unassigned/all', verifyToken, isAdmin, getUnassignedCustomers);

// 3. assign customer to sales rep (Individual Assign)
router.post('/assign-rep', verifyToken, isAdmin, assignSalesRep);

// 4. change the customer base to another sales rep when sales rep changed (Bulk Reassign)
router.post('/reassign-bulk', verifyToken, isAdmin, reassignCustomers);

// 5. (Get Deleted Rep's Customers & Reassign)
router.get('/deleted-reps', verifyToken, isAdmin, getDeletedSalesReps);

// 6.take customers that who for deleted sales rep and reassign to another sales rep (Get Replacement Candidates for Deleted Rep)
router.get('/replacement-candidates/:deletedRepId', verifyToken, isAdmin, getReplacementCandidates);

// Customer detail with notes
router.get('/:id', getCustomer);

// Note management
router.post('/:id/notes', verifyToken, addNote);
router.delete('/:id/notes/:noteId', verifyToken, deleteNote);

module.exports = router;

