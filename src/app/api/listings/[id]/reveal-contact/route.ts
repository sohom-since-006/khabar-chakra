import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Public food listings and donor contacts are completely removed. Khabar Chakra is strictly dedicated to private household kitchen inventory and zero-waste analytics.' },
    { status: 410 }
  );
}
