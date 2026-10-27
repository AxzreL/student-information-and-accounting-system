import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/sgp/classes - Returns all active class sections with enrolled student count and submission status
export async function GET() {
  try {
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });

    if (!currentTerm) {
      return NextResponse.json({ success: false, error: 'No active academic term found' }, { status: 404 });
    }

    // SIAS owns subjects and sections: query enrolled subjects in the current term
    const enrolledSubjects = await prisma.enrolledSubject.findMany({
      where: {
        enrollment: {
          termId: currentTerm.id,
        },
      },
      include: {
        subject: true,
        enrollment: {
          include: {
            student: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    // Group by subjectId + section
    const classMap: Record<string, any> = {};

    for (const es of enrolledSubjects) {
      const key = `${es.subjectId}_${es.section}`;
      if (!classMap[key]) {
        classMap[key] = {
          classId: key,
          subjectId: es.subjectId,
          subjectCode: es.subject.code,
          subjectTitle: es.subject.title,
          section: es.section,
          schedule: es.schedule || 'TBA',
          room: es.room || 'TBA',
          instructor: es.instructor || 'Prof. Maria Santos, MSIT',
          totalUnits: es.subject.totalUnits,
          enrolledCount: 0,
          submittedCount: 0,
          gradedCount: 0,
          termName: currentTerm.name,
        };
      }

      classMap[key].enrolledCount += 1;
      if (es.grade) {
        classMap[key].gradedCount += 1;
      }
      if (es.isSubmitted) {
        classMap[key].submittedCount += 1;
      }
    }

    const classes = Object.values(classMap).map((c: any) => ({
      ...c,
      isFullySubmitted: c.enrolledCount > 0 && c.submittedCount === c.enrolledCount,
    }));

    return NextResponse.json({ success: true, classes, currentTerm });
  } catch (error: any) {
    console.error('Error fetching SGP classes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
