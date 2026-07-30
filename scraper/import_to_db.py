#!/usr/bin/env python3
"""
Database Import Script for StoryVault
=====================================

Imports scraped data (JSONL files) into SQLite database via Prisma-compatible JSON.
This script transforms the scraped JSONL into importable format.

Usage:
    python import_to_db.py --input ./output/stories_fiction.jsonl
    python import_to_db.py --all  # Import all JSONL files from output/

Output:
    - JSON files ready for database import
    - Can be used with Prisma seed script or direct SQL import

Author: StoryVault
Version: 1.0.0
"""

import argparse
import json
import os
import re
from pathlib import Path
from datetime import datetime
from typing import Optional


# ============================================================================
# CONFIGURATION
# ============================================================================

INPUT_DIR = Path("./output")
OUTPUT_DIR = Path("./import_output")


# ============================================================================
# DATA TRANSFORMATION
# ============================================================================

def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text


def transform_genre(genre_data: dict) -> dict:
    """Transform scraped genre to database format."""
    return {
        "name": genre_data.get("name", ""),
        "slug": genre_data.get("slug", slugify(genre_data.get("name", ""))),
        "description": genre_data.get("description"),
        "sortOrder": genre_data.get("id", 0),
        "externalId": genre_data.get("id"),
        "storyCount": genre_data.get("story_count", 0),
    }


def transform_theme(theme_data: dict) -> dict:
    """Transform scraped theme to database format."""
    return {
        "name": theme_data.get("name", ""),
        "slug": theme_data.get("slug", slugify(theme_data.get("name", ""))),
        "description": theme_data.get("description"),
        "sortOrder": theme_data.get("id", 0),
        "externalId": theme_data.get("id"),
        "storyCount": theme_data.get("story_count", 0),
    }


def transform_author(author_data: dict) -> dict:
    """Transform scraped author to database format."""
    return {
        "name": author_data.get("name", "Unknown"),
        "slug": author_data.get("slug", slugify(author_data.get("name", "unknown"))),
        "bio": author_data.get("bio"),
        "memberSince": author_data.get("member_since"),
        "externalId": author_data.get("id"),
    }


def transform_story(story_data: dict) -> dict:
    """Transform scraped story to database format."""
    # Extract nested objects
    author = story_data.get("author")
    genre = story_data.get("genre")
    themes = story_data.get("themes", [])
    
    result = {
        "externalId": story_data.get("external_id"),
        "title": story_data.get("title", ""),
        "slug": story_data.get("slug", slugify(story_data.get("title", ""))),
        "description": story_data.get("description"),
        "content": story_data.get("content"),
        "rating": story_data.get("rating", 0),
        "votesCount": story_data.get("votes_count", 0),
        "readsCount": story_data.get("reads_count", 0),
        "commentsCount": story_data.get("comments_count", 0),
        "publishedAt": story_data.get("published_at"),
        "author": transform_author(author) if author else None,
        "genre": transform_genre(genre) if genre else None,
        "themeSlugs": [t.get("slug", "") for t in themes if isinstance(t, dict)],
    }
    
    return result


# ============================================================================
# IMPORT FUNCTIONS
# ============================================================================

def import_genres(input_file: Path, output_file: Path):
    """Import genres from JSONL file."""
    genres = []
    
    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data = json.loads(line)
                genres.append(transform_genre(data))
    
    output = {
        "model": "Genre",
        "count": len(genres),
        "data": genres,
        "importedAt": datetime.now().isoformat(),
    }
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Imported {len(genres)} genres → {output_file}")


def import_themes(input_file: Path, output_file: Path):
    """Import themes from JSONL file."""
    themes = []
    
    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data = json.loads(line)
                themes.append(transform_theme(data))
    
    output = {
        "model": "Theme",
        "count": len(themes),
        "data": themes,
        "importedAt": datetime.now().isoformat(),
    }
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Imported {len(themes)} themes → {output_file}")


def import_stories(input_file: Path, output_file: Path):
    """Import stories from JSONL file."""
    stories = []
    authors_set = {}
    genres_set = {}
    
    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data = json.loads(line)
                story = transform_story(data)
                stories.append(story)
                
                # Collect unique authors and genres
                if story.get("author"):
                    author_slug = story["author"]["slug"]
                    if author_slug not in authors_set:
                        authors_set[author_slug] = story["author"]
                        
                if story.get("genre"):
                    genre_slug = story["genre"]["slug"]
                    if genre_slug not in genres_set:
                        genres_set[genre_slug] = story["genre"]
    
    output = {
        "model": "Story",
        "count": len(stories),
        "data": stories,
        "authors": list(authors_set.values()),
        "genres": list(genres_set.values()),
        "importedAt": datetime.now().isoformat(),
    }
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Imported {len(stories)} stories → {output_file}")
    print(f"   Unique authors: {len(authors_set)}")
    print(f"   Unique genres: {len(genres_set)}")


