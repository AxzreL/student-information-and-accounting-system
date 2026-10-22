const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding SIAS Database ---');

  // 1. System Settings
  const settings = [
    { key: 'institution_name', value: 'Samar State University', description: 'Official institution name' },
    { key: 'institution_subtitle', value: 'College of Information Technology, Business & Education', description: 'Official subtitle' },
    { key: 'institution_address', value: 'Arteche Blvd, Catbalogan City, Samar 6700, Philippines', description: 'Campus address' },
    { key: 'contact_email', value: 'registrar@ssu.edu.ph', description: 'Registrar & Admissions email' },
    { key: 'contact_phone', value: '+63 (055) 543-8901', description: 'Campus landline / hotlines' },
    { key: 'currency_symbol', value: '₱', description: 'Display currency symbol' },
    { key: 'tuition_rate_per_unit', value: '250.00', description: 'Standard tuition rate per lecture unit' },
    { key: 'lab_rate_per_unit', value: '450.00', description: 'Standard rate per laboratory unit' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log('✓ System settings initialized.');

  // 2. Users (Admin, Registrar, Cashier)
  const users = [
    {
      name: 'Dr. Alejandro Gomez',
      email: 'admin@sias.edu.ph',
      passwordHash: 'admin123',
      role: 'ADMIN',
      department: 'Office of the Vice President for Academic & Financial Affairs',
    },
    {
      name: 'Maria Elena Veloso',
      email: 'registrar@sias.edu.ph',
      passwordHash: 'registrar123',
      role: 'REGISTRAR',
      department: 'University Registrar Office',
    },
    {
      name: 'Roberto Fernandez, CPA',
      email: 'cashier@sias.edu.ph',
      passwordHash: 'cashier123',
      role: 'CASHIER',
      department: 'Accounting & Cashiering Services',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log('✓ User accounts seeded (Admin, Registrar, Cashier).');

  // 3. Departments
  const deptCICT = await prisma.department.upsert({
    where: { code: 'CICT' },
    update: {},
    create: {
      code: 'CICT',
      name: 'College of Information & Communications Technology',
      description: 'Department of Computing, Software, and Network Technologies',
    },
  });

  const deptCBA = await prisma.department.upsert({
    where: { code: 'CBA' },
    update: {},
    create: {
      code: 'CBA',
      name: 'College of Business Administration',
      description: 'Department of Financial Management, Marketing, and Entrepreneurship',
    },
  });

  const deptCOED = await prisma.department.upsert({
    where: { code: 'COED' },
    update: {},
    create: {
      code: 'COED',
      name: 'College of Teacher Education',
      description: 'Department of Elementary and Secondary Education',
    },
  });
  console.log('✓ Departments created.');

  // 4. Programs
  const progBSIT = await prisma.program.upsert({
    where: { code: 'BSIT' },
    update: {},
    create: {
      code: 'BSIT',
      name: 'Bachelor of Science in Information Technology',
      departmentId: deptCICT.id,
      yearsCount: 4,
    },
  });

  const progBSBA = await prisma.program.upsert({
    where: { code: 'BSBA' },
    update: {},
    create: {
      code: 'BSBA',
      name: 'Bachelor of Science in Business Administration',
      departmentId: deptCBA.id,
      yearsCount: 4,
    },
  });

  const progBSED = await prisma.program.upsert({
    where: { code: 'BSED' },
    update: {},
    create: {
      code: 'BSED',
      name: 'Bachelor of Secondary Education',
      departmentId: deptCOED.id,
      yearsCount: 4,
    },
  });
  console.log('✓ Degree programs created.');

  // 5. Subjects
  const subjectsData = [
    { code: 'IT101', title: 'Introduction to Computing', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'IT102', title: 'Computer Programming 1 (Python)', lecUnits: 2, labUnits: 1, totalUnits: 3 },
    { code: 'IT103', title: 'Discrete Mathematics', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'GE101', title: 'Understanding the Self', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'GE102', title: 'Purposive Communication', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'PE101', title: 'Physical Fitness & Gymnastics', lecUnits: 2, labUnits: 0, totalUnits: 2 },
    { code: 'NSTP1', title: 'National Service Training Program 1', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'IT201', title: 'Data Structures and Algorithms', lecUnits: 2, labUnits: 1, totalUnits: 3, prerequisite: 'IT102' },
    { code: 'IT202', title: 'Database Management Systems 1', lecUnits: 2, labUnits: 1, totalUnits: 3, prerequisite: 'IT102' },
    { code: 'BA101', title: 'Financial Accounting & Reporting', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'BA102', title: 'Principles of Management', lecUnits: 3, labUnits: 0, totalUnits: 3 },
    { code: 'ED101', title: 'The Child and Adolescent Learners', lecUnits: 3, labUnits: 0, totalUnits: 3 },
  ];

  const subjectsMap = {};
  for (const s of subjectsData) {
    const created = await prisma.subject.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    subjectsMap[s.code] = created;
  }
  console.log('✓ Subject catalog seeded.');

  // 6. Program Curricula (ProgramSubject mappings)
  const bsitFirstYearSubs = ['IT101', 'IT102', 'IT103', 'GE101', 'GE102', 'PE101', 'NSTP1'];
  for (const code of bsitFirstYearSubs) {
    await prisma.programSubject.upsert({
      where: {
        programId_subjectId_yearLevel_semester: {
          programId: progBSIT.id,
          subjectId: subjectsMap[code].id,
          yearLevel: 1,
          semester: '1st Semester',
        },
      },
      update: {},
      create: {
        programId: progBSIT.id,
        subjectId: subjectsMap[code].id,
        yearLevel: 1,
        semester: '1st Semester',
      },
    });
  }

  // 7. Academic Term
  const currentTerm = await prisma.academicTerm.upsert({
    where: { code: 'AY2024-2025-1S' },
    update: { isCurrent: true },
    create: {
      code: 'AY2024-2025-1S',
      name: 'Academic Year 2024-2025 First Semester',
      schoolYear: '2024-2025',
      semester: '1st Semester',
      isCurrent: true,
    },
  });
  console.log('✓ Academic term set to AY 2024-2025 1st Semester.');

  // 8. Fee Templates
  const feeTemplates = [
    { code: 'FEE-TUIT', category: 'TUITION', name: 'Tuition Fee (Per Lecture Unit)', amount: 250.00, isPerUnit: true, isDefault: true },
    { code: 'FEE-REG', category: 'MISCELLANEOUS', name: 'Registration Fee', amount: 350.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-LIB', category: 'MISCELLANEOUS', name: 'Library & Online Resource Access Fee', amount: 500.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-ATH', category: 'MISCELLANEOUS', name: 'Athletic & Physical Education Fee', amount: 300.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-MED', category: 'MISCELLANEOUS', name: 'Medical and Dental Clinic Fee', amount: 250.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-AV', category: 'MISCELLANEOUS', name: 'Multimedia & Audio-Visual Fee', amount: 200.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-SC', category: 'MISCELLANEOUS', name: 'Student Council & School Publication', amount: 150.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-ITLAB', category: 'LABORATORY', name: 'Computer Laboratory & Cloud Dev Fee', amount: 1200.00, isPerUnit: false, isDefault: true },
    { code: 'FEE-ID', category: 'OTHER', name: 'Student RFID ID & Security Pass', amount: 150.00, isPerUnit: false, isDefault: true },
  ];

  for (const f of feeTemplates) {
    await prisma.feeTemplate.upsert({
      where: { code: f.code },
      update: f,
      create: f,
    });
  }
  console.log('✓ Standard Fee structures seeded.');

  // 9. Students
  const students = [
    {
      studentNo: '2024-00101',
      firstName: 'Mark Anthony',
      middleName: 'Ramos',
      lastName: 'Reyes',
      gender: 'Male',
      email: 'mark.reyes@student.ssu.edu.ph',
      phone: '0917-234-5678',
      address: 'Brgy. San Jose, Jiabong, Samar',
      yearLevel: 1,
      status: 'REGULAR',
      programId: progBSIT.id,
    },
    {
      studentNo: '2024-00102',
      firstName: 'Princess Mae',
      middleName: 'Alcantara',
      lastName: 'Tan',
      gender: 'Female',
      email: 'princess.tan@student.ssu.edu.ph',
      phone: '0918-345-6789',
      address: 'Brgy. Mercedes, Catbalogan City, Samar',
      yearLevel: 1,
      status: 'REGULAR',
      programId: progBSIT.id,
    },
    {
      studentNo: '2023-00045',
      firstName: 'John Paul',
      middleName: 'Villanueva',
      lastName: 'Dela Cruz',
      gender: 'Male',
      email: 'jp.delacruz@student.ssu.edu.ph',
      phone: '0920-456-7890',
      address: 'Brgy. Casandig, Jiabong, Samar',
      yearLevel: 2,
      status: 'REGULAR',
      programId: progBSIT.id,
    },
    {
      studentNo: '2024-00201',
      firstName: 'Sarah Jane',
      middleName: 'Castro',
      lastName: 'Mendoza',
      gender: 'Female',
      email: 'sarah.mendoza@student.ssu.edu.ph',
      phone: '0922-567-8901',
      address: 'Brgy. Poblacion 1, Jiabong, Samar',
      yearLevel: 1,
      status: 'REGULAR',
      programId: progBSBA.id,
    },
    {
      studentNo: '2024-00301',
      firstName: 'Joshua Kyle',
      middleName: 'Duran',
      lastName: 'Santos',
      gender: 'Male',
      email: 'joshua.santos@student.ssu.edu.ph',
      phone: '0919-678-9012',
      address: 'Brgy. Malobago, Jiabong, Samar',
      yearLevel: 1,
      status: 'REGULAR',
      programId: progBSED.id,
    },
  ];

  const studentMap = {};
  for (const st of students) {
    const created = await prisma.student.upsert({
      where: { studentNo: st.studentNo },
      update: st,
      create: st,
    });
    studentMap[st.studentNo] = created;
  }
  console.log('✓ Sample college students seeded.');

  // 10. Enrollments & Assessments
  // Student 1: Mark Anthony Reyes (Enrolled, 20 units, partial downpayment made)
  const st1 = studentMap['2024-00101'];
  const enrollment1 = await prisma.enrollment.upsert({
    where: {
      studentId_termId: {
        studentId: st1.id,
        termId: currentTerm.id,
      },
    },
    update: {},
    create: {
      studentId: st1.id,
      termId: currentTerm.id,
      yearLevel: 1,
      status: 'OFFICIALLY_ENROLLED',
      totalLecUnits: 19,
      totalLabUnits: 1,
      totalUnits: 20,
    },
  });

  // Attach subjects to enrollment 1
  for (const code of bsitFirstYearSubs) {
    await prisma.enrolledSubject.create({
      data: {
        enrollmentId: enrollment1.id,
        subjectId: subjectsMap[code].id,
        section: 'BSIT-1A',
        schedule: 'MWF 8:00 AM - 10:00 AM',
        room: 'Lab 201',
      },
    });
  }

  // Assessment 1:
  // Tuition: 20 units * 250 = 5,000
  // Misc: 1,750 (Reg 350 + Lib 500 + Ath 300 + Med 250 + AV 200 + SC 150)
  // Lab: 1,200
  // Other (ID): 150
  // Gross: 8,100. Downpayment: 2,500, Prelim: 1,866.67, Midterm: 1,866.67, Final: 1,866.66
  const assessment1 = await prisma.assessment.upsert({
    where: { enrollmentId: enrollment1.id },
    update: {},
    create: {
      enrollmentId: enrollment1.id,
      tuitionFee: 5000.00,
      miscTotal: 1750.00,
      labTotal: 1200.00,
      otherTotal: 150.00,
      grossTotal: 8100.00,
      discountType: null,
      discountAmount: 0.00,
      netTotal: 8100.00,
      totalPaid: 3500.00,
      balance: 4600.00,
      downpaymentDue: 2500.00,
      prelimDue: 1866.67,
      midtermDue: 1866.67,
      finalDue: 1866.66,
      examPermitStatus: 'CLEARED',
      status: 'PARTIAL',
      items: {
        create: [
          { category: 'TUITION', feeName: 'Tuition Fee (20 units @ ₱250)', amount: 5000.00 },
          { category: 'MISCELLANEOUS', feeName: 'Miscellaneous Fees Combined', amount: 1750.00 },
          { category: 'LABORATORY', feeName: 'Computer Programming Laboratory', amount: 1200.00 },
          { category: 'OTHER', feeName: 'Student RFID & Security Pass', amount: 150.00 },
        ],
      },
    },
  });

  // Payment 1 for Mark Anthony Reyes
  await prisma.payment.upsert({
    where: { orNumber: 'OR-2024-0001' },
    update: {},
    create: {
      assessmentId: assessment1.id,
      orNumber: 'OR-2024-0001',
      amount: 3500.00,
      paymentMethod: 'GCASH',
      referenceNo: 'GCASH-982310249',
      paidBy: 'Mark Anthony Reyes',
      cashierName: 'Roberto Fernandez, CPA',
      remarks: 'Initial Enrollment Downpayment + ID Fee',
    },
  });

  // Student 2: Princess Mae Tan (UniFAST / Full TES Scholar)
  const st2 = studentMap['2024-00102'];
  const enrollment2 = await prisma.enrollment.upsert({
    where: {
      studentId_termId: {
        studentId: st2.id,
        termId: currentTerm.id,
      },
    },
    update: {},
    create: {
      studentId: st2.id,
      termId: currentTerm.id,
      yearLevel: 1,
      status: 'OFFICIALLY_ENROLLED',
      totalLecUnits: 19,
      totalLabUnits: 1,
      totalUnits: 20,
    },
  });

  for (const code of bsitFirstYearSubs) {
    await prisma.enrolledSubject.create({
      data: {
        enrollmentId: enrollment2.id,
        subjectId: subjectsMap[code].id,
        section: 'BSIT-1A',
        schedule: 'MWF 8:00 AM - 10:00 AM',
        room: 'Lab 201',
      },
    });
  }

  await prisma.assessment.upsert({
    where: { enrollmentId: enrollment2.id },
    update: {},
    create: {
      enrollmentId: enrollment2.id,
      tuitionFee: 5000.00,
      miscTotal: 1750.00,
      labTotal: 1200.00,
      otherTotal: 150.00,
      grossTotal: 8100.00,
      discountType: 'UniFAST Government Subsidy (RA 10931)',
      discountAmount: 8100.00,
      netTotal: 0.00,
      totalPaid: 0.00,
      balance: 0.00,
      downpaymentDue: 0.00,
      prelimDue: 0.00,
      midtermDue: 0.00,
      finalDue: 0.00,
      examPermitStatus: 'CLEARED',
      status: 'PAID',
      items: {
        create: [
          { category: 'TUITION', feeName: 'Tuition Fee (20 units)', amount: 5000.00 },
          { category: 'MISCELLANEOUS', feeName: 'Miscellaneous Fees Combined', amount: 1750.00 },
          { category: 'LABORATORY', feeName: 'Computer Programming Laboratory', amount: 1200.00 },
          { category: 'OTHER', feeName: 'Student RFID & Security Pass', amount: 150.00 },
        ],
      },
    },
  });

  // Student 3: Sarah Jane Mendoza (BSBA, Assessed, Unpaid)
  const st3 = studentMap['2024-00201'];
  const enrollment3 = await prisma.enrollment.upsert({
    where: {
      studentId_termId: {
        studentId: st3.id,
        termId: currentTerm.id,
      },
    },
    update: {},
    create: {
      studentId: st3.id,
      termId: currentTerm.id,
      yearLevel: 1,
      status: 'ASSESSED',
      totalLecUnits: 15,
      totalLabUnits: 0,
      totalUnits: 15,
    },
  });

  await prisma.assessment.upsert({
    where: { enrollmentId: enrollment3.id },
    update: {},
    create: {
      enrollmentId: enrollment3.id,
      tuitionFee: 3750.00,
      miscTotal: 1750.00,
      labTotal: 0.00,
      otherTotal: 150.00,
      grossTotal: 5650.00,
      discountType: null,
      discountAmount: 0.00,
      netTotal: 5650.00,
      totalPaid: 0.00,
      balance: 5650.00,
      downpaymentDue: 1500.00,
      prelimDue: 1383.33,
      midtermDue: 1383.33,
      finalDue: 1383.34,
      examPermitStatus: 'HOLD',
      status: 'UNPAID',
      items: {
        create: [
          { category: 'TUITION', feeName: 'Tuition Fee (15 units @ ₱250)', amount: 3750.00 },
          { category: 'MISCELLANEOUS', feeName: 'Standard Miscellaneous Fees', amount: 1750.00 },
          { category: 'OTHER', feeName: 'Student RFID & Security Pass', amount: 150.00 },
        ],
      },
    },
  });

  // Log some audit entries
  await prisma.auditLog.createMany({
    data: [
      {
        userName: 'Maria Elena Veloso',
        role: 'REGISTRAR',
        action: 'ENROLL_STUDENT',
        entity: 'Enrollment',
        details: 'Enrolled Mark Anthony Reyes (2024-00101) into BSIT-1A (20 units)',
      },
      {
        userName: 'Roberto Fernandez, CPA',
        role: 'CASHIER',
        action: 'RECEIVE_PAYMENT',
        entity: 'Payment',
        details: 'Issued OR #OR-2024-0001 amount ₱3,500.00 via GCash for Mark Anthony Reyes',
      },
    ],
  });

  console.log('✓ Sample Enrollments, Assessments, Official Receipts & Audit Logs seeded successfully.');
  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
