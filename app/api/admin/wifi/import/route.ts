import { NextResponse } from 'next/server'; // ← แก้จาก 'next/request' เป็น 'next/server'
import pool from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์' },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    let passwords: Array<{
      password: string;
      status?: string;
      user?: string;
      policy?: string;
      print?: boolean;
    }> = [];

    // อ่านไฟล์ตามประเภท
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      // 📊 อ่าน Excel
      console.log('📊 Processing Excel file...');
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return NextResponse.json(
          { error: 'ไฟล์ Excel ว่างเปล่า' },
          { status: 400 }
        );
      }

      // แปลงข้อมูลจาก Excel
      passwords = data.map((row: any) => ({
        password: row.password || row.Password || row.PASSWORD || '',
        status: row.status || row.Status || 'available',
        user: row.user || row.User || '',
        policy: row.policy || row.Policy || null,
        print: row.print === true || row.print === 'true' || row.print === 'TRUE',
      })).filter(item => item.password.trim().length > 0);

    } else if (filename.endsWith('.csv')) {
      // 📄 อ่าน CSV
      console.log('📄 Processing CSV file...');
      
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);

      if (lines.length === 0) {
        return NextResponse.json(
          { error: 'ไฟล์ CSV ว่างเปล่า' },
          { status: 400 }
        );
      }

      // ตรวจสอบว่ามี header หรือไม่
      const firstLine = lines[0];
      const hasHeader = firstLine.toLowerCase().includes('password') || 
                       firstLine.toLowerCase().includes('user') ||
                       firstLine.toLowerCase().includes('status');

      if (hasHeader && lines.length > 1) {
        // มี header - ใช้ xlsx แปลง CSV
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        passwords = data.map((row: any) => ({
          password: row.password || row.Password || '',
          status: row.status || row.Status || 'available',
          user: row.user || row.User || '',
          policy: row.policy || row.Policy || null,
          print: row.print === true || row.print === 'true',
        })).filter(item => item.password.trim().length > 0);
      } else {
        // ไม่มี header - แค่รหัสทีละบรรทัด
        const startLine = hasHeader ? 1 : 0;
        passwords = lines.slice(startLine).map(line => ({
          password: line.trim(),
          status: 'available',
          user: '',
          policy: null,
          print: false,
        }));
      }

    } else {
      // 📝 อ่าน TXT
      console.log('📝 Processing TXT file...');
      
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);

      if (lines.length === 0) {
        return NextResponse.json(
          { error: 'ไฟล์ว่างเปล่า' },
          { status: 400 }
        );
      }

      passwords = lines.map(line => ({
        password: line,
        status: 'available',
        user: '',
        policy: null,
        print: false,
      }));
    }

    console.log(`📄 Processing ${passwords.length} passwords...`);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Import ทีละรหัส
    for (const item of passwords) {
      try {
        // ตรวจสอบว่ารหัสซ้ำหรือไม่
        const existing = await pool.query(
          'SELECT id FROM store_wifi WHERE password = $1',
          [item.password]
        );

        if (existing.rows.length > 0) {
          console.log(`⚠️  Skipped (duplicate): ${item.password}`);
          skipped++;
          continue;
        }

        // เพิ่มรหัสใหม่
        await pool.query(
          `INSERT INTO store_wifi (password, status, "user", policy, print, create_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            item.password,
            item.status || 'available',
            item.user || '',
            item.policy || null,
            item.print || false,
          ]
        );

        console.log(`✅ Imported: ${item.password} (status: ${item.status || 'available'})`);
        imported++;

      } catch (error: any) {
        console.error(`❌ Error importing ${item.password}:`, error.message);
        errors.push(`${item.password}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: passwords.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด: ' + error.message },
      { status: 500 }
    );
  }
}