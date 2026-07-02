const Fee              = require('../models/Fee');
const Student          = require('../models/Student');
const { updateOverdue }            = require('../utils/fees');
const { getPagination, paginateArray } = require('../utils/paginate');

exports.getAll = async (req, res) => {
  try {
    await updateOverdue(req.adminEmail);
    const fees = await Fee.find({ adminEmail: req.adminEmail })
      .populate({ path: 'studentId', select: 'name mobile std groupNo feeType isActive dateOfAdmission', match: { isActive: true } })
      .sort({ dueDate: 1 });
    const active = fees.filter((f) => f.studentId);

    // Group all fees by student for pending calculation
    const studentMap = {};
    active.forEach((f) => {
      const sid = f.studentId._id.toString();
      if (!studentMap[sid]) studentMap[sid] = [];
      studentMap[sid].push(f);
    });

    const result = active.map((f) => {
      const sid = f.studentId._id.toString();

      let lastPending = 0;
      const pendingBreakdown = [];

      // For every unpaid fee, show all OLDER fees that still have a balance
      if (f.status !== 'Paid') {
        (studentMap[sid] || []).forEach((sf) => {
          if (sf._id.toString() === f._id.toString()) return; // skip self
          if (new Date(sf.dueDate) >= new Date(f.dueDate)) return; // only older
          if (sf.status === 'Upcoming' || sf.status === 'No Due' || sf.status === 'Overdue') {
            lastPending += sf.amount;
            pendingBreakdown.push({ _id: sf._id, month: sf.month, year: sf.year, amount: sf.amount, paidAmount: 0, pending: sf.amount, status: sf.status });
          } else if (sf.status === 'Partial') {
            const diff = sf.amount - (sf.paidAmount || 0);
            lastPending += diff;
            pendingBreakdown.push({ _id: sf._id, month: sf.month, year: sf.year, amount: sf.amount, paidAmount: sf.paidAmount || 0, pending: diff, status: 'Partial' });
          }
        });
      }

      return { ...f.toObject(), lastPending, pendingBreakdown };
    });

    const { page, limit } = getPagination(req.query);

    const next7 = new Date();
    next7.setDate(next7.getDate() + 7);
    next7.setHours(23, 59, 59, 999);

    let filtered = result;
    // Always apply the 7-day window to Upcoming fees (both on All tab and Upcoming tab)
    filtered = filtered.filter(f => f.status !== 'Upcoming' || new Date(f.dueDate) <= next7);
    if (req.query.status && req.query.status !== 'All') filtered = filtered.filter(f => f.status === req.query.status);
    if (req.query.month)  filtered = filtered.filter(f => f.month === req.query.month);
    if (req.query.year)   filtered = filtered.filter(f => f.year  === Number(req.query.year));
    if (req.query.std)    filtered = filtered.filter(f => f.studentId?.std === req.query.std);
    if (req.query.feeType) filtered = filtered.filter(f => f.studentId?.feeType === req.query.feeType);

    res.json(paginateArray(filtered, page, limit));
  } catch (e) { res.status(500).json({ error: e.message }); }
};


