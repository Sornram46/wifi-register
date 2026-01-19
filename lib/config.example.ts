// คัดลอกไฟล์นี้เป็น config.ts และแก้ไขค่าให้ตรงกับ environment ของคุณ

export const dbConfig = {
  host: '172.29.10.98',      // เช่น localhost, 172.29.10.98
  port: 5432,                      // PostgreSQL port
  database: 'wifiregister',  // เช่น wifiregister
  user: 'postgres',      // เช่น postgres
  password: 'BPK9@support',  // รหัสผ่านฐานข้อมูลของคุณ
};

export const appConfig = {
  wifiPasswordLength: 8,
  sessionHours: 2,
  appUrl: 'http://localhost:3000',
};