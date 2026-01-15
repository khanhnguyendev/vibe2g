import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
    logger.info({ event: 'health_check_initiated' }, 'Health check endpoint called');

    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };

    logger.debug({ healthData }, 'Detailed health data constructed');

    return NextResponse.json(healthData);
}
