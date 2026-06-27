const Fee = require('../models/Fee');

async function updateOverdue(adminEmail) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Old data fix: Pending with future due date → Upcoming
  await Fee.updateMany(
    { status: 'Pending', dueDate: { $gt: startOfToday }, adminEmail },
    { $set: { status: 'Upcoming' } }
  );
  // Upcoming → Pending when due date has arrived (today)
  await Fee.updateMany(
    { status: 'Upcoming', dueDate: { $lte: startOfToday }, adminEmail },
    { $set: { status: 'Pending' } }
  );
  // Pending → Overdue when due date is strictly before today
  await Fee.updateMany(
    { status: 'Pending', dueDate: { $lt: startOfToday }, adminEmail },
    { $set: { status: 'Overdue' } }
  );
}

module.exports = { updateOverdue };

