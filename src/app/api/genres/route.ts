import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/genres
 * Returns all genres sorted by sortOrder, including story counts
 */
export async function GET(request: NextRequest) {
  try {
    const genres = await db.genre.findMany({
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
      data: genres,
      count: genres.length,
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch genres',
      },
      { status: 500 }
    );
  }
}
