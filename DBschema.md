generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ตาราง registration - เก็บข้อมูลผู้ใช้ (ตารางแม่)
model Registration {
  id            String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_type     String      @db.VarChar(10)
  phone_num     String      @db.VarChar(20)
  ppid_check    Boolean     @default(false)
  passport      String?     @db.VarChar(50)
  ppid          String?     @db.VarChar(50)
  create_at     DateTime    @default(now()) @db.Timestamptz(6)
  
  // ความสัมพันธ์: 1 registration มีหลาย store_wifi
  storeWifis    StoreWifi[]

  @@index([user_type], name: "idx_registration_user_type")
  @@index([phone_num], name: "idx_registration_phone")
  @@map("registration")
}

// ตาราง store_wifi - เก็บรหัส WiFi (ตารางลูก)
model StoreWifi {
  id        String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user      String        @db.VarChar(100)
  password  String        @db.VarChar(100)
  print     Boolean       @default(false)
  status    String        @default("active") @db.VarChar(20)
  policy    String?       @db.Text
  create_at DateTime      @default(now()) @db.Timestamptz(6)
  
  // Foreign Key
  wifi_id      String?       @db.Uuid
  registration Registration? @relation(fields: [wifi_id], references: [id], onDelete: SetNull)

  @@index([wifi_id], name: "idx_store_wifi_wifi_id")
  @@index([status], name: "idx_store_wifi_status")
  @@index([create_at], name: "idx_store_wifi_create_at")
  @@map("store_wifi")
}