exports.getSummary = async (req, res) => {
  try {
    const now       = new Date();
    const monthName = req.query.month || now.toLocaleString('default', { month: 'long' });
    const year      = now.getFullYear();
    const period    = req.query.period === 'yearly' ? 'yearly' : 'monthly';
    const planType  = period === 'yearly' ? 'Yearly' : 'Monthly';

    // Each period only concerns students on the matching fee plan.
    const planStudents  = await Student.find({ adminEmail: req.adminEmail, feeType: planType }, '_id');
    const planStudentIds = planStudents.map((s) => s._id);

    // Yearly mode scopes every card to the current year + Yearly-plan students;
    // monthly mode keeps card 1 scoped to the month while cards 2-4 stay
    // all-time, both restricted to Monthly-plan students.
    const periodMatch = period === 'yearly'
      ? { adminEmail: req.adminEmail, year, studentId: { $in: planStudentIds } }
      : { adminEmail: req.adminEmail, studentId: { $in: planStudentIds } };

    const [studentAgg, dueFees, aggFees] = await Promise.all([
      Student.aggregate([
        { $match: { isActive: true, adminEmail: req.adminEmail } },
        { $group: { _id: null, total: { $sum: '$recommendedFees' } } },
      ]),
      // Monthly Collection / Yearly Collection card
      Fee.aggregate([
        { $match: period === 'yearly'
          ? { adminEmail: req.adminEmail, year, studentId: { $in: planStudentIds } }
          : { adminEmail: req.adminEmail, month: monthName, year, studentId: { $in: planStudentIds } } },
        { $group: { _id: null, totalDue: { $sum: '$amount' } } },
      ]),
      // Paid / Still Pending (+ Upcoming & Overdue for monthly only)
      Fee.aggregate([
        { $match: periodMatch },
        { $group: {
          _id: null,
          // Overdue (full) + Partial (remaining) + Upcoming within 7 days (full) — monthly only
          totalUpcomingOverdue: {
            $sum: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$status', 'Overdue'] },
                    then: '$amount'
                  },
                  {
                    case: { $eq: ['$status', 'Partial'] },
                    then: { $subtract: ['$amount', { $ifNull: ['$paidAmount', 0] }] }
                  },
                  {
                    case: { $and: [
                      { $eq: ['$status', 'Upcoming'] },
                      { $lte: ['$dueDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] }
                    ]},
                    then: '$amount'
                  }
                ],
                default: 0
              }
            }
          },
          // Total collected = fully paid + partial payments made
          totalPaid: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Paid', 'Partial']] },
                { $ifNull: ['$paidAmount', 0] },
                0
              ]
            }
          },
          // Still pending = remaining unpaid on Overdue + Partial, plus flat
          // Pending (Yearly-plan cycles, which never move to Overdue/Upcoming)
          totalStillPending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Overdue', 'Partial', 'Pending']] },
                { $subtract: ['$amount', { $ifNull: ['$paidAmount', 0] }] },
                0
              ]
            }
          },
        }},
      ]),
    ]);

    const agg = aggFees[0] || {};

    res.json({
      allStudentsTotal:     studentAgg[0]?.total || 0,
      totalDue:             dueFees[0]?.totalDue || 0,
      totalUpcomingOverdue: agg.totalUpcomingOverdue || 0,
      totalPaid:            agg.totalPaid            || 0,
      totalStillPending:    agg.totalStillPending    || 0,
      month: monthName, year, period,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getByStudent = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId, adminEmail: req.adminEmail }).sort({ dueDate: -1 });
    res.json(fees);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.markPaid = async (req, res) => {
  try {
    // previousFees: [{ id, month, year, amount }] — fees cleared in same session
    const { payment, paidDate, previousFees = [] } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ error: 'Fee not found' });

    const totalPaid = (fee.paidAmount || 0) + Number(payment);
    const status    = totalPaid >= fee.amount ? 'Paid' : 'Partial';
    const paidOn    = paidDate || new Date();

    // Pay previous fees and collect their details for current fee's log
    const clearedPrevious = [];
    for (const pf of previousFees) {
      const prevFee = await Fee.findById(pf.id);
      if (!prevFee) continue;
      const prevTotal  = (prevFee.paidAmount || 0) + Number(pf.amount);
      const prevStatus = prevTotal >= prevFee.amount ? 'Paid' : 'Partial';
      await Fee.findByIdAndUpdate(pf.id, {
        paidAmount: Math.min(prevTotal, prevFee.amount),
        status: prevStatus,
        paidDate: paidOn,
        $push: { paymentLogs: { amount: Number(pf.amount), date: paidOn } },
      });
      clearedPrevious.push({ month: pf.month, year: pf.year, amount: Number(pf.amount) });
    }

    const prevTotal      = clearedPrevious.reduce((s, p) => s + p.amount, 0);
    const totalCollected = Number(payment) + prevTotal;

    const updated = await Fee.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paidAmount: Math.min(totalPaid, fee.amount),
        paidDate: paidOn,
        $push: {
          paymentLogs: {
            amount: Number(payment),
            date: paidOn,
            totalCollected: clearedPrevious.length > 0 ? totalCollected : undefined,
            clearedPrevious: clearedPrevious.length > 0 ? clearedPrevious : undefined,
          },
        },
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
        status:     { $in: ['No Due', 'Partial', 'Overdue', 'Upcoming'] },
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

