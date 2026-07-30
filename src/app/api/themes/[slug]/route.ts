import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/themes/[slug]
 * Returns a single theme by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const theme = await db.theme.findUnique({
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

    if (!theme) {
      return NextResponse.json(
        {
          success: false,
          error: 'Theme not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch theme',
      },
      { status: 500 }
    );
  }
}
