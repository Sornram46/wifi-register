# 📱 วิธีสร้าง QR Code สำหรับระบบ WiFi Registration

## 🎯 ภาพรวม

QR Code จะช่วยให้ลูกค้าเข้าหน้าลงทะเบียนได้ง่ายขึ้น โดยไม่ต้องพิมพ์ URL เอง

---

## 📝 ขั้นตอนการสร้าง QR Code

### วิธีที่ 1: ใช้เว็บไซต์สร้าง QR Code (ง่ายที่สุด)

1. เข้าเว็บ: https://www.qr-code-generator.com/
2. เลือก Type: **URL**
3. ใส่ URL: `https://wifi.yourhospital.com` (เปลี่ยนเป็น domain จริงของคุณ)
4. Customize:
   - Frame: "Scan me"
   - Logo: ใส่โลโก้โรงพยาบาล (Optional)
   - Color: สีตามองค์กร
5. Download เป็นไฟล์ PNG หรือ SVG ความละเอียดสูง

### วิธีที่ 2: ใช้ Canva (สวยงาม + แก้ไขได้)

1. เข้า: https://www.canva.com
2. สร้าง Design ใหม่ → A4 Portrait
3. ค้นหา Template: "QR Code Poster"
4. แก้ไข:
   - หัวข้อ: "WiFi ฟรี สำหรับลูกค้า"
   - คำอธิบาย: วิธีใช้งาน
   - สร้าง QR Code ด้วย Apps → QR Code
5. Download เป็น PDF หรือ PNG

### วิธีที่ 3: สร้างเองด้วย Code (สำหรับ Developer)

สร้างไฟล์ใหม่: `scripts/generate-qr.js`

```javascript
const QRCode = require('qrcode');
const fs = require('fs');

async function generateQRCodes() {
  const url = 'https://wifi.yourhospital.com';
  
  // QR Code สำหรับพิมพ์ขนาดใหญ่
  await QRCode.toFile('public/qr-large.png', url, {
    width: 1000,
    margin: 2,
    errorCorrectionLevel: 'H', // High - ทนต่อความเสียหาย
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // QR Code ขนาดเล็กสำหรับพิมพ์บนนามบัตร
  await QRCode.toFile('public/qr-small.png', url, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: 'H'
  });

  // SVG สำหรับความละเอียดไม่จำกัด
  const svg = await QRCode.toString(url, { 
    type: 'svg',
    errorCorrectionLevel: 'H'
  });
  fs.writeFileSync('public/qr-code.svg', svg);

  console.log('✅ QR Codes generated successfully!');
}

generateQRCodes().catch(console.error);
```

ติดตั้งและรัน:
```bash
npm install qrcode
node scripts/generate-qr.js
```

---

## 🖨 Template สำหรับพิมพ์

### แบบที่ 1: โปสเตอร์ A4 (สำหรับติดผนัง)

```
┌────────────────────────────────┐
│   [โลโก้โรงพยาบาล]              │
│                                │
│     WiFi ฟรี สำหรับลูกค้า      │
│                                │
│      [QR CODE ขนาดใหญ่]        │
│                                │
│   วิธีการใช้งาน:               │
│   1. เชื่อมต่อ WiFi            │
│      "Hospital-Guest"          │
│   2. สแกน QR Code นี้          │
│   3. กรอกข้อมูล                │
│   4. ได้รหัส WiFi ทันที!       │
│                                │
│   ใช้งานได้ 2 ชั่วโมง          │
└────────────────────────────────┘
```

### แบบที่ 2: Table Tent (ตั้งบนโต๊ะ)

```
┌─────────────────┐
│  WiFi ฟรี       │
│  [QR CODE]      │
│  สแกนเลย!       │
└─────────────────┘
```

### แบบที่ 3: Sticker (ติดบนโต๊ะ/ผนัง)

```
┌──────────┐
│ [QR CODE]│
│  WiFi    │
│  ฟรี     │
└──────────┘
```

---

## 📍 จุดที่ควรวาง QR Code

### สถานที่สำคัญ (ต้องมี):
1. ✅ **แผนกต้อนรับ/แคชเชียร์** - ตรงที่มองเห็นชัดเจน
2. ✅ **ห้องพักคอย** - ตั้งโต๊ะหรือติดผนัง
3. ✅ **ลิฟต์** - ติดข้างปุ่มกดชั้น
4. ✅ **ห้องน้ำ** - ติดตรงกระจก
5. ✅ **คลินิก/แผนกต่างๆ** - ที่นั่งรอ

### สถานที่เสริม (ควรมี):
- โรงอาหาร/ร้านกาแฟ
- ทางเดินหลัก
- ลานจอดรถ (ถ้ามี WiFi ครอบคลุม)
- ห้องประชุม

