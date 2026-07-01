const Student          = require('../models/Student');
const Attendance       = require('../models/Attendance');
const Fee              = require('../models/Fee');
const { updateOverdue } = require('../utils/fees');

exports.getStats = async (req, res) => {
  try {
    await updateOverdue(req.adminEmail);

    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    const activeStudentIds = await Student.distinct('_id', { isActive: true, adminEmail: req.adminEmail });

    const [totalStudents, dueFees, todayPresent, todayAbsent, stdAgg] = await Promise.all([
      Student.countDocuments({ isActive: true, adminEmail: req.adminEmail }),
      Fee.countDocuments({ status: { $in: ['Overdue', 'Partial'] }, studentId: { $in: activeStudentIds }, adminEmail: req.adminEmail }),
      Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'Present', adminEmail: req.adminEmail }),
      Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'Absent', adminEmail: req.adminEmail }),
      Student.aggregate([
        { $match: { isActive: true, adminEmail: req.adminEmail } },
        { $group: { _id: '$std', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stdWiseCount = stdAgg.map(s => ({ std: s._id, count: s.count }));
    res.json({ totalStudents, dueFees, todayPresent, todayAbsent, stdWiseCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
