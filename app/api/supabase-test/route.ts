import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseServer';

export async function GET() {
  console.log('🔍 [Supabase Test API] Start');

  // ลองอ่านข้อมูลจากตาราง registration 1 แถว (แค่ทดสอบ connection)
  const { data, error } = await supabase
    .from('registration')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ [Supabase Test API] Error:', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  console.log('✅ [Supabase Test API] OK, rows:', data?.length ?? 0);

  return NextResponse.json({
    ok: true,
    rows: data?.length ?? 0,
  });
}