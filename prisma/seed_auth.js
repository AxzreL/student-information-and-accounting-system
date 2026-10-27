const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAuth() {
  console.log('--- Seeding Authentication Records ---');

  // 1. Ensure SIAS Admin, Registrar, Cashier exist
  const siasUsers = [
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
    // SGP Faculty Accounts
    {
      name: 'Prof. Maria Santos, MSIT',
      email: 'faculty@sias.edu.ph',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      department: 'College of Information & Communications Technology',
    },
    {
      name: 'Engr. Dan Gomez, MIT',
      email: 'dgomez@sias.edu.ph',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      department: 'College of Information & Communications Technology',
    },
    {
      name: 'Dr. Alicia Tan, PhD',
      email: 'atan@sias.edu.ph',
      passwordHash: 'faculty123',
      role: 'FACULTY',
      department: 'College of Arts & Sciences',
    },
  ];

  for (const u of siasUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
    console.log(`✓ User ${u.role}: ${u.email} ready.`);
  }

  // 2. Set default password "student123" for all students if null or empty
  await prisma.student.updateMany({
    data: {
      passwordHash: 'student123',
    },
  });
  console.log('✓ All students initialized with default password "student123".');

  console.log('--- Authentication Seeding Complete ---');
}

seedAuth()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