def generate_prisma_seed(json_file: Path, seed_file: Path):
    """Generate a TypeScript seed file from imported JSON."""
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    model = data.get("model", "Unknown")
    items = data.get("data", [])
    
    lines = [
        "// Auto-generated seed data",
        f"// Source: {json_file.name}",
        f"// Generated: {data.get('importedAt', 'unknown')}",
        f"// Count: {len(items)}",
        "",
        f"import {{ PrismaClient }} from '@prisma/client';",
        "",
        "const prisma = new PrismaClient();",
        "",
        f"const {model.lower()}s = {json.dumps(items, indent=2, ensure_ascii=False)};",
        "",
        "async function main() {",
        f'  console.log(`Seeding {len(items)} {model.lower()}s...`);',
        "",
    ]
    
    if model == "Story":
        lines.extend([
            "  for (const item of items) {",
            "    // Create or get author",
            "    let author = null;",
            "    if (item.author) {",
            "      author = await prisma.author.upsert({",
            "        where: { slug: item.author.slug },",
            "        update: {},",
            "        create: {",
            "          name: item.author.name,",
            "          slug: item.author.slug,",
            "          bio: item.author.bio,",
            "        },",
            "      });",
            "    }",
            "",
            "    // Create or get genre",
            "    let genre = null;",
            "    if (item.genre) {",
            "      genre = await prisma.genre.upsert({",
            "        where: { slug: item.genre.slug },",
            "        update: {},",
            "        create: {",
            "          name: item.genre.name,",
            "          slug: item.genre.slug,",
            "          externalId: item.genre.externalId,",
            "        },",
            "      });",
            "    }",
            "",
            "    // Create story",
            "    if (author && genre) {",
            "      const story = await prisma.story.create({",
            "        data: {",
            "          externalId: item.externalId,",
            "          title: item.title,",
            "          slug: item.slug,",
            "          content: item.content,",
            "          rating: item.rating,",
            "          readsCount: item.readsCount,",
            "          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,",
            "          authorId: author.id,",
            "          genreId: genre.id,",
            "        },",
            "      });",
            "",
            "      // Connect themes",
            "      if (item.themeSlugs && item.themeSlugs.length > 0) {",
            "        for (const themeSlug of item.themeSlugs) {",
            "          const theme = await prisma.theme.findUnique({ where: { slug: themeSlug } });",
            "          if (theme) {",
            "            await prisma.storyTheme.create({",
            "              data: { storyId: story.id, themeId: theme.id },",
            "            });",
            "          }",
            "        }",
            "      }",
            "    }",
            "  }",
        ])
    else:
        lines.extend([
            "  for (const item of items) {",
            f"    await prisma.{model.lower()}.create({{ data: item }});",
            "  }",
        ])
    
    lines.extend([
        "",
        "  console.log('Done!');",
        "}",
        "",
        "main().catch(console.error).finally(() => prisma.$disconnect());",
        "",
    ])
    
    with open(seed_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    print(f"✅ Generated Prisma seed file → {seed_file}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Import scraped data to database format")
    parser.add_argument("--input", help="Input JSONL file")
    parser.add_argument("--all", action="store_true", help="Import all files from output/")
    parser.add_argument("--generate-seed", action="store_true", help="Generate Prisma seed file after import")
    
    args = parser.parse_args()
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    if args.all:
        # Import all files
        genres_file = INPUT_DIR / "genres.jsonl"
        themes_file = INPUT_DIR / "themes.jsonl"
        
        if genres_file.exists():
            import_genres(genres_file, OUTPUT_DIR / "genres_import.json")
            
        if themes_file.exists():
            import_themes(themes_file, OUTPUT_DIR / "themes_import.json")
            
        # Import all story files
        story_files = list(INPUT_DIR.glob("stories_*.jsonl"))
        for sf in story_files:
            output_name = sf.stem.replace("stories_", "stories_import_") + ".json"
            import_stories(sf, OUTPUT_DIR / output_name)
            
        if args.generate_seed:
            for json_file in OUTPUT_DIR.glob("*_import.json"):
                seed_file = OUTPUT_DIR / f"seed_{json_file.stem}.ts"
                generate_prisma_seed(json_file, seed_file)
                
    elif args.input:
        input_path = Path(args.input)
        if not input_path.exists():
            print(f"❌ File not found: {input_path}")
            return
            
        if "genres" in input_path.name:
            import_genres(input_path, OUTPUT_DIR / "genres_import.json")
        elif "themes" in input_path.name:
            import_themes(input_path, OUTPUT_DIR / "themes_import.json")
        else:
            import_stories(input_path, OUTPUT_DIR / "stories_import.json")
            
        if args.generate_seed:
            generate_prisma_seed(OUTPUT_DIR / "stories_import.json", OUTPUT_DIR / "seed_generated.ts")
            
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
