import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: ดูรหัส WiFi ทั้งหมด
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        password,
        status,
        "user",
        create_at,
        assigned_at,
        expires_at,
        wifi_id
       FROM store_wifi
       ORDER BY 
         CASE status
           WHEN 'available' THEN 1
           WHEN 'active' THEN 2
           WHEN 'expired' THEN 3
         END,
         create_at DESC`
    );

    const stats = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM store_wifi
       GROUP BY status
       ORDER BY status`
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      stats: stats.rows,
    });
  } catch (error: any) {
    console.error('Error fetching WiFi passwords:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// DELETE: ลบรหัสที่ไม่ได้ใช้
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `DELETE FROM store_wifi 
       WHERE id = $1 
       AND status = 'available' 
       AND wifi_id IS NULL
       RETURNING id, password`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสที่ต้องการลบ หรือรหัสกำลังถูกใช้งานอยู่' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ลบรหัส WiFi สำเร็จ',
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error('Error deleting WiFi password:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}