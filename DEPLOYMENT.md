# 🏥 WiFi Registration System - คู่มือการติดตั้งสำหรับโรงพยาบาล

## 📋 ภาพรวมระบบ

ระบบ WiFi Registration แบบ **Captive Portal** ที่ช่วยให้ผู้ป่วยที่ไม่มีอินเทอร์เน็ตสามารถลงทะเบียนใช้งาน WiFi ได้

---

## 🔧 วิธีการทำงาน (Architecture)

### แบบที่ 1: Captive Portal (แนะนำ) ✅
```
1. ลูกค้าเชื่อมต่อ WiFi: "Hospital-Guest" (ไม่ต้องใส่รหัส)
2. เปิดเบราว์เซอร์ → ระบบบังคับให้เข้าหน้าลงทะเบียนอัตโนมัติ
3. กรอกข้อมูล → ได้รหัส WiFi หลัก หรือได้สิทธิ์เข้าใช้อินเทอร์เน็ตทันที
4. ระบบจะจำ MAC Address ของอุปกรณ์ และเปิดให้ใช้งาน 2 ชั่วโมง
```

### แบบที่ 2: QR Code + Guest WiFi
```
1. วาง QR Code ตามจุดต่างๆ ในโรงพยาบาล
2. ลูกค้าเชื่อมต่อ WiFi: "Hospital-Guest" ก่อน (ไม่ต้องใส่รหัส)
3. สแกน QR Code → เข้าหน้าลงทะเบียน
4. กรอกข้อมูล → ได้รหัส WiFi
```

---

## 🛠 ข้อกำหนดของอุปกรณ์

### 1. Router/Access Point ที่รองรับ:
- **Captive Portal** (Hotspot Gateway)
- **Guest Network** แยกจาก WiFi หลัก
- **MAC Address Filtering/Firewall**
- **Bandwidth Management** (จำกัดความเร็ว)

### แนะนำอุปกรณ์:
- ✅ **UniFi Dream Machine** (Ubiquiti)
- ✅ **MikroTik Router** (RB series)
- ✅ **pfSense/OPNsense** (ทำเป็น Router)
- ✅ **Cisco Meraki** (Enterprise)
- ✅ **TP-Link Omada** (Budget-friendly)

---

## 📡 การตั้งค่า Router (ตัวอย่าง)

### สำหรับ UniFi (Ubiquiti):

#### 1. สร้าง Guest Network
```
Settings → WiFi → Create New
- Name: Hospital-Guest
- Security: Open (No Password)
- Guest Policy: Enabled
- Pre-Authorization Access: Enabled
  → ให้เข้าเว็บนี้ได้: your-domain.com
```

#### 2. ตั้งค่า Captive Portal
```
Settings → Guest Control → Enable Guest Portal
- Type: External Portal Server
- URL: https://your-domain.com
- Redirect: Enabled
- Access Control: Use MAC Authentication
```

#### 3. Firewall Rules
```
Settings → Firewall & Security → Create Rule
- Name: Guest Registration Access
- Action: Allow
- Source: Guest Network
- Destination: Registration Server IP
- Port: 443 (HTTPS)
```

---

### สำหรับ MikroTik:

```bash
# 1. สร้าง Guest WiFi
/interface wireless
set [ find default-name=wlan1 ] mode=ap-bridge ssid="Hospital-Guest" security-profile=default

# 2. สร้าง Hotspot
/ip hotspot setup
# เลือก interface ที่ต้องการ
# ใส่ IP Pool สำหรับ Guest
# ตั้งค่า Redirect URL: https://your-domain.com

# 3. กำหนด MAC Address ที่ได้รับอนุญาต (ผ่าน API)
/ip hotspot user add name=user1 mac-address=XX:XX:XX:XX:XX:XX limit-uptime=2h
```

---

## 🚀 การ Deploy แอพพลิเคชัน

### ขั้นตอนที่ 1: Deploy บน Vercel (ฟรี)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd wifi-register
vercel

# 4. ได้ URL: https://your-app.vercel.app
```

### ขั้นตอนที่ 2: เชื่อมโยง Domain ของโรงพยาบาล

```bash
# เพิ่ม Custom Domain
vercel domains add wifi.yourhospital.com

# ตั้งค่า DNS ตามที่ Vercel บอก
```

### ขั้นตอนที่ 3: ตั้งค่า Database (เลือกอย่างใดอย่างหนึ่ง)

#### Option A: Vercel Postgres (แนะนำ)
```bash
# ติดตั้ง
vercel postgres create

# เพิ่มใน project
vercel env pull
```

#### Option B: Supabase (ฟรี)
1. สร้าง Project ที่ https://supabase.com
2. สร้าง Table: `wifi_registrations`
3. เพิ่ม Environment Variables ใน Vercel

---

## 💾 Database Schema

```sql
CREATE TABLE wifi_registrations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  email VARCHAR(255),
  mac_address VARCHAR(17),
  wifi_password VARCHAR(8) NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  device_info TEXT
);

