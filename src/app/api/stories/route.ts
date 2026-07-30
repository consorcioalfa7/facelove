import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface StoriesQueryParams {
  page?: string;
  limit?: string;
  genre?: string;
  theme?: string;
  author?: string;
  search?: string;
  sortBy?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

type SortField = 'publishedAt' | 'rating' | 'readsCount' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

/**
 * Parsed and validated query parameters for stories endpoint
 */
interface ParsedStoriesQueryParams {
  page: number;
  limit: number;
  genre?: string;
  theme?: string;
  author?: string;
  search?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

/**
 * Parse and validate query parameters
 */
function parseQueryParams(searchParams: URLSearchParams): ParsedStoriesQueryParams {
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const rawSortBy = searchParams.get('sortBy');

  const page = Math.max(1, parseInt(rawPage || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

  // Parse sortBy parameter
  let sortBy: SortField = 'createdAt';
  let sortOrder: SortOrder = 'desc';

  if (rawSortBy) {
    switch (rawSortBy.toLowerCase()) {
      case 'date':
        sortBy = 'publishedAt';
        sortOrder = 'desc';
        break;
      case 'rating':
        sortBy = 'rating';
        sortOrder = 'desc';
        break;
      case 'reads':
        sortBy = 'readsCount';
        sortOrder = 'desc';
        break;
      case 'oldest':
        sortBy = 'publishedAt';
        sortOrder = 'asc';
        break;
      case 'title':
        sortBy = 'title';
        sortOrder = 'asc';
        break;
      default:
        sortBy = 'createdAt';
        sortOrder = 'desc';
    }
  }

  return {
    page,
    limit,
    genre: searchParams.get('genre') || undefined,
    theme: searchParams.get('theme') || undefined,
    author: searchParams.get('author') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy,
    sortOrder,
  };
}

/**
 * GET /api/stories
 * Returns paginated stories with optional filtering by genre, theme, author, and search
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - genre: Filter by genre slug
 * - theme: Filter by theme slug
 * - author: Filter by author slug
 * - search: Search in title (case-insensitive partial match)
 * - sortBy: Sort field - date, rating, reads, oldest, title (default: date)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = parseQueryParams(searchParams);

    // Build where clause
    const where: {
      genre?: { slug: string };
      themes?: { some: { theme: { slug: string } } };
      author?: { slug: string };
      title?: { contains: string; mode: 'insensitive' };
    } = {};

    // Filter by genre slug
    if (queryParams.genre) {
      where.genre = {
        slug: queryParams.genre,
      };
    }

    // Filter by theme slug (through StoryTheme relation)
    if (queryParams.theme) {
      where.themes = {
        some: {
          theme: {
            slug: queryParams.theme,
          },
        },
      };
    }

    // Filter by author slug
    if (queryParams.author) {
      where.author = {
        slug: queryParams.author,
      };
    }

    // Search by title (case-insensitive partial match)
    if (queryParams.search) {
      where.title = {
        contains: queryParams.search,
        mode: 'insensitive',
      };
    }

    // Execute queries in parallel
    const [stories, total] = await Promise.all([
      db.story.findMany({
        where,
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
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
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
          [queryParams.sortBy]: queryParams.sortOrder,
        },
        skip: (queryParams.page - 1) * queryParams.limit,
        take: queryParams.limit,
      }),
      db.story.count({ where }),
    ]);

    const totalPages = Math.ceil(total / queryParams.limit);

    return NextResponse.json({
      success: true,
      data: stories,
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total,
        totalPages,
        hasNext: queryParams.page < totalPages,
        hasPrev: queryParams.page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stories',
      },
      { status: 500 }
    );
  }
}