---

## 💡 Tips การออกแบบ QR Code

### ✅ ควรทำ:
- ใช้ Error Correction Level: **H** (High) - ทำให้ QR ทนต่อความเสียหาย 30%
- ขนาดขั้นต่ำ: **3x3 cm** สำหรับการพิมพ์
- เว้นระยะขอบ (Margin) อย่างน้อย 4 ช่อง
- ทดสอบสแกนก่อนพิมพ์จำนวนมาก
- ใส่คำอธิบายชัดเจน "สแกนเพื่อเชื่อมต่อ WiFi"

### ❌ ไม่ควรทำ:
- QR Code ขนาดเล็กเกินไป (< 2x2 cm)
- สีที่ contrast ไม่ชัด (ควรใช้ ดำ-ขาว)
- วาง QR ในที่มืดหรือมองไม่เห็น
- ปิด QR ด้วยอะไรทับ
- ลืมทดสอบบนมือถือหลายรุ่น

---

## 🧪 การทดสอบ QR Code

### Checklist ก่อนนำไปใช้:

- [ ] สแกนได้ด้วย iPhone (iOS)
- [ ] สแกนได้ด้วย Android
- [ ] สแกนได้จากระยะไกล 50-100 cm
- [ ] สแกนได้ในแสงน้อย
- [ ] เปิดหน้าลงทะเบียนถูกต้อง
- [ ] ไม่มี Error 404 หรือ Error อื่นๆ
- [ ] พิมพ์ออกมาชัด ไม่เบลอ

### วิธีทดสอบ:
1. พิมพ์ QR Code 1 ใบ
2. ให้คน 5-10 คนลองสแกน
3. สอบถาม Feedback
4. แก้ไขปัญหา (ถ้ามี)
5. พิมพ์จำนวนมาก

---

## 🎨 ตัวอย่าง Template พร้อมใช้

### Download Template:

1. **Canva Template**
   - A4 Poster: https://www.canva.com/design/...
   - Table Tent: https://www.canva.com/design/...
   
2. **Google Docs Template**
   - https://docs.google.com/...

3. **PowerPoint Template**
   - รวมอยู่ใน `/public/templates/`

---

## 📦 ไฟล์ที่ได้หลังจากสร้าง

```
wifi-register/
  public/
    qr-codes/
      qr-large.png        (1000x1000px - สำหรับพิมพ์โปสเตอร์)
      qr-small.png        (300x300px - สำหรับนามบัตร)
      qr-code.svg         (Vector - ขยายได้ไม่จำกัด)
    templates/
      A4-poster.pdf       (โปสเตอร์ A4 พร้อมใช้)
      table-tent.pdf      (ตั้งโต๊ะ)
      sticker.pdf         (สติ๊กเกอร์)
```

---

## 🖨 การสั่งพิมพ์

### ร้านพิมพ์ที่แนะนำ:
- **โปสเตอร์ A4**: กระดาษอาร์ต 150-200 แกรม, เคลือบ Matt
- **Table Tent**: กระดาษการ์ด 260 แกรม, พับครึ่ง
- **Sticker**: สติ๊กเกอร์กันน้ำ

### ราคาประมาณการ:
- โปสเตอร์ A4: 15-30 บาท/แผ่น
- Table Tent: 20-40 บาท/ชุด
- Sticker: 10-15 บาท/แผ่น

### จำนวนที่สั่ง:
- โปสเตอร์: 10-20 แผ่น (ตามจำนวนจุดวาง)
- Table Tent: 30-50 ชุด (บนโต๊ะ)
- Sticker: 100-200 ดวง (แจกเจ้าหน้าที่)

---

## ✅ Checklist การติดตั้ง

หลังจากได้ QR Code แล้ว:

- [ ] พิมพ์ QR Code ทุกแบบที่ต้องการ
- [ ] ทดสอบสแกนอีกครั้งหลังพิมพ์
- [ ] เตรียมอุปกรณ์ติดตั้ง (เทป, กาว, กรอบรูป)
- [ ] วางตามจุดที่กำหนด
- [ ] ถ่ายรูปบันทึกว่าวางที่ไหนบ้าง
- [ ] แจ้งเจ้าหน้าที่เกี่ยวกับระบบใหม่
- [ ] สร้างคู่มือสำหรับเจ้าหน้าที่

---

## 📞 หมายเหตุ

- เปลี่ยน QR Code ทุก 6 เดือน (ถ้า URL เปลี่ยน)
- ตรวจสอบสภาพ QR Code ที่ติดไว้ทุกเดือน
- เก็บไฟล์ต้นฉบับไว้สำหรับพิมพ์เพิ่ม
