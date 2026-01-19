'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WifiPassword {
  id: string;
  password: string;
  status: string;
  user: string;
  assigned_at: string | null;
  expires_at: string | null;
  create_at: string;
}

interface Stats {
  status: string;
  count: string;
}

interface AdminUser {
  username: string;
  full_name: string;
  role: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [passwords, setPasswords] = useState<WifiPassword[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ตรวจสอบ session
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/session');
      const result = await response.json();

      if (result.authenticated) {
        setAuthenticated(true);
        setAdminUser(result.user);
        fetchPasswords();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // โหลดข้อมูล WiFi ทั้งหมด
  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/wifi');
      const result = await response.json();
      
      if (result.success) {
        setPasswords(result.data);
        setStats(result.stats);
      }
    } catch (err: any) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // จัดการการเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      setError('');
      
      // อ่านไฟล์เพื่อ preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        setPreviewData(lines.slice(0, 10)); // แสดง 10 บรรทัดแรก
      };
      reader.readAsText(selectedFile);
    }
  };

  // อัพโหลดไฟล์
  const handleUpload = async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/wifi/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ เพิ่มรหัส WiFi สำเร็จ ${result.imported} รหัส${result.skipped > 0 ? ` (ข้าม ${result.skipped} รหัสที่มีอยู่แล้ว)` : ''}`);
        setFile(null);
        setPreviewData([]);
        fetchPasswords(); // โหลดข้อมูลใหม่
        
        // Clear file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
    }
  };

  // ลบรหัส WiFi
  const handleDelete = async (id: string, password: string) => {
    if (!confirm(`ต้องการลบรหัส "${password}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/wifi?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ ลบรหัส "${password}" สำเร็จ`);
        fetchPasswords();
      } else {
        setError(result.error || 'ไม่สามารถลบได้');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // ฟอร์แมตวันที่
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🔧 Admin Panel</h1>
              <p className="text-gray-600 mt-1">
                ยินดีต้อนรับ, <strong>{adminUser?.full_name}</strong> ({adminUser?.role})
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                ← กลับหน้าหลัก
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* สถิติ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => {
            const icons: any = {
              available: '✅',
              active: '🟢',
              expired: '🔴',
            };
            const colors: any = {
              available: 'bg-green-50 border-green-200 text-green-800',
              active: 'bg-blue-50 border-blue-200 text-blue-800',
              expired: 'bg-red-50 border-red-200 text-red-800',
            };

            return (
              <div
                key={stat.status}
                className={`border-2 rounded-lg p-4 ${colors[stat.status] || 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{stat.status}</p>
                    <p className="text-3xl font-bold">{stat.count}</p>
                  </div>
                  <div className="text-4xl">{icons[stat.status] || '📊'}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📤 อัพโหลดไฟล์รหัส WiFi</h2>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์ (.txt, .csv)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.csv,.xlsx,.xls" // ← เพิ่ม .xlsx, .xls
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                รูปแบบ: .txt, .csv, .xlsx, .xls
              </p>
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ตัวอย่างข้อมูล ({previewData.length} บรรทัดแรก):
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-800 font-mono">
                    {previewData.join('\n')}
                  </pre>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '⏳ กำลังอัพโหลด...' : '📤 อัพโหลด'}
            </button>
          </div>
        </div>

        {/* WiFi Passwords List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 รายการรหัส WiFi</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">รหัส</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ผู้ใช้</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">วันที่มอบหมาย</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">วันหมดอายุ</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {passwords.map((pwd) => {
                    const statusColors: any = {
                      available: 'bg-green-100 text-green-800',
                      active: 'bg-blue-100 text-blue-800',
                      expired: 'bg-red-100 text-red-800',
                    };

                    return (
                      <tr key={pwd.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">
                          {pwd.password}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[pwd.status] || 'bg-gray-100 text-gray-800'}`}>
                            {pwd.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {pwd.user || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(pwd.assigned_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(pwd.expires_at)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pwd.status === 'available' && !pwd.user && (
                            <button
                              onClick={() => handleDelete(pwd.id, pwd.password)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                            >
                              🗑️ ลบ
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {passwords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  ไม่มีข้อมูลรหัส WiFi
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}