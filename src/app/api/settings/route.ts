import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const currentTerm = await prisma.academicTerm.findFirst({
      where: { isCurrent: true },
    });
    const feeTemplates = await prisma.feeTemplate.findMany({
      orderBy: { category: 'asc' },
    });

    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: settingsObj,
      currentTerm,
      feeTemplates,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
