'use client';

import { useState } from 'react';

interface WifiCredentials {
  wifi_ssid: string;
  wifi_password: string;
  expires_at: string;
  registration_id: string;
}

export default function Home() {
  const [formData, setFormData] = useState({
    phone: '',
    passport: '',
    userType: 'OPD', // OPD (ผู้ป่วยนอก) หรือ IPD (ผู้ป่วยใน)
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wifiCredentials, setWifiCredentials] = useState<WifiCredentials | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('📤 Sending registration request...');
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: formData.userType,
          phone: formData.phone,
          passport: formData.passport,
          acceptTerms: formData.acceptTerms,
        }),
      });

      console.log('📥 Response status:', response.status);

      // ตรวจสอบว่า response มี content หรือไม่
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Response is not JSON:', text);
        throw new Error('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }

      const result = await response.json();
      console.log('✅ Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }

      setWifiCredentials(result.data);
      setIsSuccess(true);
      console.log('🎉 Registration successful!');
      
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      alert('คัดลอกสำเร็จแล้ว');
    } catch (err) {
      console.error('Copy failed', err);
      alert('คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  if (isSuccess && wifiCredentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">ลงทะเบียนสำเร็จ!</h2>
            <p className="text-gray-600">ข้อมูล WiFi ของคุณ</p>
          </div>

          {/* WiFi Credentials */}
          <div className="space-y-4 mb-6">
            {/* SSID */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <label className="text-sm text-gray-600 block mb-1">ชื่อ WiFi (SSID)</label>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">{wifiCredentials.wifi_ssid}</span>
                <button
                  onClick={() => copyToClipboard(wifiCredentials.wifi_ssid)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="คัดลอก"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <label className="text-sm text-gray-600 block mb-1">รหัส WiFi</label>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                  {wifiCredentials.wifi_password}
                </span>
                <button
                  onClick={() => copyToClipboard(wifiCredentials.wifi_password)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="คัดลอก"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expiry Time */}
            <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-600">อายุการใช้งาน</p>
                <p className="font-semibold text-gray-800">{wifiCredentials.expires_at}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              วิธีการเชื่อมต่อ
            </h3>
            <ol className="text-sm text-gray-600 space-y-1 ml-7 list-decimal">
              <li>เปิดการตั้งค่า WiFi บนอุปกรณ์ของคุณ</li>
              <li>เลือกเครือข่าย "BPK9-Public"</li>
              <li>ใส่รหัส: <span className="font-mono font-semibold">{wifiCredentials.wifi_ssid} และ {wifiCredentials.wifi_password}</span></li>
              <li>เริ่มใช้งานอินเทอร์เน็ตได้เลย!</li>
            </ol>
          </div>

          <button
            onClick={() => { 
              setIsSuccess(false);
              setFormData({ 
                phone: '', 
                passport: '', 
                userType: 'OPD', 
                acceptTerms: false 
              });
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            ลงทะเบียนใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            WiFi ฟรี
          </h1>
          <p className="text-gray-600">
            กรุณากรอกข้อมูลเพื่อเชื่อมต่อ WiFi
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ประเภทผู้ใช้งาน <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'OPD' }))}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                  formData.userType === 'OPD'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105 ring-2 ring-teal-300'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-teal-500 hover:scale-102 hover:shadow-md active:scale-95'
                }`}
              >
                OPD (ผู้ป่วยนอก)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: 'IPD' }))}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                  formData.userType === 'IPD'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105 ring-2 ring-teal-300'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-teal-500 hover:scale-102 hover:shadow-md active:scale-95'
                }`}
              >
                IPD (ผู้ป่วยใน)
              </button>
            </div>
          </div>

          {/* Phone Input */}
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="0[0-9]{9}"
              className="peer w-full px-4 py-3 pt-6 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
              placeholder=" "
            />
            <label 
              htmlFor="phone" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
            >
              เบอร์โทรศัพท์/Phone Number <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Passport Input */}
          <div className="relative">
            <input
              type="text"
              id="passport"
              name="passport"
              value={formData.passport}
              onChange={handleChange}
              className="peer w-full px-4 py-3 pt-6 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
              placeholder=" "
            />
            <label 
              htmlFor="passport" 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
            >
              บัตรประชาชน/Passport
            </label>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start group">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
              className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500"
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-600 cursor-pointer transition-colors group-hover:text-gray-800">
              ฉันยอมรับ{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline-offset-2 hover:underline">
                เงื่อนไขการใช้งาน
              </a>{' '}
              และ{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline-offset-2 hover:underline">
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเชื่อมต่อ...
              </span>
            ) : (
              'เชื่อมต่อ WiFi'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 WiFi จะใช้งานได้ 2 ชั่วโมง</p>
        </div>
      </div>
    </div>
  );
}
