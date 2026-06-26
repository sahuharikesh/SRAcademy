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

    const [totalStudents, dueFees, todayPresent, todayAbsent] = await Promise.all([
      Student.countDocuments({ isActive: true, adminEmail: req.adminEmail }),
      Fee.countDocuments({ status: { $in: ['Pending', 'Overdue', 'Partial'] }, studentId: { $in: activeStudentIds }, adminEmail: req.adminEmail }),
      Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'Present', adminEmail: req.adminEmail }),
      Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'Absent', adminEmail: req.adminEmail }),
    ]);

    res.json({ totalStudents, dueFees, todayPresent, todayAbsent });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
