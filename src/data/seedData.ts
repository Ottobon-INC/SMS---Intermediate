import {
  Institution,
  Branch,
  AcademicYear,
  Programme,
  Batch,
  Section,
  Subject,
  User,
  Student,
  Guardian,
  StudentGuardianLink,
  Enrollment,
  FeeCategory,
  FeeStructure,
  FeeAssignment,
  FeePayment,
  FeeAdjustment,
  AttendanceSession,
  AttendanceEntry,
  Exam,
  ExamSubject,
  ExamSection,
  Mark,
  ResultPublication,
  ResultVersion,
  Circular,
  NotificationTemplate,
  NotificationEvent,
  AuditEvent,
  ImportBatch,
  ImportRow,
} from '@/src/types';

export const INSTITUTION_ID = 'inst-svic-01';
export const BRANCH_ID = 'branch-hyd-main';
export const ACADEMIC_YEAR_ID = 'ay-2026-2027';

export const seedInstitution: Institution = {
  id: INSTITUTION_ID,
  code: 'SVIC',
  name: 'Sri Vignan Intermediate College',
  board: 'Board of Intermediate Education',
  address: '12-3, Knowledge Park Road, Hyderabad, Telangana',
  phone: '+91 90000 10000',
  email: 'office@svic-demo.in',
  logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
  status: 'ACTIVE',
};

export const seedBranch: Branch = {
  id: BRANCH_ID,
  institutionId: INSTITUTION_ID,
  code: 'HYD-MAIN',
  name: 'Main Campus – Hyderabad',
  address: '12-3, Knowledge Park Road, Hyderabad, Telangana',
  phone: '+91 90000 10000',
  status: 'ACTIVE',
};

export const seedAcademicYear: AcademicYear = {
  id: ACADEMIC_YEAR_ID,
  institutionId: INSTITUTION_ID,
  name: '2026–2027',
  startDate: '2026-06-01',
  endDate: '2027-04-30',
  status: 'ACTIVE',
};

export const seedProgrammes: Programme[] = [
  { id: 'prog-mpc', institutionId: INSTITUTION_ID, code: 'MPC', name: 'Mathematics, Physics, Chemistry', yearLevel: 'First Year', status: 'ACTIVE' },
  { id: 'prog-bipc', institutionId: INSTITUTION_ID, code: 'BiPC', name: 'Biology, Physics, Chemistry', yearLevel: 'First Year', status: 'ACTIVE' },
  { id: 'prog-mec', institutionId: INSTITUTION_ID, code: 'MEC', name: 'Mathematics, Economics, Commerce', yearLevel: 'First Year', status: 'ACTIVE' },
  { id: 'prog-cec', institutionId: INSTITUTION_ID, code: 'CEC', name: 'Civics, Economics, Commerce', yearLevel: 'First Year', status: 'ACTIVE' },
];

