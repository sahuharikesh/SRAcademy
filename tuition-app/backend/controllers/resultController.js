const Result  = require('../models/Result');

// Save multiple subject marks for one student in one exam
exports.saveStudentMarks = async (req, res) => {
  try {
    const { studentId, examName, date, std, subjects } = req.body;
    // subjects: [{ subject, maxMarks, obtainedMarks, absent }]
    if (!studentId || !examName || !date || !std || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ops = subjects.map(({ subject, maxMarks, obtainedMarks, absent }) => ({
      updateOne: {
        filter: { studentId, examName, subject, adminEmail: req.adminEmail },
        update: {
          $set: {
            studentId, examName, subject, std,
            maxMarks:      Number(maxMarks),
            obtainedMarks: absent ? null : (obtainedMarks !== '' && obtainedMarks != null ? Number(obtainedMarks) : null),
            absent:        !!absent,
            date:          new Date(date),
            adminEmail:    req.adminEmail,
          },
        },
        upsert: true,
      },
    }));

    await Result.bulkWrite(ops);
    res.json({ message: 'Marks saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Get all results for a specific student (grouped by exam)
exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId, adminEmail: req.adminEmail })
      .sort({ date: -1, examName: 1 });
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// Delete one exam's all subjects for a student
exports.deleteStudentExam = async (req, res) => {
  try {
    const { studentId, examName } = req.body;
    if (!studentId || !examName) return res.status(400).json({ error: 'Missing fields' });
    await Result.deleteMany({ studentId, examName, adminEmail: req.adminEmail });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
