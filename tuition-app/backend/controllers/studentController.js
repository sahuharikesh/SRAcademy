const Student    = require('../models/Student');
const Fee        = require('../models/Fee');
const Attendance = require('../models/Attendance');

const isValidMobile = (mobile) => /^[6-9][0-9]{9}$/.test((mobile || '').trim());

exports.getAll = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true, adminEmail: req.adminEmail }).sort({ createdAt: -1 });
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Student.distinct('groupNo', {
      isActive: true,
      adminEmail: req.adminEmail,
      groupNo: { $nin: ['', null] },
    });
    res.json(groups);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getByGroup = async (req, res) => {
  try {
    const students = await Student.find({ groupNo: req.params.groupNo, isActive: true, adminEmail: req.adminEmail });
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Student.updateMany(
      { groupNo: req.params.groupNo, adminEmail: req.adminEmail },
      { $set: { groupNo: '' } }
    );
    res.json({ message: 'Group deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { name, std } = req.body;
    const mobile = (req.body.mobile || '').replace(/\s+/g, '').trim();

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ error: 'Mobile number must be a valid 10-digit Indian number.' });
    }

    const existing = await Student.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      mobile,
      std: std.trim(),
      adminEmail: req.adminEmail,
    });
    if (existing) {
      return res.status(409).json({ error: 'A student with the same Name, Class, and Mobile already exists.' });
    }

    const student = await Student.create({ ...req.body, mobile, adminEmail: req.adminEmail });

    const admission = new Date(student.dateOfAdmission);
    const dueDay    = Math.max(1, admission.getDate() - 1);
    const dueDate   = new Date(admission.getFullYear(), admission.getMonth() + 1, dueDay);
    await Fee.create({
      studentId:  student._id,
      month:      dueDate.toLocaleString('default', { month: 'long' }),
      year:       dueDate.getFullYear(),
      dueDate,
      amount:     student.recommendedFees,
      status:     dueDate < new Date() ? 'Overdue' : 'Pending',
      adminEmail: req.adminEmail,
    });

    res.status(201).json(student);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.update = async (req, res) => {
  try {
    if (req.body.mobile !== undefined) {
      req.body.mobile = (req.body.mobile || '').replace(/\s+/g, '').trim();
      if (!isValidMobile(req.body.mobile)) {
        return res.status(400).json({ error: 'Mobile number must be a valid 10-digit Indian number.' });
      }
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, adminEmail: req.adminEmail },
      req.body,
      { new: true }
    );
    res.json(student);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Student.findOneAndUpdate({ _id: req.params.id, adminEmail: req.adminEmail }, { isActive: false });
    await Fee.deleteMany({ studentId: req.params.id, adminEmail: req.adminEmail });
    await Attendance.deleteMany({ studentId: req.params.id, adminEmail: req.adminEmail });
    res.json({ message: 'Student removed' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
