import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // สถิติการใช้งาน
    const result = await pool.query(
      `SELECT 
        r.user_type,
        COUNT(sw.id) as total,
        COUNT(CASE WHEN sw.status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN sw.status = 'expired' THEN 1 END) as expired
       FROM registration r
       LEFT JOIN store_wifi sw ON r.id = sw.wifi_id
       WHERE r.create_at >= NOW() - INTERVAL '${days} days'
       GROUP BY r.user_type`,
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}