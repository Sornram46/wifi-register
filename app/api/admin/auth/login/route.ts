import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }

    // ค้นหาผู้ใช้
    const result = await pool.query(
      `SELECT id, username, password, full_name, email, role, is_active
       FROM user_admin
       WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // ตรวจสอบว่า account active หรือไม่
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'บัญชีนี้ถูกระงับการใช้งาน' },
        { status: 403 }
      );
    }

    // ตรวจสอบรหัสผ่าน
    // หมายเหตุ: ในระบบจริงควรใช้ bcrypt.compare()
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // อัพเดท last_login
    await pool.query(
      `UPDATE user_admin SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );

    // สร้าง session
    const sessionUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    };

    await setAdminSession(sessionUser);

    console.log(`✅ Admin login: ${user.username} (${user.full_name})`);

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}