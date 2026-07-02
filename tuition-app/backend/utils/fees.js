const Fee     = require('../models/Fee');
const Student = require('../models/Student');

// Cache: skip updateOverdue if already ran today for this admin
const _lastRun = {};

async function updateOverdue(adminEmail) {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (_lastRun[adminEmail] === todayKey) return;

  // Yearly-plan students never have date-window statuses — normalize any
  // legacy/stray Upcoming/No Due/Overdue records to a flat Pending.
  const yearlyStudents = await Student.find({ adminEmail, feeType: 'Yearly' }, '_id');
  if (yearlyStudents.length) {
    await Fee.updateMany(
      { adminEmail, studentId: { $in: yearlyStudents.map((s) => s._id) }, status: { $in: ['Upcoming', 'No Due', 'Overdue'] } },
      { $set: { status: 'Pending' } }
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const next7 = new Date(startOfToday);
  next7.setDate(next7.getDate() + 7);
  next7.setHours(23, 59, 59, 999);

  await Promise.all([
    // Pending → Upcoming: only if due within next 7 days
    Fee.updateMany(
      { status: 'No Due', dueDate: { $gt: startOfToday, $lte: next7 }, adminEmail },
      { $set: { status: 'Upcoming' } }
    ),
    // Upcoming → Pending: if due date moved beyond 7 days (edge case)
    Fee.updateMany(
      { status: 'Upcoming', dueDate: { $gt: next7 }, adminEmail },
      { $set: { status: 'No Due' } }
    ),
    // Upcoming → Pending: if already past due (Overdue step below will catch it)
    Fee.updateMany(
      { status: 'Upcoming', dueDate: { $lte: startOfToday }, adminEmail },
      { $set: { status: 'No Due' } }
    ),
  ]);
  // Pending → Overdue: past due date
  await Fee.updateMany(
    { status: 'No Due', dueDate: { $lt: startOfToday }, adminEmail },
    { $set: { status: 'Overdue' } }
  );

  _lastRun[adminEmail] = todayKey;
}

function clearOverdueCache(adminEmail) {
  if (adminEmail) delete _lastRun[adminEmail];
  else Object.keys(_lastRun).forEach((k) => delete _lastRun[k]);
}

module.exports = { updateOverdue, clearOverdueCache };

