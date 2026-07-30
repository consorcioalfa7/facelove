import { NextRequest, NextResponse } from "next/server";

// In-memory storage for comments (replace with database in production)
let comments: Array<{
  id: string;
  storyId: string;
  author: string;
  content: string;
  rating?: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
  replies?: any[];
  isEdited?: boolean;
}> = [];

// Generate unique ID
function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// GET /api/comments - Get all comments or filter by story
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let filteredComments = [...comments];

  // Filter by story ID
  if (storyId) {
    filteredComments = filteredComments.filter((c) => c.storyId === storyId);
  }

  // Sort by date (newest first)
  filteredComments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Paginate
  const total = filteredComments.length;
  const start = (page - 1) * limit;
  const paginatedComments = filteredComments.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginatedComments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyId, content, rating, author } = body;

    // Validation
    if (!storyId || !content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "storyId and content are required",
        },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Comment must be 1000 characters or less",
        },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    const newComment = {
      id: generateId(),
      storyId,
      author: author?.trim() || "Anônimo",
      content: content.trim(),
      rating: rating ? Math.round(rating) : undefined,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
      replies: [],
      isEdited: false,
    };

    comments.unshift(newComment);

    // Update story's comment count (in a real app, you'd update the database)
    console.log(`[API] New comment on story ${storyId}: "${content.substring(0, 50)}..."`);

    return NextResponse.json({
      success: true,
      data: newComment,
      message: "Comentário publicado com sucesso!",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create comment",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?id=xxx - Delete a comment
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: "Comment ID is required",
      },
      { status: 400 }
    );
  }

  const index = comments.findIndex((c) => c.id === id);

  if (index === -1) {
    return NextResponse.json(
      {
        success: false,
        error: "Comment not found",
      },
      { status: 404 }
    );
  }

  const deleted = comments.splice(index, 1)[0];

  return NextResponse.json({
    success: true,
    data: deleted,
    message: "Comentário removido com sucesso!",
  });
}