// Creates the fee cycle if it's missing, or refreshes amount/dueDate/status
// on an existing *unpaid, untouched* cycle (e.g. recommendedFees changed).
// Never touches a cycle that already has payment progress (Paid/Partial).
// The filter+upsert is atomic, so running this twice at once (or twice in a
// row) can never create two rows for the same studentId+month+year.
async function upsertFeeCycle({ studentId, month, year, dueDate, amount, status, adminEmail }) {
  try {
    const result = await Fee.findOneAndUpdate(
      { studentId, month, year, adminEmail, status: { $nin: ['Paid', 'Partial'] } },
      {
        $setOnInsert: { studentId, month, year, adminEmail },
        $set: { dueDate, amount, status },
      },
      { upsert: true, includeResultMetadata: true }
    );
    return !result.lastErrorObject.updatedExisting;
  } catch (e) {
    if (e.code === 11000) return false; // already exists (paid/partial, or lost a race) — leave it alone
    throw e;
  }
}

exports.generate = async (req, res) => {
  try {
    const now    = new Date();
    const today  = new Date(now); today.setHours(23, 59, 59, 999);
    const next7  = new Date(now); next7.setDate(next7.getDate() + 7); next7.setHours(23, 59, 59, 999);
    const limit  = new Date(now); limit.setDate(limit.getDate() + 30); limit.setHours(23, 59, 59, 999);
    let created = 0;

    const monthlyStudents = await Student.find({ isActive: true, feeType: 'Monthly', adminEmail: req.adminEmail });
    for (const s of monthlyStudents) {
      const admission = new Date(s.dateOfAdmission);
      const dueDay = Math.max(1, admission.getDate() - 1);

      let cursor = new Date(admission.getFullYear(), admission.getMonth() + 1, dueDay);

      // Refresh past cycles (Overdue) + next 30 days (Pending/Upcoming)
      while (cursor <= limit) {
        const monthName = cursor.toLocaleString('default', { month: 'long' });
        const year      = cursor.getFullYear();
        // Upcoming = future AND within 7 days; Pending = future AND >7 days; Overdue = past
        const status = cursor <= today ? 'Overdue' : cursor <= next7 ? 'Upcoming' : 'No Due';
        if (await upsertFeeCycle({
          studentId: s._id, month: monthName, year, dueDate: new Date(cursor),
          amount: s.recommendedFees, status, adminEmail: req.adminEmail,
        })) created++;
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, dueDay);
      }
    }

    // Yearly-plan students: one cycle due at admission, renewing every 12
    // months. Status is always flat 'Pending' — no Overdue/Upcoming
    // date-window tracking (see utils/fees.js updateOverdue).
    const yearlyStudents = await Student.find({ isActive: true, feeType: 'Yearly', adminEmail: req.adminEmail });
    for (const s of yearlyStudents) {
      const admission = new Date(s.dateOfAdmission);
      let cursor = new Date(admission.getFullYear(), admission.getMonth(), admission.getDate());

      while (cursor <= limit) {
        const year = cursor.getFullYear();
        if (await upsertFeeCycle({
          studentId: s._id, month: 'Yearly', year, dueDate: new Date(cursor),
          amount: s.recommendedFees, status: 'Pending', adminEmail: req.adminEmail,
        })) created++;
        cursor = new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate());
      }
    }

    if (created === 0) {
      return res.json({ message: 'No Future Data Available' });
    }
    res.json({ message: `${created} fee record(s) generated.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
