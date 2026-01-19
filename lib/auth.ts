import { cookies } from 'next/headers';

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');

  if (!sessionCookie) {
    return null;
  }

  try {
    // แปลง session จาก JSON
    const session = JSON.parse(sessionCookie.value);
    
    // ตรวจสอบว่า session หมดอายุหรือไม่
    if (session.expires && new Date(session.expires) < new Date()) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function setAdminSession(user: AdminUser) {
  const cookieStore = await cookies();
  
  // สร้าง session (หมดอายุ 24 ชั่วโมง)
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  const session = {
    user,
    expires: expires.toISOString(),
  };

  cookieStore.set('admin_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}