-- Index for quick lookup
CREATE INDEX idx_phone ON wifi_registrations(phone);
CREATE INDEX idx_mac ON wifi_registrations(mac_address);
CREATE INDEX idx_expires ON wifi_registrations(expires_at);
```

---

## 🔌 การเชื่อมต่อกับ Router

### ใช้ API ควบคุม Router:

#### 1. UniFi Controller API
```typescript
// ตัวอย่าง: เพิ่ม Guest ใน UniFi
import axios from 'axios';

async function authorizeDevice(mac: string, duration: number) {
  const response = await axios.post(
    'https://unifi-controller:8443/api/s/default/cmd/stamgr',
    {
      cmd: 'authorize-guest',
      mac: mac,
      minutes: duration,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.UNIFI_TOKEN}`,
      },
    }
  );
  return response.data;
}
```

#### 2. MikroTik RouterOS API
```typescript
import RouterOSClient from 'routeros-client';

async function addHotspotUser(mac: string, password: string) {
  const client = new RouterOSClient({
    host: process.env.MIKROTIK_HOST,
    user: process.env.MIKROTIK_USER,
    password: process.env.MIKROTIK_PASS,
  });

  await client.connect();
  await client.write('/ip/hotspot/user/add', [
    '=name=' + mac,
    '=mac-address=' + mac,
    '=password=' + password,
    '=limit-uptime=2h',
  ]);
  await client.close();
}
```

---

## 📱 การสร้าง QR Code

### วิธีที่ 1: ใช้เว็บสร้าง QR
```
URL ที่ให้สแกน: https://wifi.yourhospital.com
```

### วิธีที่ 2: สร้างเองด้วย Code
```typescript
import QRCode from 'qrcode';

// สร้าง QR Code
const url = 'https://wifi.yourhospital.com';
QRCode.toFile('hospital-wifi-qr.png', url, {
  width: 500,
  margin: 2,
});
```

### ไฟล์ QR ที่พิมพ์:
- ขนาด A4
- มีคำอธิบาย: "สแกนเพื่อเชื่อมต่อ WiFi ฟรี"
- ติดตามจุดต่างๆ: แผนกต้อนรับ, ห้องพักคอย, ลิฟท์

---

## 🔒 Security Best Practices

### 1. แยก Network
```
- WiFi หลัก (Hospital-Staff): สำหรับเจ้าหน้าที่
- WiFi Guest (Hospital-Guest): สำหรับลูกค้า (แยก VLAN)
```

### 2. จำกัดการใช้งาน
```
- Bandwidth: 5 Mbps/user
- Time Limit: 2 ชั่วโมง
- Block: P2P, Torrent
- Content Filter: Adult content, Malware sites
```

### 3. ข้อมูลส่วนตัว
```
- เก็บ Log ตาม PDPA
- เข้ารหัส Database
- ลบข้อมูลเก่าทุก 90 วัน
```

---

## 📊 Monitoring & Analytics

### ติดตั้ง Analytics (Optional)
```bash
npm install @vercel/analytics
```

### ข้อมูลที่ควรติดตาม:
- จำนวนผู้ลงทะเบียนต่อวัน
- อุปกรณ์ที่ใช้งาน (iOS/Android/Laptop)
- เวลาที่ใช้งานมากที่สุด
- ปัญหา/Error ที่เกิดขึ้น

---

## 🆘 Troubleshooting

### ปัญหา: ลูกค้าสแกน QR แล้วไม่เข้าหน้าลงทะเบียน
**แก้ไข:**
- ตรวจสอบว่าเชื่อมต่อ WiFi "Hospital-Guest" แล้ว
- ตรวจสอบ Firewall ว่าเปิดให้เข้า Domain ของเราได้

### ปัญหา: ลงทะเบียนแล้วแต่ไม่มีเน็ต
**แก้ไข:**
- ตรวจสอบ MAC Address ถูกเพิ่มใน Router หรือไม่
- ตรวจสอบ Firewall Rules
- ลองรีสตาร์ท WiFi บนอุปกรณ์

### ปัญหา: ครบ 2 ชม. แล้วยังใช้งานได้
**แก้ไข:**
- ตั้ง Cron Job ลบ expired sessions
- ตรวจสอบ Router API integration

---

## 📞 Support

หากต้องการความช่วยเหลือเพิ่มเติม:
1. ตรวจสอบ Logs ใน Vercel Dashboard
2. ดู Router Logs
3. ติดต่อทีม IT

---

## 🎯 Next Steps

1. ✅ Deploy แอพพลิเคชัน
2. ✅ ตั้งค่า Router/Captive Portal
3. ✅ เชื่อมต่อ Database
4. ✅ ทดสอบระบบ
5. ✅ พิมพ์ QR Code และติดตามจุดต่างๆ
6. ✅ Train เจ้าหน้าที่
7. ✅ เปิดใช้งาน Production
