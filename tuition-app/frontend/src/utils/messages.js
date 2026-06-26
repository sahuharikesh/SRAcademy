import { UPI_ID, UPI_NAME, SCHOOL } from './constants';

export function buildUpiQrUrl(fee) {
  const note    = `${fee.studentId?.name} Class ${fee.studentId?.std} ${fee.month} ${fee.year} Fee`;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${fee.amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
}

export function buildFeeMsg(fee) {
  const s   = fee.studentId;
  const due = new Date(fee.dueDate).toLocaleDateString('en-IN');
  return (
    `*${SCHOOL}*\n` +
    `*--------------------*\n` +
    `*Fees Due Reminder*\n\n` +
    `Dear Parent of *${s?.name}*,\n\n` +
    `Student  : ${s?.name}\n` +
    `Class     : ${s?.std}\n` +
    `Month    : ${fee.month} ${fee.year}\n` +
    `Amount  : Rs. *${fee.amount}*\n` +
    `Due Date : *${due}*\n\n` +
    `*Pay via UPI:*\n` +
    `UPI ID : *${UPI_ID}*\n\n` +
    `*Scan QR to Pay Instantly:*\n` +
    `${buildUpiQrUrl(fee)}\n\n` +
    `_Kindly pay before the due date to avoid inconvenience._\n\n` +
    `Contact : *8422053851*\n` +
    `-- *${SCHOOL}*`
  );
}

export function buildGroupFeeMsg(students, fees) {
  const parent     = students[0];
  const totalDue   = students
    .flatMap((s) => fees.filter((f) => feeMatchesStudent(f, s) && f.status !== 'Paid'))
    .reduce((sum, f) => sum + f.amount, 0);
  const childLines = students.map((s) => {
    const amt = fees
      .filter((f) => feeMatchesStudent(f, s) && f.status !== 'Paid')
      .reduce((sum, f) => sum + f.amount, 0);
    return `  • ${s.name} (${s.std}) — Rs. ${amt}`;
  }).join('\n');

  return (
    `*${SCHOOL}*\n` +
    `*--------------------*\n` +
    `*Family Fees Reminder*\n\n` +
    `Dear Parent,\n\n` +
    `*Pending Fees:*\n${childLines}\n\n` +
    `*Total Due : Rs. ${totalDue}*\n\n` +
    `*Pay via UPI:*\n` +
    `UPI ID : *${UPI_ID}*\n\n` +
    `_Kindly pay before the due date._\n\n` +
    `Contact : *8422053851*\n` +
    `-- *${SCHOOL}*`
  );
}

export function feeMatchesStudent(fee, student) {
  const fid = fee.studentId?._id ?? fee.studentId;
  return String(fid) === String(student._id);
}
