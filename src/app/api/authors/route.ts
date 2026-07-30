import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/authors
 * Returns all authors with their story counts
 */
export async function GET(request: NextRequest) {
  try {
    const authors = await db.author.findMany({
      orderBy: {
        name: 'asc',
      },
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

    // Transform _count to storyCount for cleaner API response
    const transformedAuthors = authors.map((author) => ({
      ...author,
      storyCount: author._count.stories,
      _count: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedAuthors,
      count: transformedAuthors.length,
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch authors',
      },
      { status: 500 }
    );
  }
}