export const seedBatches: Batch[] = [
  { id: 'batch-mpc-1', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-mpc', name: 'MPC First Year', status: 'ACTIVE' },
  { id: 'batch-bipc-1', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-bipc', name: 'BiPC First Year', status: 'ACTIVE' },
  { id: 'batch-mec-1', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-mec', name: 'MEC First Year', status: 'ACTIVE' },
  { id: 'batch-cec-1', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-cec', name: 'CEC First Year', status: 'ACTIVE' },
];

export const seedSections: Section[] = [
  { id: 'sec-mpc-a', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, batchId: 'batch-mpc-1', code: 'MPC-A', name: 'MPC-A', status: 'ACTIVE' },
  { id: 'sec-mpc-b', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, batchId: 'batch-mpc-1', code: 'MPC-B', name: 'MPC-B', status: 'ACTIVE' },
  { id: 'sec-bipc-a', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, batchId: 'batch-bipc-1', code: 'BiPC-A', name: 'BiPC-A', status: 'ACTIVE' },
  { id: 'sec-mec-a', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, batchId: 'batch-mec-1', code: 'MEC-A', name: 'MEC-A', status: 'ACTIVE' },
];

export const seedSubjects: Subject[] = [
  { id: 'sub-math', institutionId: INSTITUTION_ID, programmeId: 'prog-mpc', code: 'MATH', name: 'Mathematics', status: 'ACTIVE' },
  { id: 'sub-phy', institutionId: INSTITUTION_ID, programmeId: 'prog-mpc', code: 'PHY', name: 'Physics', status: 'ACTIVE' },
  { id: 'sub-chem', institutionId: INSTITUTION_ID, programmeId: 'prog-mpc', code: 'CHEM', name: 'Chemistry', status: 'ACTIVE' },
  { id: 'sub-bot', institutionId: INSTITUTION_ID, programmeId: 'prog-bipc', code: 'BOT', name: 'Botany', status: 'ACTIVE' },
  { id: 'sub-zoo', institutionId: INSTITUTION_ID, programmeId: 'prog-bipc', code: 'ZOO', name: 'Zoology', status: 'ACTIVE' },
  { id: 'sub-eng', institutionId: INSTITUTION_ID, programmeId: 'prog-mpc', code: 'ENG', name: 'English', status: 'ACTIVE' },
  { id: 'sub-eco', institutionId: INSTITUTION_ID, programmeId: 'prog-mec', code: 'ECO', name: 'Economics', status: 'ACTIVE' },
  { id: 'sub-com', institutionId: INSTITUTION_ID, programmeId: 'prog-mec', code: 'COM', name: 'Commerce', status: 'ACTIVE' },
  { id: 'sub-civ', institutionId: INSTITUTION_ID, programmeId: 'prog-cec', code: 'CIV', name: 'Civics', status: 'ACTIVE' },
];

export const seedGuardians: Guardian[] = [
  { id: 'guard-1', institutionId: INSTITUTION_ID, name: 'Mrs. Lakshmi Kumar', relationship: 'Mother', mobile: '+91 90000 20001', email: 'parent@demo-college.in', status: 'ACTIVE' },
  { id: 'guard-2', institutionId: INSTITUTION_ID, name: 'Mrs. Meena Sharma', relationship: 'Mother', mobile: '+91 90000 20002', email: 'meena.sharma@example.in', status: 'ACTIVE' },
  { id: 'guard-3', institutionId: INSTITUTION_ID, name: 'Mr. Ramesh Teja', relationship: 'Father', mobile: '+91 90000 20003', email: 'ramesh.teja@example.in', status: 'ACTIVE' },
  { id: 'guard-4', institutionId: INSTITUTION_ID, name: 'Mr. Venkat Reddy', relationship: 'Father', mobile: '+91 90000 20004', email: 'venkat.reddy@example.in', status: 'ACTIVE' },
  { id: 'guard-5', institutionId: INSTITUTION_ID, name: 'Mrs. Sunitha Varma', relationship: 'Mother', mobile: '+91 90000 20005', email: 'sunitha.varma@example.in', status: 'ACTIVE' },
  // Generate remaining guardians up to 25
  ...Array.from({ length: 20 }, (_, i) => {
    const idx = i + 6;
    return {
      id: `guard-${idx}`,
      institutionId: INSTITUTION_ID,
      name: `Guardian ${idx} Family`,
      relationship: (idx % 2 === 0 ? 'Father' : 'Mother') as 'Father' | 'Mother',
      mobile: `+91 90000 200${idx < 10 ? '0' + idx : idx}`,
      email: `guardian${idx}@example.in`,
      status: 'ACTIVE' as const,
    };
  }),
];

export const seedUsers: User[] = [
  {
    id: 'user-dean',
    institutionId: INSTITUTION_ID,
    fullName: 'Dr. Ananya Rao',
    email: 'dean@demo-college.in',
    mobile: '+91 90000 10001',
    role: 'INSTITUTION_ADMIN',
    status: 'ACTIVE',
    temporaryPassword: 'Demo@123',
    createdBy: 'SYSTEM',
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'user-principal',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    fullName: 'Mr. Raghav Reddy',
    email: 'principal@demo-college.in',
    mobile: '+91 90000 10002',
    role: 'BRANCH_ADMIN',
    status: 'ACTIVE',
    temporaryPassword: 'Demo@123',
    createdBy: 'user-dean',
    createdAt: '2026-05-02T00:00:00Z',
  },
  {
    id: 'user-office',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    fullName: 'Ms. Sushma Devi',
    email: 'office@demo-college.in',
    mobile: '+91 90000 10003',
    role: 'OFFICE_STAFF',
    status: 'ACTIVE',
    temporaryPassword: 'Demo@123',
    createdBy: 'user-principal',
    createdAt: '2026-05-03T00:00:00Z',
  },
  {
    id: 'user-parent',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    fullName: 'Mrs. Lakshmi Kumar',
    email: 'parent@demo-college.in',
    mobile: '+91 90000 20001',
    role: 'PARENT_GUARDIAN',
    status: 'ACTIVE',
    temporaryPassword: 'Demo@123',
    linkedGuardianId: 'guard-1',
    createdBy: 'user-principal',
    createdAt: '2026-05-04T00:00:00Z',
  },
];

const studentNames = [
  { first: 'Ravi', last: 'Kumar', gender: 'Male' },
  { first: 'Priya', last: 'Sharma', gender: 'Female' },
  { first: 'Arun', last: 'Teja', gender: 'Male' },
  { first: 'Sneha', last: 'Reddy', gender: 'Female' },
  { first: 'Karthik', last: 'Varma', gender: 'Male' },
  { first: 'Divya', last: 'Nair', gender: 'Female' },
  { first: 'Manoj', last: 'Sai', gender: 'Male' },
  { first: 'Pooja', last: 'Mehta', gender: 'Female' },
  { first: 'Rohit', last: 'Chandra', gender: 'Male' },
  { first: 'Kavya', last: 'Rao', gender: 'Female' },
  { first: 'Nikhil', last: 'Das', gender: 'Male' },
  { first: 'Swathi', last: 'Kiran', gender: 'Female' },
  { first: 'Ajay', last: 'Krishna', gender: 'Male' },
  { first: 'Meghana', last: 'Iyer', gender: 'Female' },
  { first: 'Harsha', last: 'Vardhan', gender: 'Male' },
  { first: 'Neha', last: 'Patel', gender: 'Female' },
  { first: 'Vamsi', last: 'Reddy', gender: 'Male' },
  { first: 'Aishwarya', last: 'Sen', gender: 'Female' },
  { first: 'Rahul', last: 'Verma', gender: 'Male' },
  { first: 'Keerthana', last: 'Rao', gender: 'Female' },
  { first: 'Sandeep', last: 'Kumar', gender: 'Male' },
  { first: 'Anjali', last: 'Menon', gender: 'Female' },
  { first: 'Tarun', last: 'Raj', gender: 'Male' },
  { first: 'Nandini', last: 'Shah', gender: 'Female' },
  { first: 'Vivek', last: 'Anand', gender: 'Male' },
];

export const seedStudents: Student[] = studentNames.map((s, i) => {
  const idx = i + 1;
  const numStr = idx < 10 ? `0${idx}` : `${idx}`;
  return {
    id: `student-${idx}`,
    institutionId: INSTITUTION_ID,
    admissionNumber: `SVI-2026-10${numStr}`,
    firstName: s.first,
    lastName: s.last,
    gender: s.gender as 'Male' | 'Female',
    dateOfBirth: `2009-0${(idx % 9) + 1}-15`,
    mobile: `+91 90000 100${numStr}`,
    status: 'ACTIVE',
  };
});

export const seedStudentGuardianLinks: StudentGuardianLink[] = seedStudents.map((st, i) => ({
  id: `link-${i + 1}`,
  institutionId: INSTITUTION_ID,
  studentId: st.id,
  guardianId: seedGuardians[i].id,
  isPrimary: true,
  portalEnabled: true,
  status: 'ACTIVE',
}));

export const seedEnrollments: Enrollment[] = seedStudents.map((st, i) => {
  const idx = i + 1;
  // 1 to 15 in MPC-A, 16 to 20 in MPC-B, 21-23 BiPC-A, 24-25 MEC-A
  let secId = 'sec-mpc-a';
  let batchId = 'batch-mpc-1';
  let progId = 'prog-mpc';
  let secCode = 'MPC-A';

  if (idx > 15 && idx <= 20) {
    secId = 'sec-mpc-b';
    secCode = 'MPC-B';
  } else if (idx > 20 && idx <= 23) {
    secId = 'sec-bipc-a';
    batchId = 'batch-bipc-1';
    progId = 'prog-bipc';
    secCode = 'BiPC-A';
  } else if (idx > 23) {
    secId = 'sec-mec-a';
    batchId = 'batch-mec-1';
    progId = 'prog-mec';
    secCode = 'MEC-A';
  }

  const rollStr = idx < 10 ? `0${idx}` : `${idx}`;
  return {
    id: `enroll-${idx}`,
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: st.id,
    academicYearId: ACADEMIC_YEAR_ID,
    programmeId: progId,
    batchId: batchId,
    sectionId: secId,
    rollNumber: `${secCode}-${rollStr}`,
    yearLevel: 'First Year',
    status: 'ACTIVE',
  };
});

export const seedFeeCategories: FeeCategory[] = [
  { id: 'feecat-1', institutionId: INSTITUTION_ID, name: 'Tuition Fee', description: 'Core academic tuition fee for First Year', status: 'ACTIVE' },
  { id: 'feecat-2', institutionId: INSTITUTION_ID, name: 'Admission Fee', description: 'One-time admission and registration charge', status: 'ACTIVE' },
  { id: 'feecat-3', institutionId: INSTITUTION_ID, name: 'Examination Fee', description: 'Board and internal examination assessment charges', status: 'ACTIVE' },
  { id: 'feecat-4', institutionId: INSTITUTION_ID, name: 'Transport Fee', description: 'College bus facility charges', status: 'ACTIVE' },
  { id: 'feecat-5', institutionId: INSTITUTION_ID, name: 'Hostel Fee', description: 'Campus hostel and boarding facility', status: 'ACTIVE' },
  { id: 'feecat-6', institutionId: INSTITUTION_ID, name: 'Other Fee', description: 'Lab, library, and extracurricular amenities', status: 'ACTIVE' },
];

export const seedFeeStructures: FeeStructure[] = [
  { id: 'feestruct-1', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-mpc', yearLevel: 'First Year', feeCategoryId: 'feecat-1', amount: 40000, dueDate: '2026-08-15', instalmentName: 'Instalment 1', status: 'ACTIVE' },
  { id: 'feestruct-2', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-mpc', yearLevel: 'First Year', feeCategoryId: 'feecat-2', amount: 5000, dueDate: '2026-06-30', instalmentName: 'Full Payment', status: 'ACTIVE' },
  { id: 'feestruct-3', institutionId: INSTITUTION_ID, branchId: BRANCH_ID, academicYearId: ACADEMIC_YEAR_ID, programmeId: 'prog-mpc', yearLevel: 'First Year', feeCategoryId: 'feecat-3', amount: 2000, dueDate: '2026-09-15', instalmentName: 'Term 1 Exam', status: 'ACTIVE' },
];

export const seedFeeAssignments: FeeAssignment[] = seedEnrollments.map((en, i) => {
  const idx = i + 1;
  const assigned = 45000;
  let paid = 45000;
  let status: FeeAssignment['status'] = 'PAID';

  if (idx === 1) { // Ravi Kumar
    paid = 32500;
    status = 'PARTIALLY_PAID';
  } else if (idx % 4 === 0) { // Unpaid / Overdue
    paid = 0;
    status = idx % 8 === 0 ? 'OVERDUE' : 'UNPAID';
  } else if (idx % 3 === 0) { // Partially paid
    paid = 20000;
    status = 'PARTIALLY_PAID';
  }

  return {
    id: `feeassign-${idx}`,
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    enrollmentId: en.id,
    studentId: en.studentId,
    feeStructureId: 'feestruct-1',
    description: 'First Year Tuition & Admission Fee',
    assignedAmount: assigned,
    paidAmount: paid,
    balanceAmount: assigned - paid,
    dueDate: '2026-08-15',
    status,
    createdBy: 'user-office',
    createdAt: '2026-06-05T10:00:00Z',
  };
});

export const seedFeePayments: FeePayment[] = [
  {
    id: 'pay-1',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    feeAssignmentId: 'feeassign-1',
    studentId: 'student-1',
    amount: 10000,
    paymentDate: '2026-08-06',
    paymentMode: 'UPI',
    referenceNumber: 'UPI/623100829101',
    receiptNumber: 'SVI-2026-00125',
    notes: 'Advance tuition payment via PhonePe',
    recordedBy: 'user-office',
    createdAt: '2026-08-06T11:20:00Z',
  },
  {
    id: 'pay-2',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    feeAssignmentId: 'feeassign-1',
    studentId: 'student-1',
    amount: 22500,
    paymentDate: '2026-06-10',
    paymentMode: 'Cash',
    referenceNumber: 'CASH-1002',
    receiptNumber: 'SVI-2026-00088',
    notes: 'Initial admission cash payment',
    recordedBy: 'user-office',
    createdAt: '2026-06-10T09:30:00Z',
  },
  {
    id: 'pay-3',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    feeAssignmentId: 'feeassign-2',
    studentId: 'student-2',
    amount: 45000,
    paymentDate: '2026-06-12',
    paymentMode: 'Bank Transfer',
    referenceNumber: 'NEFT/SBN8291029',
    receiptNumber: 'SVI-2026-00092',
    notes: 'Full fee cleared via SBI net banking',
    recordedBy: 'user-office',
    createdAt: '2026-06-12T14:15:00Z',
  },
];

export const seedFeeAdjustments: FeeAdjustment[] = [
  {
    id: 'adj-1',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    feeAssignmentId: 'feeassign-3',
    type: 'Discount',
    amount: 5000,
    reason: 'Merit scholarship discount for top 10% entrance rank holder',
    status: 'APPROVED',
    requestedBy: 'user-office',
    approvedBy: 'user-principal',
    requestedAt: '2026-06-15T10:00:00Z',
    approvedAt: '2026-06-16T11:30:00Z',
    beforeValue: 45000,
    afterValue: 40000,
  },
];

const dates = ['2026-07-30', '2026-07-31', '2026-08-01', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06'];

export const seedAttendanceSessions: AttendanceSession[] = dates.map((d, i) => ({
  id: `att-sess-${i + 1}`,
  institutionId: INSTITUTION_ID,
  branchId: BRANCH_ID,
  academicYearId: ACADEMIC_YEAR_ID,
  programmeId: 'prog-mpc',
  batchId: 'batch-mpc-1',
  sectionId: 'sec-mpc-a',
  attendanceDate: d,
  status: 'FINALIZED',
  submittedBy: 'user-office',
  submittedAt: `${d}T09:30:00Z`,
  finalizedBy: 'user-principal',
  finalizedAt: `${d}T10:00:00Z`,
  version: 1,
}));

// Add a pending finalization session for today
seedAttendanceSessions.push({
  id: 'att-sess-draft',
  institutionId: INSTITUTION_ID,
  branchId: BRANCH_ID,
  academicYearId: ACADEMIC_YEAR_ID,
  programmeId: 'prog-mpc',
  batchId: 'batch-mpc-1',
  sectionId: 'sec-mpc-b',
  attendanceDate: '2026-08-06',
  status: 'SUBMITTED',
  submittedBy: 'user-office',
  submittedAt: '2026-08-06T10:15:00Z',
  version: 1,
});

export const seedAttendanceEntries: AttendanceEntry[] = [];
seedAttendanceSessions.slice(0, 7).forEach((sess) => {
  seedEnrollments.filter(e => e.sectionId === 'sec-mpc-a').forEach((en) => {
    let st: AttendanceEntry['status'] = 'PRESENT';
    if (en.studentId === 'student-1') { // Ravi Kumar
      if (sess.attendanceDate === '2026-08-01') st = 'ABSENT';
      if (sess.attendanceDate === '2026-08-04') st = 'LEAVE';
    } else if (en.studentId === 'student-3' && sess.attendanceDate === '2026-08-06') {
      st = 'ABSENT';
    }
    seedAttendanceEntries.push({
      id: `att-entry-${sess.id}-${en.id}`,
      attendanceSessionId: sess.id,
      enrollmentId: en.id,
      studentId: en.studentId,
      status: st,
    });
  });
});

export const seedExams: Exam[] = [
  {
    id: 'exam-1',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    academicYearId: ACADEMIC_YEAR_ID,
    programmeId: 'prog-mpc',
    name: 'Monthly Test 1',
    type: 'Monthly Assessment',
    examDate: '2026-07-25',
    marksEntryDeadline: '2026-07-28',
    status: 'PUBLISHED',
    createdBy: 'user-principal',
    createdAt: '2026-07-15T09:00:00Z',
  },
  {
    id: 'exam-2',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    academicYearId: ACADEMIC_YEAR_ID,
    programmeId: 'prog-mpc',
    name: 'Unit Test 2',
    type: 'Unit Assessment',
    examDate: '2026-08-05',
    marksEntryDeadline: '2026-08-08',
    status: 'SUBMITTED',
    createdBy: 'user-principal',
    createdAt: '2026-08-01T09:00:00Z',
  },
];

export const seedExamSubjects: ExamSubject[] = [
  { id: 'exsub-1', examId: 'exam-1', subjectId: 'sub-math', maximumMarks: 100, passMarks: 35 },
  { id: 'exsub-2', examId: 'exam-1', subjectId: 'sub-phy', maximumMarks: 100, passMarks: 35 },
  { id: 'exsub-3', examId: 'exam-1', subjectId: 'sub-chem', maximumMarks: 100, passMarks: 35 },
  { id: 'exsub-4', examId: 'exam-1', subjectId: 'sub-eng', maximumMarks: 100, passMarks: 35 },

  { id: 'exsub-5', examId: 'exam-2', subjectId: 'sub-math', maximumMarks: 50, passMarks: 18 },
  { id: 'exsub-6', examId: 'exam-2', subjectId: 'sub-phy', maximumMarks: 50, passMarks: 18 },
  { id: 'exsub-7', examId: 'exam-2', subjectId: 'sub-chem', maximumMarks: 50, passMarks: 18 },
  { id: 'exsub-8', examId: 'exam-2', subjectId: 'sub-eng', maximumMarks: 50, passMarks: 18 },
];

export const seedExamSections: ExamSection[] = [
  { id: 'exsec-1', examId: 'exam-1', batchId: 'batch-mpc-1', sectionId: 'sec-mpc-a' },
  { id: 'exsec-2', examId: 'exam-2', batchId: 'batch-mpc-1', sectionId: 'sec-mpc-a' },
];

export const seedMarks: Mark[] = [];
// For Exam 1 (MPC-A students)
seedEnrollments.filter(e => e.sectionId === 'sec-mpc-a').forEach((en) => {
  let math = 82, phy = 75, chem = 79, eng = 80;
  if (en.studentId === 'student-1') { // Ravi Kumar: 316/400 = 79% (Pass, B)
    math = 82; phy = 75; chem = 79; eng = 80;
  } else if (en.studentId === 'student-2') {
    math = 92; phy = 90; chem = 88; eng = 94; // 364/400 A+
  } else if (en.studentId === 'student-3') {
    math = 40; phy = 36; chem = 38; eng = 50;
  }

  seedMarks.push(
    { id: `mark-ex1-math-${en.id}`, examId: 'exam-1', examSubjectId: 'exsub-1', enrollmentId: en.id, studentId: en.studentId, marksObtained: math, status: 'PUBLISHED', enteredBy: 'user-office', updatedAt: '2026-07-27T10:00:00Z' },
    { id: `mark-ex1-phy-${en.id}`, examId: 'exam-1', examSubjectId: 'exsub-2', enrollmentId: en.id, studentId: en.studentId, marksObtained: phy, status: 'PUBLISHED', enteredBy: 'user-office', updatedAt: '2026-07-27T10:00:00Z' },
    { id: `mark-ex1-chem-${en.id}`, examId: 'exam-1', examSubjectId: 'exsub-3', enrollmentId: en.id, studentId: en.studentId, marksObtained: chem, status: 'PUBLISHED', enteredBy: 'user-office', updatedAt: '2026-07-27T10:00:00Z' },
    { id: `mark-ex1-eng-${en.id}`, examId: 'exam-1', examSubjectId: 'exsub-4', enrollmentId: en.id, studentId: en.studentId, marksObtained: eng, status: 'PUBLISHED', enteredBy: 'user-office', updatedAt: '2026-07-27T10:00:00Z' }
  );
});

export const seedResultPublications: ResultPublication[] = [
  {
    id: 'respub-1',
    examId: 'exam-1',
    sectionId: 'sec-mpc-a',
    status: 'PUBLISHED',
    approvedBy: 'user-principal',
    approvedAt: '2026-07-28T11:00:00Z',
    publishedBy: 'user-principal',
    publishedAt: '2026-07-28T12:00:00Z',
    version: 1,
  },
];

export const seedResultVersions: ResultVersion[] = [
  {
    id: 'resver-1-st1',
    resultPublicationId: 'respub-1',
    studentId: 'student-1',
    version: 1,
    subjectResults: [
      { subjectId: 'sub-math', subjectName: 'Mathematics', marksObtained: 82, maximumMarks: 100, passMarks: 35, isPass: true },
      { subjectId: 'sub-phy', subjectName: 'Physics', marksObtained: 75, maximumMarks: 100, passMarks: 35, isPass: true },
      { subjectId: 'sub-chem', subjectName: 'Chemistry', marksObtained: 79, maximumMarks: 100, passMarks: 35, isPass: true },
      { subjectId: 'sub-eng', subjectName: 'English', marksObtained: 80, maximumMarks: 100, passMarks: 35, isPass: true },
    ],
    totalMarks: 316,
    maximumMarks: 400,
    percentage: 79,
    grade: 'B',
    resultStatus: 'Pass',
    createdAt: '2026-07-28T12:00:00Z',
  },
];

export const seedCirculars: Circular[] = [
  {
    id: 'circ-1',
    institutionId: INSTITUTION_ID,
    title: 'Independence Day Celebrations & College Holiday',
    message: 'The college will remain closed on 15 August 2026 for Independence Day. Flag hoisting starts at 8:00 AM. Regular classes will resume on 16 August 2026.',
    category: 'Holiday',
    audienceType: 'All',
    status: 'PUBLISHED',
    publishedAt: '2026-08-01T09:00:00Z',
    createdBy: 'user-dean',
    createdAt: '2026-08-01T08:30:00Z',
  },
  {
    id: 'circ-2',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    sectionId: 'sec-mpc-a',
    title: 'Parent-Teacher Interaction for MPC First Year (Section A)',
    message: 'A mandatory Parent-Teacher Interaction meeting is scheduled for MPC-A parents on Saturday, 10 August 2026 at 10:00 AM to review Monthly Test 1 academic progress.',
    category: 'Academic',
    audienceType: 'Section',
    status: 'PUBLISHED',
    publishedAt: '2026-08-02T10:00:00Z',
    createdBy: 'user-principal',
    createdAt: '2026-08-02T09:15:00Z',
  },
  {
    id: 'circ-3',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    title: 'First Term Examination Fee Payment Reminder',
    message: 'Parents are requested to clear all outstanding tuition and examination fee instalments before 15 August 2026 to avoid late payment penalties.',
    category: 'Fee Notice',
    audienceType: 'Branch',
    status: 'PUBLISHED',
    publishedAt: '2026-08-03T11:00:00Z',
    createdBy: 'user-principal',
    createdAt: '2026-08-03T10:00:00Z',
  },
  {
    id: 'circ-4',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    title: 'Physics & Chemistry Laboratory Practical Schedule Update',
    message: 'Updated batch schedules for First Year laboratory sessions are prepared and will take effect from Monday.',
    category: 'Academic',
    audienceType: 'Branch',
    status: 'DRAFT',
    createdBy: 'user-office',
    createdAt: '2026-08-05T14:00:00Z',
  },
];

export const seedNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'notif-tpl-att-absent',
    institutionId: INSTITUTION_ID,
    templateCode: 'TPL_ATT_ABSENT',
    eventType: 'ATTENDANCE_ABSENCE',
    language: 'English',
    messageBody: 'Dear {{guardian_name}},\n\n{{student_name}} was marked absent on {{date}} at {{institution_name}}, {{branch_name}}.\n\nPlease contact the college office if clarification is required.',
    requiredVariables: ['guardian_name', 'student_name', 'date', 'institution_name', 'branch_name'],
    status: 'ACTIVE',
  },
  {
    id: 'notif-tpl-fee-due',
    institutionId: INSTITUTION_ID,
    templateCode: 'TPL_FEE_DUE',
    eventType: 'FEE_DUE_REMINDER',
    language: 'English',
    messageBody: 'Dear {{guardian_name}},\n\nAn outstanding fee amount of ₹{{amount}} for {{student_name}} is due on {{due_date}}.\n\nRegards,\n{{institution_name}}',
    requiredVariables: ['guardian_name', 'amount', 'student_name', 'due_date', 'institution_name'],
    status: 'ACTIVE',
  },
  {
    id: 'notif-tpl-fee-pay',
    institutionId: INSTITUTION_ID,
    templateCode: 'TPL_FEE_PAYMENT',
    eventType: 'PAYMENT_CONFIRMATION',
    language: 'English',
    messageBody: 'Dear {{guardian_name}},\n\nA payment of ₹{{amount}} has been recorded for {{student_name}} on {{payment_date}}.\n\nReceipt: {{receipt_number}}\nRemaining balance: ₹{{balance}}\n\nRegards,\n{{institution_name}}',
    requiredVariables: ['guardian_name', 'amount', 'student_name', 'payment_date', 'receipt_number', 'balance', 'institution_name'],
    status: 'ACTIVE',
  },
  {
    id: 'notif-tpl-res-pub',
    institutionId: INSTITUTION_ID,
    templateCode: 'TPL_RESULT_PUBLISHED',
    eventType: 'EXAM_RESULT_PUBLISHED',
    language: 'English',
    messageBody: 'Dear {{guardian_name}},\n\nThe result for {{student_name}} in {{exam_name}} has been published.\n\nTotal: {{total_marks}} / {{max_marks}}\nPercentage: {{percentage}}%\nResult: {{result_status}}\n\nRegards,\n{{institution_name}}',
    requiredVariables: ['guardian_name', 'student_name', 'exam_name', 'total_marks', 'max_marks', 'percentage', 'result_status', 'institution_name'],
    status: 'ACTIVE',
  },
  {
    id: 'notif-tpl-circ-pub',
    institutionId: INSTITUTION_ID,
    templateCode: 'TPL_CIRCULAR_PUBLISHED',
    eventType: 'CIRCULAR_PUBLISHED',
    language: 'English',
    messageBody: 'Dear Parent,\n\n{{circular_message}}\n\nRegards,\n{{institution_name}}',
    requiredVariables: ['circular_message', 'institution_name'],
    status: 'ACTIVE',
  },
];

export const seedNotificationEvents: NotificationEvent[] = [
  {
    id: 'nevent-1',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: 'student-1',
    guardianId: 'guard-1',
    sourceModule: 'Attendance',
    sourceRecordId: 'att-sess-3',
    eventType: 'ATTENDANCE_ABSENCE',
    recipientMobile: '+91 90000 20001',
    resolvedMessage: 'Dear Mrs. Lakshmi,\n\nRavi Kumar was marked absent on 1 Aug 2026 at Sri Vignan Intermediate College, Main Campus.\n\nPlease contact the college office if clarification is required.',
    status: 'DELIVERED',
    providerMessageId: 'WA-MSG-88192031',
    createdAt: '2026-08-01T10:05:00Z',
    sentAt: '2026-08-01T10:05:02Z',
    deliveredAt: '2026-08-01T10:05:05Z',
    retryCount: 0,
  },
  {
    id: 'nevent-2',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: 'student-1',
    guardianId: 'guard-1',
    sourceModule: 'Fees',
    sourceRecordId: 'pay-1',
    eventType: 'PAYMENT_CONFIRMATION',
    recipientMobile: '+91 90000 20001',
    resolvedMessage: 'Dear Mrs. Lakshmi,\n\nA payment of ₹10,000 has been recorded for Ravi Kumar on 6 Aug 2026.\n\nReceipt: SVI-2026-00125\nRemaining balance: ₹12,500\n\nRegards,\nSri Vignan Intermediate College',
    status: 'DELIVERED',
    providerMessageId: 'WA-MSG-88192099',
    createdAt: '2026-08-06T11:21:00Z',
    sentAt: '2026-08-06T11:21:02Z',
    deliveredAt: '2026-08-06T11:21:04Z',
    retryCount: 0,
  },
  {
    id: 'nevent-3',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: 'student-1',
    guardianId: 'guard-1',
    sourceModule: 'Fees',
    sourceRecordId: 'feeassign-1',
    eventType: 'FEE_DUE_REMINDER',
    recipientMobile: '+91 90000 20001',
    resolvedMessage: 'Dear Mrs. Lakshmi,\n\nAn outstanding fee amount of ₹12,500 for Ravi Kumar is due on 15 Aug 2026.\n\nRegards,\nSri Vignan Intermediate College',
    status: 'QUEUED',
    createdAt: '2026-08-06T09:00:00Z',
    retryCount: 0,
  },
  {
    id: 'nevent-4',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: 'student-1',
    guardianId: 'guard-1',
    sourceModule: 'Examinations',
    sourceRecordId: 'respub-1',
    eventType: 'EXAM_RESULT_PUBLISHED',
    recipientMobile: '+91 90000 20001',
    resolvedMessage: 'Dear Mrs. Lakshmi,\n\nThe result for Ravi Kumar in Monthly Test 1 has been published.\n\nTotal: 316 / 400\nPercentage: 79%\nResult: Pass\n\nRegards,\nSri Vignan Intermediate College',
    status: 'DELIVERED',
    providerMessageId: 'WA-MSG-88191110',
    createdAt: '2026-07-28T12:01:00Z',
    sentAt: '2026-07-28T12:01:03Z',
    deliveredAt: '2026-07-28T12:01:06Z',
    retryCount: 0,
  },
  {
    id: 'nevent-5',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    studentId: 'student-3',
    guardianId: 'guard-3',
    sourceModule: 'Attendance',
    sourceRecordId: 'att-sess-7',
    eventType: 'ATTENDANCE_ABSENCE',
    recipientMobile: '+91 90000 20003',
    resolvedMessage: 'Dear Mr. Ramesh Teja,\n\nArun Teja was marked absent on 6 Aug 2026 at Sri Vignan Intermediate College, Main Campus.',
    status: 'FAILED',
    failureReason: 'Carrier network timeout or invalid recipient route',
    createdAt: '2026-08-06T10:05:00Z',
    retryCount: 1,
  },
];

export const seedAuditEvents: AuditEvent[] = [
  {
    id: 'audit-1',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    actorUserId: 'user-dean',
    actorRole: 'INSTITUTION_ADMIN',
    action: 'USER_CREATED',
    recordType: 'User',
    recordId: 'user-principal',
    newStatus: 'ACTIVE',
    reason: 'Principal account provisioned for Main Campus',
    createdAt: '2026-05-02T00:00:00Z',
  },
  {
    id: 'audit-2',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    actorUserId: 'user-office',
    actorRole: 'OFFICE_STAFF',
    action: 'PAYMENT_RECORDED',
    recordType: 'FeePayment',
    recordId: 'pay-1',
    newStatus: 'PAID',
    reason: 'UPI payment recorded receipt SVI-2026-00125',
    createdAt: '2026-08-06T11:20:00Z',
  },
  {
    id: 'audit-3',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    actorUserId: 'user-principal',
    actorRole: 'BRANCH_ADMIN',
    action: 'ATTENDANCE_FINALIZED',
    recordType: 'AttendanceSession',
    recordId: 'att-sess-7',
    previousStatus: 'SUBMITTED',
    newStatus: 'FINALIZED',
    reason: 'Daily section attendance confirmed',
    createdAt: '2026-08-06T10:00:00Z',
  },
  {
    id: 'audit-4',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    actorUserId: 'user-principal',
    actorRole: 'BRANCH_ADMIN',
    action: 'RESULT_PUBLISHED',
    recordType: 'ResultPublication',
    recordId: 'respub-1',
    previousStatus: 'APPROVED',
    newStatus: 'PUBLISHED',
    reason: 'Monthly Test 1 results published to parents',
    createdAt: '2026-07-28T12:00:00Z',
  },
];

export const seedImportBatches: ImportBatch[] = [
  {
    id: 'imp-batch-01',
    institutionId: INSTITUTION_ID,
    branchId: BRANCH_ID,
    academicYearId: ACADEMIC_YEAR_ID,
    fileName: 'svic_student_admissions_2026.xlsx',
    fileChecksum: 'chk-8839102931',
    templateVersion: 'STUDENT_IMPORT_V1',
    status: 'CONFIRMED',
    totalRows: 25,
    validRows: 25,
    warningRows: 0,
    rejectedRows: 0,
    uploadedBy: 'user-office',
    submittedBy: 'user-office',
    confirmedBy: 'user-principal',
    createdAt: '2026-06-01T09:00:00Z',
    confirmedAt: '2026-06-01T10:30:00Z',
  },
];
