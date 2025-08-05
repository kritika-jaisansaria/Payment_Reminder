const cron = require('node-cron');
const Payment = require('../models/Payment');
const sendMail = require('../utils/sendEmail');
const { generateEmail } = require('../emails/templates');

// ✅ Helper functions
function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ✅ Main logic to send reminders
const sendPaymentReminders = async () => {
  try {
    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    const payments = await Payment.find({
      status: 'pending',
      deadline: { $lte: twoDaysLater }
    }).populate('userId');

    for (let payment of payments) {
      const deadline = new Date(payment.deadline);
      const now = new Date();
      const email = payment.userId.email;

      if (isSameDay(deadline, now)) {
        await sendMail(email, 'Payment Due Today!', generateEmail(payment, 'due'));
      } else if (isSameDay(deadline, addDays(now, 2))) {
        await sendMail(email, 'Payment Due in 2 Days', generateEmail(payment, 'upcoming'));
      } else if (deadline < now) {
        await sendMail(email, 'Payment Overdue!', generateEmail(payment, 'overdue'));
        await Payment.findByIdAndUpdate(payment._id, { status: 'overdue' });
      }
    }

    console.log('✅ Email reminders sent.');
  } catch (err) {
    console.error('❌ Error in cron job:', err);
  }
};

// ✅ Exported start function for use in server.js
const start = () => {
  cron.schedule('41 17 * * *', () => {
      console.log('Running reminder cron at', new Date());
    sendPaymentReminders();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
};

module.exports = { start };
