import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/themes
 * Returns all themes sorted by sortOrder, including story counts
 */
export async function GET(request: NextRequest) {
  try {
    const themes = await db.theme.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        storyCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: themes,
      count: themes.length,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch themes',
      },
      { status: 500 }
    );
  }
}
