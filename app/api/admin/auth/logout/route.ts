import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearAdminSession();
    
    return NextResponse.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}