import pool from './db';

/**
 * อัพเดทสถานะ password ที่หมดอายุ (เกิน 2 ชั่วโมง)
 */
export async function expireOldPasswords() {
  try {
    const result = await pool.query(
      `UPDATE store_wifi
       SET status = 'expired'
       WHERE status = 'active'
       AND create_at < NOW() - INTERVAL '2 hours'
       RETURNING id`
    );

    console.log(`✅ Expired ${result.rowCount} passwords`);
    return result.rowCount || 0;
  } catch (error) {
    console.error('❌ Error expiring passwords:', error);
    return 0;
  }
}

/**
 * ตรวจสอบว่า password ยังใช้งานได้หรือไม่
 */
export async function isPasswordValid(storeWifiId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT id, status, create_at
       FROM store_wifi
       WHERE id = $1`,
      [storeWifiId]
    );

    if (result.rows.length === 0 || result.rows[0].status !== 'active') {
      return false;
    }

    const createdAt = new Date(result.rows[0].create_at);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    return createdAt > twoHoursAgo;
  } catch (error) {
    console.error('Error checking password validity:', error);
    return false;
  }
}

/**
 * ดึงประวัติการลงทะเบียนด้วยเบอร์โทร
 */
export async function getRegistrationHistory(phoneNum: string) {
  try {
    const result = await pool.query(
      `SELECT 
        r.id as registration_id,
        r.user_type,
        r.phone_num,
        r.create_at as registered_at,
        sw.id as wifi_id,
        sw.password as wifi_password,
        sw.status,
        sw.create_at as wifi_created_at
       FROM registration r
       LEFT JOIN store_wifi sw ON r.id = sw.wifi_id
       WHERE r.phone_num = $1
       ORDER BY sw.create_at DESC
       LIMIT 10`,
      [phoneNum]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting registration history:', error);
    return [];
  }
}