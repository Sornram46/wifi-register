import pool from './db';

async function testConnection() {
  try {
    console.log('🔄 กำลังทดสอบการเชื่อมต่อ...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ เชื่อมต่อสำเร็จ!');
    console.log('⏰ เวลาเซิร์ฟเวอร์:', result.rows[0].now);
    
    // ตรวจสอบตาราง
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 ตารางที่มี:', tables.rows.map(r => r.table_name));
    
    // ตรวจสอบจำนวนข้อมูล
    const regCount = await pool.query('SELECT COUNT(*) FROM registration');
    const wifiCount = await pool.query('SELECT COUNT(*) FROM store_wifi');
    console.log('📈 จำนวนข้อมูล registration:', regCount.rows[0].count);
    console.log('📈 จำนวนข้อมูล store_wifi:', wifiCount.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

testConnection();