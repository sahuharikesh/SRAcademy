export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const STD_OPTIONS = [
  'Jr. KG','Sr. KG','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th',
];

export const ALL_CLASSES = STD_OPTIONS.slice(1);

export const EXAMS = [
  'Half Yearly Exam','Annual Exam','Unit Test 1','Unit Test 2',
  'Unit Test 3','Final Exam','Monthly Test','Weekly Test',
];

const LANG     = ['English','Marathi','Hindi'];
const HUMANITY = ['History/Civics','Geography','Sanskrit'];

const STD_SUBJECTS = {
  lower:  ['Maths','EVS-1','EVS-2',                     ...LANG            ],
  middle: ['Maths','Science',                            ...LANG,...HUMANITY],
  higher: ['Maths-1','Maths-2','Science-1','Science-2', ...LANG,...HUMANITY],
};

export const SUBJECTS = [...new Set(Object.values(STD_SUBJECTS).flat())];

export function getSubjectsForStd(std) {
  const i = STD_OPTIONS.indexOf(std);
  if (i <= 6)  return STD_SUBJECTS.lower;  // Jr.KG–5th
  if (i >= 10) return STD_SUBJECTS.higher; // 9th–10th
  return STD_SUBJECTS.middle;              // 6th–8th (or unknown)
}

export const MEDIUM_OPTIONS = ['Hindi', 'English', 'Semi-English'];

export const GOLD = { background: 'linear-gradient(135deg, var(--brand-gold, #C9A84C), color-mix(in srgb, var(--brand-gold, #C9A84C) 65%, white))', color: '#000' };
export const DARK = { background: 'var(--brand-dark, #1a1a1a)', color: 'var(--brand-gold, #C9A84C)', border: '1px solid var(--brand-gold, #C9A84C)' };

export const UPI_ID   = '8422053851@ybl';
export const UPI_NAME = 'Shree Ram Academy';
export const SCHOOL   = 'Shree Ram Academy';
