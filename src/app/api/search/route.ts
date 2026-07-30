import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const type = searchParams.get("type") || "all"; // all, stories, genres, themes, authors

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        results: [],
        query,
        total: 0,
      });
    }

    const suggestions: Array<{
      id: string;
      title: string;
      type: "story" | "genre" | "theme" | "author";
    }> = [];

    const results: Record<string, unknown[]> = {
      stories: [],
      genres: [],
      themes: [],
      authors: [],
    };

    // Search stories
    if (type === "all" || type === "stories") {
      const stories = await db.story.findMany({
        where: {
          publishedAt: { not: null },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          author: { select: { name: true, slug: true } },
          genre: { select: { name: true, slug: true } },
          _count: { select: { themes: true } },
        },
        take: type === "stories" ? limit : Math.ceil(limit / 2),
        orderBy: [{ readsCount: "desc" }, { rating: "desc" }],
      });

      results.stories = stories.map((s) => ({
        ...s,
        type: "story",
      }));

      stories.slice(0, 5).forEach((story) => {
        suggestions.push({
          id: story.id,
          title: story.title,
          type: "story",
        });
      });
    }

    // Search genres
    if (type === "all" || type === "genres") {
      const genres = await db.genre.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: type === "genres" ? limit : 5,
        orderBy: { storyCount: "desc" },
      });

      results.genres = genres;

      genres.slice(0, 3).forEach((genre) => {
        suggestions.push({
          id: genre.slug,
          title: genre.name,
          type: "genre",
        });
      });
    }

    // Search themes
    if (type === "all" || type === "themes") {
      const themes = await db.theme.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: type === "themes" ? limit : 5,
        orderBy: { storyCount: "desc" },
      });

      results.themes = themes;

      themes.slice(0, 3).forEach((theme) => {
        suggestions.push({
          id: theme.slug,
          title: theme.name,
          type: "theme",
        });
      });
    }

    // Search authors
    if (type === "all" || type === "authors") {
      const authors = await db.author.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } },
          ],
        },
        take: type === "authors" ? limit : 5,
        orderBy: { name: "asc" },
      });

      results.authors = authors;

      authors.slice(0, 3).forEach((author) => {
        suggestions.push({
          id: author.slug,
          title: author.name,
          type: "author",
        });
      });
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 10),
      results,
      query,
      total: suggestions.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform search",
        suggestions: [],
        results: {},
        total: 0,
      },
      { status: 500 }
    );
  }
}
