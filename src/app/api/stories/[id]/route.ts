import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/stories/[id]
 * Returns a single story by ID with full content and all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await db.story.findUnique({
      where: { id },
      select: {
        id: true,
        externalId: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        rating: true,
        votesCount: true,
        readsCount: true,
        commentsCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
            bio: true,
            avatarUrl: true,
            memberSince: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        themes: {
          select: {
            theme: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        {
          success: false,
          error: 'Story not found',
        },
        { status: 404 }
      );
    }

    // Transform themes array for cleaner response
    const transformedStory = {
      ...story,
      themes: story.themes.map((st) => st.theme),
    };

    return NextResponse.json({
      success: true,
      data: transformedStory,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch story',
      },
      { status: 500 }
    );
  }
}
