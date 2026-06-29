const Fee = require('../models/Fee');

// Cache: skip updateOverdue if already ran today for this admin
const _lastRun = {};

async function updateOverdue(adminEmail) {
  const todayKey = new Date().toISOString().slice(0, 10); // "2026-06-29"
  if (_lastRun[adminEmail] === todayKey) return;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await Promise.all([
    Fee.updateMany(
      { status: 'Pending', dueDate: { $gt: startOfToday }, adminEmail },
      { $set: { status: 'Upcoming' } }
    ),
    Fee.updateMany(
      { status: 'Upcoming', dueDate: { $lte: startOfToday }, adminEmail },
      { $set: { status: 'Pending' } }
    ),
  ]);
  // Run after the above so Pending→Overdue catches newly-set Pending too
  await Fee.updateMany(
    { status: 'Pending', dueDate: { $lt: startOfToday }, adminEmail },
    { $set: { status: 'Overdue' } }
  );

  _lastRun[adminEmail] = todayKey;
}

module.exports = { updateOverdue };

