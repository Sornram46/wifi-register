const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// URL ของระบบ - เปลี่ยนเป็น domain จริงของคุณ
const REGISTRATION_URL = 'https://wifi.yourhospital.com';
// หรือสำหรับ testing: 'http://localhost:3000'

const outputDir = path.join(__dirname, '../public/qr-codes');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateQRCodes() {
  console.log('🎨 กำลังสร้าง QR Codes...\n');

  try {
    // 1. QR Code ขนาดใหญ่สำหรับพิมพ์โปสเตอร์ A4
    console.log('📱 สร้าง QR Code ขนาดใหญ่...');
    await QRCode.toFile(path.join(outputDir, 'qr-large.png'), REGISTRATION_URL, {
      width: 1000,
      margin: 2,
      errorCorrectionLevel: 'H', // High - ทนต่อความเสียหาย 30%
      color: {
        dark: '#1e3a8a',  // น้ำเงินเข้ม
        light: '#ffffff'
      }
    });
    console.log('   ✅ qr-large.png (1000x1000px)\n');

    // 2. QR Code ขนาดกลางสำหรับ Table Tent
    console.log('🏷 สร้าง QR Code ขนาดกลาง...');
    await QRCode.toFile(path.join(outputDir, 'qr-medium.png'), REGISTRATION_URL, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    console.log('   ✅ qr-medium.png (500x500px)\n');

    // 3. QR Code ขนาดเล็กสำหรับสติ๊กเกอร์
    console.log('🎫 สร้าง QR Code ขนาดเล็ก...');
    await QRCode.toFile(path.join(outputDir, 'qr-small.png'), REGISTRATION_URL, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    console.log('   ✅ qr-small.png (300x300px)\n');

    // 4. SVG สำหรับความละเอียดไม่จำกัด
    console.log('🎨 สร้าง QR Code แบบ SVG...');
    const svg = await QRCode.toString(REGISTRATION_URL, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    });
    fs.writeFileSync(path.join(outputDir, 'qr-code.svg'), svg);
    console.log('   ✅ qr-code.svg (Vector - ไม่จำกัดขนาด)\n');

    // 5. สร้าง HTML สำหรับ preview
    console.log('🌐 สร้างหน้า Preview...');
    const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Preview - WiFi Registration</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
    }
    .card h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }
    .card p {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .card img {
      max-width: 100%;
      height: auto;
      border: 3px solid #f0f0f0;
      border-radius: 10px;
      margin-bottom: 15px;
    }
    .specs {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin-top: 15px;
    }
    .specs p {
      margin: 5px 0;
      font-size: 0.9rem;
      color: #555;
    }
    .url {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 10px;
      margin-top: 30px;
      text-align: center;
    }
    .url code {
      color: #1976d2;
      font-weight: bold;
      font-size: 1.1rem;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 50px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 QR Code Preview - WiFi Registration</h1>
    
    <div class="url">
      <p style="color: #333; margin-bottom: 10px;">QR Code นี้จะนำไปที่:</p>
      <code>${REGISTRATION_URL}</code>
    </div>

    <div class="grid">
      <div class="card">
        <h2>🖼 Large (โปสเตอร์)</h2>
        <p>สำหรับพิมพ์ติดผนัง หรือโปสเตอร์ A4</p>
        <img src="qr-large.png" alt="QR Large">
        <div class="specs">
          <p><strong>ขนาด:</strong> 1000 x 1000 px</p>
          <p><strong>ใช้สำหรับ:</strong> โปสเตอร์ A4, ป้ายใหญ่</p>
          <p><strong>ระยะสแกน:</strong> 1-2 เมตร</p>
        </div>
      </div>

      <div class="card">
        <h2>🏷 Medium (Table Tent)</h2>
        <p>สำหรับตั้งบนโต๊ะหรือเคาน์เตอร์</p>
        <img src="qr-medium.png" alt="QR Medium">
        <div class="specs">
          <p><strong>ขนาด:</strong> 500 x 500 px</p>
          <p><strong>ใช้สำหรับ:</strong> Table Tent, ป้ายโต๊ะ</p>
          <p><strong>ระยะสแกน:</strong> 50-100 cm</p>
        </div>
      </div>

      <div class="card">
        <h2>🎫 Small (สติ๊กเกอร์)</h2>
        <p>สำหรับพิมพ์สติ๊กเกอร์ขนาดเล็ก</p>
        <img src="qr-small.png" alt="QR Small">
        <div class="specs">
          <p><strong>ขนาด:</strong> 300 x 300 px</p>
          <p><strong>ใช้สำหรับ:</strong> สติ๊กเกอร์, นามบัตร</p>
          <p><strong>ระยะสแกน:</strong> 20-50 cm</p>
        </div>
      </div>

      <div class="card">
        <h2>🎨 SVG (Vector)</h2>
        <p>ความละเอียดไม่จำกัด สำหรับงานพิมพ์ขนาดใหญ่</p>
        <img src="qr-code.svg" alt="QR SVG">
        <div class="specs">
          <p><strong>รูปแบบ:</strong> Vector (SVG)</p>
          <p><strong>ใช้สำหรับ:</strong> งานพิมพ์ทุกขนาด</p>
          <p><strong>ข้อดี:</strong> ขยายได้ไม่เบลอ</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>💡 Tips: ทดสอบสแกนทุก QR Code ก่อนนำไปพิมพ์จริง</p>
      <p>🎨 สร้างโดย generate-qr.js</p>
    </div>
  </div>
</body>
</html>
    `;
    fs.writeFileSync(path.join(outputDir, 'preview.html'), htmlContent);
    console.log('   ✅ preview.html (เปิดด้วยเบราว์เซอร์เพื่อดู QR Code)\n');

    // สรุปผลลัพธ์
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ สร้าง QR Code สำเร็จแล้ว!\n');
    console.log('📁 ไฟล์ทั้งหมดอยู่ที่: public/qr-codes/\n');
    console.log('📋 รายการไฟล์:');
    console.log('   • qr-large.png   - โปสเตอร์ A4');
    console.log('   • qr-medium.png  - Table Tent');
    console.log('   • qr-small.png   - สติ๊กเกอร์');
    console.log('   • qr-code.svg    - Vector (ไม่จำกัดขนาด)');
    console.log('   • preview.html   - Preview ทั้งหมด\n');
    console.log('🌐 เปิด preview.html เพื่อดู QR Code ทั้งหมด');
    console.log('🔗 URL: ' + REGISTRATION_URL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  }
}

// เรียกใช้งาน
generateQRCodes();
