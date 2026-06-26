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

// Keep only the 2 most recent paid fees per student; delete older ones
async function cleanupOldPaidFees(adminEmail) {
  const paidFees = await Fee.find({ status: 'Paid', adminEmail })
    .sort({ dueDate: -1 })
    .select('_id studentId');

  const byStudent = {};
  paidFees.forEach((f) => {
    const sid = f.studentId.toString();
    if (!byStudent[sid]) byStudent[sid] = [];
    byStudent[sid].push(f._id);
  });

  const toDelete = [];
  Object.values(byStudent).forEach((ids) => {
    if (ids.length > 2) toDelete.push(...ids.slice(2));
  });

  if (toDelete.length > 0) {
    await Fee.deleteMany({ _id: { $in: toDelete } });
  }
}

module.exports = { updateOverdue, cleanupOldPaidFees };

