import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/authors/[slug]
 * Returns a single author by slug with their stories
 * 
 * Query Parameters:
 * - page: Page number for stories (default: 1)
 * - limit: Items per page for stories (default: 10)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters for stories
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // Fetch author
    const author = await db.author.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatarUrl: true,
        memberSince: true,
        createdAt: true,
        _count: {
          select: {
            stories: true,
          },
        },
      },
    });

    if (!author) {
      return NextResponse.json(
        {
          success: false,
          error: 'Author not found',
        },
        { status: 404 }
      );
    }

    // Fetch author's stories with pagination
    const [stories, totalStories] = await Promise.all([
      db.story.findMany({
        where: { authorId: author.id },
        select: {
          id: true,
          externalId: true,
          title: true,
          slug: true,
          description: true,
          rating: true,
          votesCount: true,
          readsCount: true,
          commentsCount: true,
          publishedAt: true,
          createdAt: true,
          genre: {
            select: {
              id: true,
              name: true,
              slug: true,
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
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.story.count({
        where: { authorId: author.id },
      }),
    ]);

    const totalPages = Math.ceil(totalStories / limit);

    // Transform stories to flatten themes
    const transformedStories = stories.map((story) => ({
      ...story,
      themes: story.themes.map((st) => st.theme),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...author,
        storyCount: author._count.stories,
        _count: undefined,
        stories: transformedStories,
      },
      storiesPagination: {
        page,
        limit,
        total: totalStories,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch author',
      },
      { status: 500 }
    );
  }
}
