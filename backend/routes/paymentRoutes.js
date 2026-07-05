const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  updatePayment, 
  updateStatus,
  deletePayment,
} = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', createPayment);
router.get('/:id', getPayments);
router.put('/:id', updatePayment);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deletePayment);

module.exports = router;
