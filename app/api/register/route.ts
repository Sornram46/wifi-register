import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  let client;
  
  try {
    console.log('📥 API /api/register called');
    
    client = await pool.connect();
    console.log('✅ Database connected');
    
    const body = await request.json();
    console.log('📝 Request body:', { 
      userType: body.userType, 
      phone: body.phone?.substring(0, 3) + '***' 
    });
    
    const { userType, phone, passport, acceptTerms } = body;

    // Validation
    if (!userType || !phone) {
      console.log('❌ Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (!/^0[0-9]{9}$/.test(phone)) {
      console.log('❌ Validation failed: invalid phone number');
      return NextResponse.json(
        { error: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก)' },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      console.log('❌ Validation failed: terms not accepted');
      return NextResponse.json(
        { error: 'กรุณายอมรับเงื่อนไขการใช้งาน' },
        { status: 400 }
      );
    }

    // เริ่ม Transaction
    console.log('🔄 Starting transaction...');
    await client.query('BEGIN');

    // 1. เพิ่มข้อมูลลงตาราง registration
    console.log('💾 Inserting into registration...');
    const registrationResult = await client.query(
      `INSERT INTO registration (user_type, phone_num, passport, ppid_check, create_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_type, phone_num, create_at`,
      [userType, phone, passport || null, false]
    );

    const registration = registrationResult.rows[0];
    console.log('✅ Registration created:', registration.id);

    // 2. 🔑 ดึงรหัส WiFi ที่ว่างอยู่
    console.log('🔍 Finding available WiFi password...');
    const availableWifiResult = await client.query(
      `SELECT id, password, status, "user"
       FROM store_wifi 
       WHERE (status = 'available' AND wifi_id IS NULL)
          OR (status = 'expired' AND wifi_id IS NULL)
       ORDER BY 
         CASE 
           WHEN status = 'available' THEN 1
           WHEN status = 'expired' THEN 2
         END,
         create_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );

    if (availableWifiResult.rows.length === 0) {
      console.log('❌ No available WiFi password');
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'ขออภัย รหัส WiFi เต็มหมดแล้ว กรุณาติดต่อเจ้าหน้าที่' },
        { status: 503 }
      );
    }

    const wifiRecord = availableWifiResult.rows[0];
    console.log('🔑 Found WiFi password:', wifiRecord.password, '(previous status:', wifiRecord.status + ')');

    // 3. ใช้ค่า user ที่มีอยู่ หรือสร้างใหม่ถ้าไม่มี
    const userName = wifiRecord.user && wifiRecord.user.trim() !== '' 
      ? wifiRecord.user  // ← ใช้ค่าที่อัพโหลดมา
      : `${userType}-${phone.substring(6)}`; // ← สร้างใหม่ถ้าไม่มี
    
    console.log('👤 Using username (SSID):', userName, wifiRecord.user ? '(from upload)' : '(generated)');

    // 4. คำนวณวันหมดอายุ (3 วันจากตอนนี้)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 3);
    console.log('📅 Expires at:', expiresAt.toISOString());

    // 5. อัพเดทรหัสที่เลือก (ไม่เปลี่ยน user ถ้ามีอยู่แล้ว)
    console.log('💾 Assigning WiFi password to registration...');
    
    await client.query(
      `UPDATE store_wifi 
       SET status = 'active',
           wifi_id = $1,
           assigned_at = NOW(),
           expires_at = $2
       WHERE id = $3`,
      [registration.id, expiresAt, wifiRecord.id]
      // ไม่อัพเดท "user" แล้ว เก็บค่าเดิมที่อัพโหลดมา
    );

    console.log('✅ WiFi password assigned, SSID:', userName);
    console.log('⏰ Valid until:', expiresAt.toLocaleString('th-TH'));

    // Commit Transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed');

    const response = {
      success: true,
      data: {
        registration_id: registration.id,
        wifi_ssid: userName,  // ← ใช้ค่าจากฐานข้อมูล
        wifi_password: wifiRecord.password,
        user_type: registration.user_type,
        user_name: userName,
        assigned_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        valid_days: 3,
      },
    };

    console.log('📤 Sending success response');
    return NextResponse.json(response);

  } catch (error: any) {
    if (client) {
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back');
    }
    
    console.error('❌ Error occurred:', error.message);
    console.error('Error code:', error.code);
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
      console.log('🔓 Connection released');
    }
  }
}