const Fee              = require('../models/Fee');
const Student          = require('../models/Student');
const QRCode           = require('qrcode');
const { updateOverdue, cleanupOldPaidFees } = require('../utils/fees');

exports.getAll = async (req, res) => {
  try {
    await updateOverdue(req.adminEmail);
    await cleanupOldPaidFees(req.adminEmail);
    const fees = await Fee.find({ adminEmail: req.adminEmail })
      .populate({ path: 'studentId', select: 'name mobile std groupNo feeType isActive', match: { isActive: true } })
      .sort({ dueDate: 1 });
    const active = fees.filter((f) => f.studentId);

    // Group all fees by student for pending calculation
    const studentMap = {};
    active.forEach((f) => {
      const sid = f.studentId._id.toString();
      if (!studentMap[sid]) studentMap[sid] = [];
      studentMap[sid].push(f);
    });

    // Latest fee per student (by dueDate) — only this row shows lastPending
    const latestFeeId = {};
    Object.entries(studentMap).forEach(([sid, sfees]) => {
      const latest = sfees.reduce((a, b) => new Date(a.dueDate) >= new Date(b.dueDate) ? a : b);
      latestFeeId[sid] = latest._id.toString();
    });

    const result = active.map((f) => {
      const sid      = f.studentId._id.toString();
      const isLatest = f._id.toString() === latestFeeId[sid];

      let lastPending = 0;
      const pendingBreakdown = [];

      if (isLatest) {
        (studentMap[sid] || []).forEach((sf) => {
          const isSelf = sf._id.toString() === f._id.toString();
          if ((sf.status === 'Upcoming' || sf.status === 'Pending' || sf.status === 'Overdue') && !isSelf) {
            lastPending += sf.amount;
            pendingBreakdown.push({ month: sf.month, year: sf.year, amount: sf.amount, paidAmount: 0, pending: sf.amount, status: sf.status });
          } else if (sf.status === 'Partial') {
            const diff = sf.amount - (sf.paidAmount || 0);
            lastPending += diff;
            pendingBreakdown.push({ month: sf.month, year: sf.year, amount: sf.amount, paidAmount: sf.paidAmount || 0, pending: diff, status: 'Partial' });
          }
        });
      }

      return { ...f.toObject(), lastPending, pendingBreakdown };
    });

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getDue = async (req, res) => {
  try {
    await updateOverdue(req.adminEmail);
    const next7days = new Date();
    next7days.setDate(next7days.getDate() + 7);
    const fees = await Fee.find({
      adminEmail: req.adminEmail,
      $or: [
        { status: { $in: ['Overdue', 'Pending', 'Partial'] } },
        { status: 'Upcoming', dueDate: { $lte: next7days } },
      ],
    })
      .populate({ path: 'studentId', select: 'name mobile std groupNo feeType actualFees recommendedFees isActive', match: { isActive: true } })
      .sort({ dueDate: 1 });
    res.json(fees.filter((f) => f.studentId));
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getByStudent = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId, adminEmail: req.adminEmail }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const fee = await Fee.create({ ...req.body, adminEmail: req.adminEmail });
    res.status(201).json(fee);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.markPaid = async (req, res) => {
  try {
    const { payment, paidDate } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ error: 'Fee not found' });
    const totalPaid = (fee.paidAmount || 0) + Number(payment);
    const status    = totalPaid >= fee.amount ? 'Paid' : 'Partial';
    const updated   = await Fee.findByIdAndUpdate(
      req.params.id,
      { status, paidAmount: totalPaid, paidDate: paidDate || new Date() },
      { new: true }
    );
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.markNotified = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, { notificationSent: true }, { new: true });
    res.json(fee);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateComments = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, { comments: req.body.comments ?? '' }, { new: true });
    res.json(fee);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getQR = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('studentId', 'name std');
    if (!fee) return res.status(404).json({ error: 'Fee not found' });
    const upiId   = process.env.UPI_ID   || 'yourname@upi';
    const upiName = process.env.UPI_NAME || 'Shree Ram Academy';
    const note    = `${fee.studentId.name} Class ${fee.studentId.std} ${fee.month} ${fee.year} Fee`;
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${fee.amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const qrDataUrl = await QRCode.toDataURL(upiLink, { width: 300, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
    res.json({ qr: qrDataUrl, upiId, upiName, amount: fee.amount, note });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generate = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true, feeType: 'Monthly', adminEmail: req.adminEmail });
    const now   = new Date();
    const next7 = new Date(); next7.setDate(now.getDate() + 7);
    let created = 0, skipped = 0;

    for (const s of students) {
      const admission = new Date(s.dateOfAdmission);
      const dueDay    = Math.max(1, admission.getDate() - 1);
      const lastFee   = await Fee.findOne({ studentId: s._id, adminEmail: req.adminEmail }).sort({ dueDate: -1 });

      let dueDate;
      if (lastFee) {
        // Next month after last fee
        dueDate = new Date(new Date(lastFee.dueDate).getFullYear(), new Date(lastFee.dueDate).getMonth() + 1, dueDay);
      } else {
        // New student — use current month's due date (may be past-due)
        dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        // If current month's due is still >7 days away, try previous month (already overdue)
        if (dueDate > next7) {
          dueDate = new Date(now.getFullYear(), now.getMonth() - 1, dueDay);
        }
      }

      if (dueDate > next7) { skipped++; continue; }

      const monthName = dueDate.toLocaleString('default', { month: 'long' });
      const year      = dueDate.getFullYear();
      const exists    = await Fee.findOne({ studentId: s._id, month: monthName, year, adminEmail: req.adminEmail });
      if (!exists) {
        await Fee.create({ studentId: s._id, month: monthName, year, dueDate, amount: s.recommendedFees, status: 'Upcoming', adminEmail: req.adminEmail });
        created++;
      }
    }
    res.json({ message: `${created} fee record(s) generated. ${skipped} student(s) skipped.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
