const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SGP grades & linking BSBA-1A subjects with exact codes...');

  const currentTerm = await prisma.academicTerm.findFirst({
    where: { isCurrent: true },
  });

  if (!currentTerm) {
    console.error('No active term found');
    return;
  }

  // 1. Get students
  const stMark = await prisma.student.findUnique({ where: { studentNo: '2024-00101' } });
  const stPrincess = await prisma.student.findUnique({ where: { studentNo: '2024-00102' } });
  const stSarah = await prisma.student.findUnique({ where: { studentNo: '2024-00201' } });

  // 2. Populate grades for Mark Anthony Reyes (BSIT-1A)
  if (stMark) {
    const enMark = await prisma.enrollment.findUnique({
      where: { studentId_termId: { studentId: stMark.id, termId: currentTerm.id } },
      include: { subjects: { include: { subject: true } } },
    });

    if (enMark) {
      const sampleGrades = [
        { code: 'IT101', p: 89, m: 91, f: 93, rating: '1.50', remarks: 'PASSED', instructor: 'Prof. Maria Elena Veloso, MSIT' },
        { code: 'IT102', p: 86, m: 88, f: 90, rating: '1.75', remarks: 'PASSED', instructor: 'Engr. Dan Gomez, MIT' },
        { code: 'IT103', p: 90, m: 92, f: 94, rating: '1.50', remarks: 'PASSED', instructor: 'Prof. Maria Elena Veloso, MSIT' },
        { code: 'GE101', p: 91, m: 93, f: 95, rating: '1.50', remarks: 'PASSED', instructor: 'Dr. Alicia Tan, PhD' },
        { code: 'GE102', p: 88, m: 90, f: 92, rating: '1.75', remarks: 'PASSED', instructor: 'Prof. Vicente Santos, MA' },
        { code: 'PE101', p: 95, m: 96, f: 98, rating: '1.00', remarks: 'PASSED', instructor: 'Coach Mark Dizon' },
        { code: 'NSTP1', p: 94, m: 95, f: 96, rating: '1.25', remarks: 'PASSED', instructor: 'Capt. Eduardo Reyes' },
      ];

      for (const es of enMark.subjects) {
        const found = sampleGrades.find((g) => g.code === es.subject.code);
        if (found) {
          const comp = Number((found.p * 0.3 + found.m * 0.3 + found.f * 0.4).toFixed(2));
          await prisma.enrolledSubject.update({
            where: { id: es.id },
            data: {
              prelimGrade: found.p,
              midtermGrade: found.m,
              finalsGrade: found.f,
              computedGrade: comp,
              grade: found.rating,
              remarks: found.remarks,
              instructor: found.instructor,
              isSubmitted: true,
              submittedAt: new Date(),
            },
          });
        }
      }
      console.log('✓ Grades seeded for Mark Anthony Reyes (BSIT-1A)');
    }
  }

  // 3. Populate grades for Princess Mae Tan (BSIT-1A Scholar)
  if (stPrincess) {
    const enPrincess = await prisma.enrollment.findUnique({
      where: { studentId_termId: { studentId: stPrincess.id, termId: currentTerm.id } },
      include: { subjects: { include: { subject: true } } },
    });

    if (enPrincess) {
      const sampleGrades = [
        { code: 'IT101', p: 95, m: 96, f: 98, rating: '1.00', remarks: 'PASSED', instructor: 'Prof. Maria Elena Veloso, MSIT' },
        { code: 'IT102', p: 93, m: 94, f: 95, rating: '1.25', remarks: 'PASSED', instructor: 'Engr. Dan Gomez, MIT' },
        { code: 'IT103', p: 96, m: 97, f: 98, rating: '1.00', remarks: 'PASSED', instructor: 'Prof. Maria Elena Veloso, MSIT' },
        { code: 'GE101', p: 94, m: 95, f: 96, rating: '1.25', remarks: 'PASSED', instructor: 'Dr. Alicia Tan, PhD' },
        { code: 'GE102', p: 96, m: 97, f: 98, rating: '1.00', remarks: 'PASSED', instructor: 'Prof. Vicente Santos, MA' },
        { code: 'PE101', p: 98, m: 98, f: 99, rating: '1.00', remarks: 'PASSED', instructor: 'Coach Mark Dizon' },
        { code: 'NSTP1', p: 97, m: 98, f: 98, rating: '1.00', remarks: 'PASSED', instructor: 'Capt. Eduardo Reyes' },
      ];

      for (const es of enPrincess.subjects) {
        const found = sampleGrades.find((g) => g.code === es.subject.code);
        if (found) {
          const comp = Number((found.p * 0.3 + found.m * 0.3 + found.f * 0.4).toFixed(2));
          await prisma.enrolledSubject.update({
            where: { id: es.id },
            data: {
              prelimGrade: found.p,
              midtermGrade: found.m,
              finalsGrade: found.f,
              computedGrade: comp,
              grade: found.rating,
              remarks: found.remarks,
              instructor: found.instructor,
              isSubmitted: true,
              submittedAt: new Date(),
            },
          });
        }
      }
      console.log('✓ Grades seeded for Princess Mae Tan (BSIT-1A Scholar)');
    }
  }

  // 4. Enroll subjects for Sarah Jane Mendoza (BSBA-1A) and seed grades
  if (stSarah) {
    const enSarah = await prisma.enrollment.findUnique({
      where: { studentId_termId: { studentId: stSarah.id, termId: currentTerm.id } },
      include: { subjects: true },
    });

    if (enSarah) {
      // Find BA subjects
      const allSubjects = await prisma.subject.findMany();
      const subMap = {};
      allSubjects.forEach((s) => (subMap[s.code] = s));

      const baCodes = [
        { code: 'BA101', p: 85, m: 87, f: 89, rating: '1.75', remarks: 'PASSED', instructor: 'Prof. Carlos Mendoza, MBA' },
        { code: 'BA102', p: 82, m: 84, f: 86, rating: '2.25', remarks: 'PASSED', instructor: 'Prof. Carlos Mendoza, MBA' },
        { code: 'GE101', p: 88, m: 90, f: 92, rating: '1.75', remarks: 'PASSED', instructor: 'Dr. Alicia Tan, PhD' },
        { code: 'GE102', p: 86, m: 88, f: 90, rating: '1.75', remarks: 'PASSED', instructor: 'Prof. Vicente Santos, MA' },
        { code: 'PE101', p: 92, m: 93, f: 94, rating: '1.25', remarks: 'PASSED', instructor: 'Coach Mark Dizon' },
      ];

      // Delete existing to cleanly populate
      await prisma.enrolledSubject.deleteMany({ where: { enrollmentId: enSarah.id } });

      for (const item of baCodes) {
        if (subMap[item.code]) {
          const comp = Number((item.p * 0.3 + item.m * 0.3 + item.f * 0.4).toFixed(2));
          await prisma.enrolledSubject.create({
            data: {
              enrollmentId: enSarah.id,
              subjectId: subMap[item.code].id,
              section: 'BSBA-1A',
              schedule: 'TTh 10:00 AM - 11:30 AM',
              room: 'BA Hall 102',
              instructor: item.instructor,
              prelimGrade: item.p,
              midtermGrade: item.m,
              finalsGrade: item.f,
              computedGrade: comp,
              grade: item.rating,
              remarks: item.remarks,
              isSubmitted: true,
              submittedAt: new Date(),
            },
          });
        }
      }
      console.log('✓ Enrolled subjects & grades seeded for Sarah Jane Mendoza (BSBA-1A - Financial Hold)');
    }
  }

  console.log('--- SGP Data Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
