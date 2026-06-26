const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');

// Delete attendance records older than 6 months
async function cleanupOldAttendance(adminEmail) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  cutoff.setHours(0, 0, 0, 0);
  await Attendance.deleteMany({ date: { $lt: cutoff }, adminEmail });
}

const dayRange = (dateStr) => {
  const start = new Date(dateStr); start.setHours(0, 0, 0, 0);
  const end   = new Date(dateStr); end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.getByDate = async (req, res) => {
  try {
    await cleanupOldAttendance(req.adminEmail);
    const { start, end } = dayRange(req.params.date);
    const students = await Student.find({ isActive: true, adminEmail: req.adminEmail }).sort({ name: 1 });
    const records  = await Attendance.find({ date: { $gte: start, $lte: end }, adminEmail: req.adminEmail });

    const map = {};
    records.forEach((r) => { map[r.studentId.toString()] = r; });

    const result = students.map((s) => ({
      student:    s,
      attendance: map[s._id.toString()] || null,
    }));

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.saveBulk = async (req, res) => {
  try {
    const { date, records } = req.body;
    const { start, end }   = dayRange(date);
    const d = new Date(date); d.setHours(12, 0, 0, 0);

    const ops = records.map((r) => ({
      updateOne: {
        filter: { studentId: r.studentId, date: { $gte: start, $lte: end }, adminEmail: req.adminEmail },
        update: { $set: { studentId: r.studentId, date: d, status: r.status, notificationSent: false, adminEmail: req.adminEmail } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance saved' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.getAbsent = async (req, res) => {
  try {
    const { start, end } = dayRange(req.params.date);
    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
      status: 'Absent',
      adminEmail: req.adminEmail,
    }).populate('studentId', 'name mobile std groupNo');
    res.json(records);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year  = parseInt(req.query.year);

    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end   = new Date(year, month, 0, 23, 59, 59, 999);

    const [students, records] = await Promise.all([
      Student.find({ isActive: true, adminEmail: req.adminEmail }).sort({ name: 1 }),
      Attendance.find({ date: { $gte: start, $lte: end }, adminEmail: req.adminEmail }),
    ]);

    const byStudent = {};
    records.forEach((r) => {
      const id = r.studentId.toString();
      if (!byStudent[id]) byStudent[id] = [];
      byStudent[id].push(r);
    });

    const result = students.map((s) => {
      const recs    = byStudent[s._id.toString()] || [];
      const present = recs.filter((r) => r.status === 'Present');
      const absent  = recs.filter((r) => r.status === 'Absent');
      const late    = recs.filter((r) => r.status === 'Late');
      return {
        student:      { _id: s._id, name: s.name, std: s.std, groupNo: s.groupNo, mobile: s.mobile },
        totalPresent: present.length,
        totalAbsent:  absent.length,
        totalLate:    late.length,
        absentDates:  absent.map((r) => r.date),
        presentDates: present.map((r) => r.date),
        lateDates:    late.map((r) => r.date),
      };
    });

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.markNotified = async (req, res) => {
  try {
    const r = await Attendance.findByIdAndUpdate(req.params.id, { notificationSent: true }, { new: true });
    res.json(r);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
