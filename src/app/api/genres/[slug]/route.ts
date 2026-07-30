import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/genres/[slug]
 * Returns a single genre by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const genre = await db.genre.findUnique({
      where: { slug },
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

    if (!genre) {
      return NextResponse.json(
        {
          success: false,
          error: 'Genre not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: genre,
    });
  } catch (error) {
    console.error('Error fetching genre:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch genre',
      },
      { status: 500 }
    );
  }
}
