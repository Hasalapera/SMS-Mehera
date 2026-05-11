
const express = require('express');
const router = express.Router();
const { createCustomer, getAllCustomers, getCustomer, addNote, deleteNote, getCustomerCount,searchCustomers, reassignCustomers, assignSalesRep, getUnassignedCustomers, getCustomersByRep, getDeletedSalesReps, getReplacementCandidates  } = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/all', getAllCustomers);
router.get('/count', getCustomerCount);
router.post('/add', createCustomer);

//customer search
router.get('/search', verifyToken, searchCustomers);


// 1. කිසියම් සේල්ස් රෙප් කෙනෙකුට අදාළ කස්ටමර්ස්ලා ලිස්ට් එක ගැනීම
router.get('/by-rep/:repId', verifyToken, isAdmin, getCustomersByRep);

// 2. කිසිම රෙප් කෙනෙක්ට බාර දීලා නැති (Unassigned) කස්ටමර්ස්ලා ලිස්ට් එක
router.get('/unassigned/all', verifyToken, isAdmin, getUnassignedCustomers);

// 3. කස්ටමර් කෙනෙක්ව සේල්ස් රෙප් කෙනෙක්ට පවරන එක (Individual Assign)
router.post('/assign-rep', verifyToken, isAdmin, assignSalesRep);

// 4. සේල්ස් රෙප් කෙනෙක් අයින් වෙද්දී කස්ටමර්ස්ලා ඔක්කලම මාරු කිරීම (Bulk Reassign)
router.post('/reassign-bulk', verifyToken, isAdmin, reassignCustomers);

// 5. මකා දුන් සේල්ස් රෙප් කෙනෙක්ට අදාළ කස්ටමර්ස්ලා ගැනීම සහ ඔවුන් වෙනත් රෙප් කෙනෙක්ට පවරන එක (Get Deleted Rep's Customers & Reassign)
router.get('/deleted-reps', verifyToken, isAdmin, getDeletedSalesReps);

// 6. මකා දුන් සේල්ස් රෙප් කෙනෙක්ට අදාළ කස්ටමර්ස්ලා ගැනීම සහ ඔවුන් වෙනත් රෙප් කෙනෙක්ට පවරන එක (Get Replacement Candidates for Deleted Rep)
router.get('/replacement-candidates/:deletedRepId', verifyToken, isAdmin, getReplacementCandidates);

// Customer detail with notes
router.get('/:id', getCustomer);

// Note management
router.post('/:id/notes', verifyToken, addNote);
router.delete('/:id/notes/:noteId', verifyToken, deleteNote);

module.exports = router;

