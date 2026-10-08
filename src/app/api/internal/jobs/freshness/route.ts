import { NextRequest, NextResponse } from 'next/server';
import { generateFreshnessAlerts } from '@/domain/freshnessAlerts';
import { InventoryItem } from '@/domain/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Verify cron secret header
  const authHeader = req.headers.get('x-cron-secret') || req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';

  const providedSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    let itemsToProcess: InventoryItem[] = [];

    // Optional payload if items are passed in the request body
    const bodyText = await req.text();
    if (bodyText) {
      try {
        const body = JSON.parse(bodyText);
        if (Array.isArray(body.items)) {
          itemsToProcess = body.items;
        }
      } catch {
        // invalid JSON in body, continue with empty
      }
    }

    const now = new Date();
    const alerts = generateFreshnessAlerts(itemsToProcess, now);

    return NextResponse.json({
      success: true,
      job: 'freshness_alerts_evaluation',
      evaluatedAt: now.toISOString(),
      processedCount: itemsToProcess.length,
      alertsCount: alerts.length,
      alerts: alerts.slice(0, 50), // Sample for audit log
    });
  } catch (error) {
    console.error('Freshness job error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing freshness job' },
      { status: 500 }
    );
  }
}
