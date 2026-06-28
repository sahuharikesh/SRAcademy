const Fee              = require('../models/Fee');
const Student          = require('../models/Student');
const { updateOverdue }            = require('../utils/fees');
const { getPagination, paginateArray } = require('../utils/paginate');

exports.getAll = async (req, res) => {
  try {
    await updateOverdue(req.adminEmail);
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

    const { page, limit } = getPagination(req.query);

    let filtered = result;
    if (req.query.status && req.query.status !== 'All') filtered = filtered.filter(f => f.status === req.query.status);
    if (req.query.month)  filtered = filtered.filter(f => f.month === req.query.month);
    if (req.query.year)   filtered = filtered.filter(f => f.year  === Number(req.query.year));

    res.json(paginateArray(filtered, page, limit));
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
    const paidOn    = paidDate || new Date();

    const updated = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paidAmount: Math.min(totalPaid, fee.amount),
        paidDate: paidOn,
        $push: { paymentLogs: { amount: Number(payment), date: paidOn } },
      },
      { new: true }
    );

    // Apply excess to oldest pending/partial fee of same student
    let excess = totalPaid - fee.amount;
    if (excess > 0) {
      const pendingFees = await Fee.find({
        studentId:  fee.studentId,
        adminEmail: fee.adminEmail,
        _id:        { $ne: fee._id },
        status:     { $in: ['Pending', 'Partial', 'Overdue', 'Upcoming'] },
      }).sort({ dueDate: 1 });

      for (const pf of pendingFees) {
        if (excess <= 0) break;
        const alreadyPaid = pf.paidAmount || 0;
        const remaining   = pf.amount - alreadyPaid;
        const apply       = Math.min(excess, remaining);
        const newPaid     = alreadyPaid + apply;
        const newStatus   = newPaid >= pf.amount ? 'Paid' : 'Partial';
        await Fee.findByIdAndUpdate(pf._id, {
          paidAmount: newPaid,
          status:     newStatus,
          paidDate:   paidOn,
          $push: { paymentLogs: { amount: apply, date: paidOn } },
        });
        excess -= apply;
      }
    }

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


exports.remove = async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generate = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true, feeType: 'Monthly', adminEmail: req.adminEmail });
    const today = new Date(); today.setHours(23, 59, 59, 999);
    let created = 0;

    for (const s of students) {
      const admission = new Date(s.dateOfAdmission);
      // Due day = admission day - 1 (e.g. admitted 15th → due 14th of next month)
      const dueDay = Math.max(1, admission.getDate() - 1);

      // First expected fee is one month after admission
      let cursor = new Date(admission.getFullYear(), admission.getMonth() + 1, dueDay);

      // Generate ALL missing months from first due date up to today
      while (cursor <= today) {
        const monthName = cursor.toLocaleString('default', { month: 'long' });
        const year      = cursor.getFullYear();
        const exists    = await Fee.findOne({ studentId: s._id, month: monthName, year, adminEmail: req.adminEmail });
        if (!exists) {
          await Fee.create({
            studentId: s._id, month: monthName, year,
            dueDate: new Date(cursor),
            amount: s.recommendedFees, status: 'Overdue', adminEmail: req.adminEmail,
          });
          created++;
        }
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, dueDay);
      }
    }

    if (created === 0) {
      return res.json({ message: 'No Future Data Available' });
    }
    res.json({ message: `${created} fee record(s) generated.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
