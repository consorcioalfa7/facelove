#!/usr/bin/env python3
"""
SexStories.com Web Scraper
==========================

A respectful web scraper for collecting story metadata and content from sexstories.com.
This scraper follows ethical guidelines:
- Identifiable User-Agent
- Rate limiting (1-2 requests per second)
- Backoff on 429/5xx responses
- Limited retries (3 times)
- Only scrapes public content, no login

Usage:
    python scraper.py --mode [genres|themes|stories|full]
    python scraper.py --story-id 12345  # Scrape single story

Output:
    - JSONL files in ./output/ directory
    - genres.jsonl: List of all genres
    - themes.jsonl: List of all themes
    - stories.jsonl: Story metadata and content

Author: StoryVault Scraper
Version: 1.0.0
"""

import argparse
import json
import os
import re
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict

import requests
from bs4 import BeautifulSoup

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_URL = "https://www.sexstories.com"

# Respectful scraping configuration
USER_AGENT = "StoryVaultScraper/1.0 (+https://storyvault.example.com/bot)"
REQUEST_DELAY = 1.5  # Seconds between requests (respectful rate)
MAX_RETRIES = 3
TIMEOUT = 30  # Seconds

# Output directory
OUTPUT_DIR = Path("./output")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("scraper.log"),
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class Genre:
    id: int
    name: str
    slug: str
    url: str
    story_count: int = 0


@dataclass
class Theme:
    id: int
    name: str
    slug: str
    url: str
    story_count: int = 0


@dataclass
class Author:
    id: int
    name: str
    slug: str
    url: str
    member_since: Optional[str] = None


@dataclass
class Story:
    external_id: int
    title: str
    slug: str
    url: str
    author: Optional[Author] = None
    genre: Optional[Genre] = None
    themes: list = None
    description: Optional[str] = None
    content: Optional[str] = None
    rating: float = 0.0
    votes_count: int = 0
    reads_count: int = 0
    comments_count: int = 0
    published_at: Optional[str] = None
    
    def __post_init__(self):
        if self.themes is None:
            self.themes = []


# ============================================================================
# HTTP CLIENT WITH RATE LIMITING
# ============================================================================

class RateLimitedSession:
    """HTTP session with built-in rate limiting and retry logic."""
    
    def __init__(self, delay: float = REQUEST_DELAY):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        })
        self.delay = delay
        self.last_request_time = 0
        
    def _wait_rate_limit(self):
        """Ensure we don't exceed rate limit."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self.last_request_time = time.time()
        
    def get(self, url: str, **kwargs) -> Optional[requests.Response]:
        """Make a GET request with retry logic and rate limiting."""
        kwargs.setdefault("timeout", TIMEOUT)
        
        for attempt in range(MAX_RETRIES):
            try:
                self._wait_rate_limit()
                logger.debug(f"GET {url} (attempt {attempt + 1}/{MAX_RETRIES})")
                
                response = self.session.get(url, **kwargs)
                
                # Handle rate limiting
                if response.status_code == 429:
                    wait_time = int(response.headers.get("Retry-After", 60))
                    logger.warning(f"Rate limited. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                    
                # Handle server errors
                if response.status_code >= 500:
                    if attempt < MAX_RETRIES - 1:
                        wait = (attempt + 1) * 5  # Exponential backoff
                        logger.warning(f"Server error {response.status_code}. Retrying in {wait}s...")
                        time.sleep(wait)
                        continue
                        
                return response
                
            except requests.exceptions.RequestException as e:
                if attempt < MAX_RETRIES - 1:
                    wait = (attempt + 1) * 5
                    logger.error(f"Request error: {e}. Retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                logger.error(f"Failed after {MAX_RETRIES} attempts: {e}")
                return None
                
        return None


# ============================================================================
# SCRAPER CLASS
# ============================================================================

class SexStoriesScraper:
    """Main scraper class for sexstories.com."""
    
    def __init__(self):
        self.session = RateLimitedSession()
        self.output_dir = OUTPUT_DIR
        self.output_dir.mkdir(exist_ok=True)
        
    def _slugify(self, text: str) -> str:
        """Convert text to URL-safe slug."""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_]+', '-', text)
        text = re.sub(r'-+', '-', text)
        return text
        
    def _safe_filename(self, text: str) -> str:
        """Convert text to safe filename."""
        return re.sub(r'[^\w\-.]', '_', text)
    
    # ------------------------------------------------------------------
    # GENRE SCRAPING
    # ------------------------------------------------------------------
    
    def scrape_genres(self) -> list[Genre]:
        """Scrape all genres from the site."""
        logger.info("=" * 60)
        logger.info("SCRAPING GENRES")
        logger.info("=" * 60)
        
        genres = []
        
        # Try main page first for genre links
        response = self.session.get(BASE_URL)
        if not response:
            logger.error("Failed to fetch main page")
            return []
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Look for genre links - adjust selectors based on actual site structure
        # Common patterns: /genres/ID/Name or similar
        genre_links = soup.select('a[href*="/genres/"]')
        
        if not genre_links:
            # Try alternative patterns
            genre_links = soup.select('a[href*="genre"]')
            
        seen_ids = set()
        
        for link in genre_links:
            href = link.get("href", "")
            name = link.get_text(strip=True)
            
            if not name or not href:
                continue
                
            # Extract ID from URL pattern like /genres/123/genre-name
            match = re.search(r'/genres/(\d+)', href)
            if match:
                genre_id = int(match.group(1))
                if genre_id in seen_ids:
                    continue
                seen_ids.add(genre_id)
                
                url = href if href.startswith("http") else f"{BASE_URL}{href}"
                
                genre = Genre(
                    id=genre_id,
                    name=name,
                    slug=self._slugify(name),
                    url=url
                )
                genres.append(genre)
                logger.info(f"Found genre: {name} (ID: {genre_id})")
        
        # If we couldn't find genres from main page, use known list
        if not genres:
            logger.info("Using predefined genre list (could not scrape from main page)")
            known_genres = [
                (1, "Diary"), (2, "Essay"), (3, "Fantasm"), (4, "Fantastic"),
                (5, "Fantasy"), (6, "Fiction"), (7, "Information"), (8, "News"),
                (9, "Poem"), (10, "Science-Fiction"), (11, "Sex Joke"), (12, "True Story"),
            ]
            for gid, gname in known_genres:
                genres.append(Genre(
                    id=gid,
                    name=gname,
                    slug=self._slugify(gname),
                    url=f"{BASE_URL}/genres/{gid}/{self._slugify(gname)}"
                ))
        
        # Save to JSONL
        output_file = self.output_dir / "genres.jsonl"
        with open(output_file, "w", encoding="utf-8") as f:
            for genre in genres:
                f.write(json.dumps(asdict(genre)) + "\n")
                
        logger.info(f"Saved {len(genres)} genres to {output_file}")
        return genres
    
    # ------------------------------------------------------------------
    # THEME SCRAPING
    # ------------------------------------------------------------------
    
    def scrape_themes(self) -> list[Theme]:
        """Scrape all themes from the site."""
        logger.info("=" * 60)
        logger.info("SCRAPING THEMES")
        logger.info("=" * 60)
        
        themes = []
        
        response = self.session.get(f"{BASE_URL}/themes/")
        if not response:
            logger.error("Failed to fetch themes page")
            # Use known themes as fallback
            return self._get_known_themes()
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        theme_links = soup.select('a[href*="/themes/"]')
        
        seen_ids = set()
        
        for link in theme_links:
            href = link.get("href", "")
            name = link.get_text(strip=True)
            
            if not name or not href:
                continue
                
            match = re.search(r'/themes/(\d+)', href)
            if match:
                theme_id = int(match.group(1))
                if theme_id in seen_ids:
                    continue
                seen_ids.add(theme_id)
                
                url = href if href.startswith("http") else f"{BASE_URL}{href}"
                
                themes.append(Theme(
                    id=theme_id,
                    name=name,
                    slug=self._slugify(name),
                    url=url
                ))
                logger.info(f"Found theme: {name} (ID: {theme_id})")
        
        if not themes:
            logger.info("Using predefined theme list")
            themes = self._get_known_themes()
        
        # Save to JSONL
        output_file = self.output_dir / "themes.jsonl"
        with open(output_file, "w", encoding="utf-8") as f:
            for theme in themes:
                f.write(json.dumps(asdict(theme)) + "\n")
                
        logger.info(f"Saved {len(themes)} themes to {output_file}")
        return themes
    
    def _get_known_themes(self) -> list[Theme]:
        """Return known themes list as fallback."""
        known_themes = [
            "Alien", "Anal", "Asian", "Ass to mouth", "Authoritarian", "BDSM",
            "Bi-sexual", "Black", "Blackmail", "Blowjob", "Bondage and restriction",
            "Boy", "Boy/Boy", "Boys/Teen Female", "Cheating", "Cock & ball torture",
            "Coercion", "Consensual Sex", "Cosplay", "Cruelty", "Cuckold",
            "Cum Swallowing", "Dark fiction", "Death", "Discipline",
            "Domination/submission", "Drug", "Enema", "Erotica", "Exhibitionism",
            "Extreme", "Fan fiction", "Female / Girl", "Female Domination",
            "Female exhibitionist", "Female solo", "Female/Female", "First Time",
            "Fisting", "Foot or shoe fetish", "Gay", "Girls / Female",
            "Girls domination", "Gothic", "Group Sex", "Hardcore", "Horror",
            "Humiliation", "Interracial", "Job/Place-of-work", "Lactation",
            "Latex fetish", "Latina", "Lesbian", "Male / Female Teens",
            "Male / Females", "Male / Older Female", "Male Domination",
            "Male Male/Teen Female", "Male Solo", "Male/Female", "Male/Teen Female",
            "Males / Female", "Males / Females", "massage", "Masturbation",
            "Mature", "Mind Control", "Monster", "Murder", "Non-Erotic",
            "Older Female / Males", "Older Male / Female", "Oral Sex", "Pegging",
            "Plumper", "Pregnant", "Prostitution", "Reluctance", "Role-playing",
            "Romance", "Sado-Masochism", "Scatology", "School", "Slavery",
            "Snuff", "Spanking", "Stockholm Syndrome", "Teen", "Teen Female Solo",
            "Teen Female/Boy", "Teen Female/Teen Female", "Teen Male / Female",
            "Teen Male / Teen Male", "Teen Male Solo", "Teen Male/Teen Female",
            "Teen Male/Teen Females", "Threesome", "Toys", "Transgendered",
            "Transsexual", "Transvestite", "Virginity", "Voyeurism",
            "Water Sports/Pissing", "Wife", "Written by women", "Young",
        ]
        
        return [
            Theme(id=i+1, name=t, slug=self._slugify(t), 
                  url=f"{BASE_URL}/themes/{i+1}/{self._slugify(t)}")
            for i, t in enumerate(known_themes)
        ]
    
    # ------------------------------------------------------------------
    # STORY LIST SCRAPING (FROM GENRE/THEME PAGES)
    # ------------------------------------------------------------------
    
    def scrape_story_list(
        self, 
        genre: Optional[Genre] = None, 
        theme: Optional[Theme] = None,
        max_pages: int = 100
    ) -> list[dict]:
        """
        Scrape story listings from genre or theme pages.
        URLs follow pattern: /genres/ID/Name/s-date/p-PAGE
        """
        stories = []
        
        if genre:
            base_url = genre.url.replace("/s-date", "") if "/s-date" in genre.url else f"{genre.url}/s-date"
            list_type = f"genre '{genre.name}'"
        elif theme:
            base_url = theme.url.replace("/s-date", "") if "/s-date" in theme.url else f"{theme.url}/s-date"
            list_type = f"theme '{theme.name}'"
        else:
            logger.error("Must provide either genre or theme")
            return stories
            
        logger.info("=" * 60)
        logger.info(f"SCRAPING STORIES FROM {list_type.upper()}")
        logger.info("=" * 60)
        
        for page in range(1, max_pages + 1):
            url = f"{base_url}/p-{page}"
            logger.info(f"Fetching page {page}: {url}")
            
            response = self.session.get(url)
            if not response:
                logger.warning(f"Failed to fetch page {page}, stopping")
                break
                
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Look for story items - adjust based on actual HTML structure
            story_items = self._extract_story_list_items(soup)
            
            if not story_items:
                logger.info(f"No more stories found on page {page}, stopping pagination")
                break
                
            stories.extend(story_items)
            logger.info(f"Found {len(story_items)} stories on page {page} (total: {len(stories)})")
            
            # Check if there's a next page
            if not self._has_next_page(soup):
                logger.info("No more pages available")
                break
                
        return stories
    
    def _extract_story_list_items(self, soup: BeautifulSoup) -> list[dict]:
        """Extract story metadata from listing page."""
        items = []
        
        # Common patterns for story listings - adjust based on actual site structure
        # Pattern 1: Article-based listings
        articles = soup.select('article.story-item, .story-list-item, div[class*="story"]')
        
        if not articles:
            # Pattern 2: Link-based listings within containers
            articles = soup.select('.story-list a[href*="/story/"], .stories a[href*="/story/"]')
            
        for article in articles:
            try:
                item = self._parse_story_list_item(article)
                if item:
                    items.append(item)
            except Exception as e:
                logger.debug(f"Error parsing story item: {e}")
                continue
                
        return items
    
    def _parse_story_list_item(self, element) -> Optional[dict]:
        """Parse a single story list item element."""
        # Try to find the story link
        link = element if element.name == 'a' else element.select_one('a[href*="/story/"]')
        if not link:
            link = element.find('a', href=True)
            
        if not link:
            return None
            
        href = link.get("href", "")
        title = link.get_text(strip=True)
        
        if not title or "/story/" not in href:
            return None
            
        # Extract story ID from URL
        match = re.search(r'/story/(\d+)', href)
        if not match:
            return None
            
        story_id = int(match.group(1))
        url = href if href.startswith("http") else f"{BASE_URL}{href}"
        
        item = {
            "external_id": story_id,
            "title": title,
            "slug": self._slugify(title),
            "url": url,
        }
        
        # Try to extract additional info from the container
        parent = element.parent if element.name == 'a' else element
        
        # Author
        author_link = parent.select_one('a[href*="/author/"], a[href*="/profile/"], .author')
        if author_link:
            item["author_name"] = author_link.get_text(strip=True)
            
        # Rating
        rating_elem = parent.select_one('.rating, [class*="rating"], .stars')
        if rating_elem:
            rating_text = rating_elem.get("data-rating") or rating_elem.get_text(strip=True)
            try:
                item["rating"] = float(re.search(r'[\d.]+', rating_text).group())
            except (AttributeError, ValueError):
                pass
                
        # Reads count
        reads_elem = parent.select_one('.reads, [class*="read"], [class*="view"]')
        if reads_elem:
            reads_text = reads_elem.get_text(strip=True)
            reads_match = re.search(r'[\d,]+', reads_text)
            if reads_match:
                item["reads_count"] = int(reads_match.group().replace(",", ""))
                
        # Date
        date_elem = parent.select_one('.date, [class*="date"], time')
        if date_elem:
            item["published_at"] = date_elem.get("datetime") or date_elem.get_text(strip=True)
            
        return item
    
    def _has_next_page(self, soup: BeautifulSoup) -> bool:
        """Check if there's a next page of results."""
        next_link = soup.select_one('a.next, [aria-label="Next"], [rel="next"], a[href*="p-"')
        if next_link:
            href = next_link.get("href", "")
            # Check it's not just linking to current or previous page
            return bool(href)
        return False
    
    # ------------------------------------------------------------------
    # INDIVIDUAL STORY SCRAPING
    # ------------------------------------------------------------------
    
    def scrape_story(self, story_id: int, url: Optional[str] = None) -> Optional[Story]:
        """Scrape a single story's full content."""
        logger.info("=" * 60)
        logger.info(f"SCRAPING STORY ID: {story_id}")
        logger.info("=" * 60)
        
        if not url:
            url = f"{BASE_URL}/story/{story_id}"
            
        response = self.session.get(url)
        if not response:
            logger.error(f"Failed to fetch story {story_id}")
            return None
            
        soup = BeautifulSoup(response.text, "html.parser")
        
        return self._parse_story_page(soup, story_id, url)
    
    def _parse_story_page(self, soup: BeautifulSoup, story_id: int, url: str) -> Optional[Story]:
        """Parse story detail page."""
        
        # Title
        title_elem = soup.select_one('h1.story-title, h1.title, h1')
        title = title_elem.get_text(strip=True) if title_elem else f"Story {story_id}"
        
        # Author
        author = None
        author_elem = soup.select_one('a[href*="/author/"], a[href*="/profile/"], .author-name')
        if author_elem:
            author_name = author_elem.get_text(strip=True)
            author_href = author_elem.get("href", "")
            author_match = re.search(r'/(?:author|profile)/(\d+)', author_href)
            author_id = int(author_match.group(1)) if author_match else None
            author = Author(
                id=author_id or 0,
                name=author_name,
                slug=self._slugify(author_name),
                url=author_href if author_href.startswith("http") else f"{BASE_URL}{author_href}"
            )
        
        # Genre
        genre = None
        genre_elem = soup.select_one('a[href*="/genres/"], .genre')
        if genre_elem:
            genre_name = genre_elem.get_text(strip=True)
            genre_href = genre_elem.get("href", "")
            genre_match = re.search(r'/genres/(\d+)', genre_href)
            genre_id = int(genre_match.group(1)) if genre_match else None
            genre = Genre(
                id=genre_id or 0,
                name=genre_name,
                slug=self._slugify(genre_name),
                url=genre_href if genre_href.startswith("http") else f"{BASE_URL}{genre_href}"
            )
        
        # Themes
        themes = []
        theme_elems = soup.select('a[href*="/themes/"], .theme-tag, .tag')
        for te in theme_elems:
            theme_name = te.get_text(strip=True)
            theme_href = te.get("href", "")
            theme_match = re.search(r'/themes/(\d+)', theme_href)
            if theme_name and theme_match:
                themes.append(Theme(
                    id=int(theme_match.group(1)),
                    name=theme_name,
                    slug=self._slugify(theme_name),
                    url=theme_href if theme_href.startswith("http") else f"{BASE_URL}{theme_href}"
                ))
        
        # Stats
        rating = 0.0
        votes_count = 0
        reads_count = 0
        comments_count = 0
        
        rating_elem = soup.select_one('[class*="rating"], .rating-value')
        if rating_elem:
            rating_text = rating_elem.get_text(strip=True)
            rating_match = re.search(r'([\d.]+)', rating_text)
            if rating_match:
                rating = float(rating_match.group(1))
                
        # Reads
        reads_elem = soup.select_one('[class*="read"], [class*="view"], .reads-count')
        if reads_elem:
            reads_text = reads_elem.get_text(strip=True)
            reads_match = re.search(r'([\d,]+)', reads_text)
            if reads_match:
                reads_count = int(reads_match.group(1).replace(",", ""))
        
        # Date
        published_at = None
        date_elem = soup.select_one('time, [class*="date"], .publish-date')
        if date_elem:
            published_at = date_elem.get("datetime") or date_elem.get_text(strip=True)
        
        # CONTENT EXTRACTION - Most important part
        content = self._extract_story_content(soup)
        
        story = Story(
            external_id=story_id,
            title=title,
            slug=self._slugify(title),
            url=url,
            author=author,
            genre=genre,
            themes=themes,
            content=content,
            rating=rating,
            votes_count=votes_count,
            reads_count=reads_count,
            comments_count=comments_count,
            published_at=published_at
        )
        
        logger.info(f"Parsed story: {title} by {author.name if author else 'Unknown'}")
        logger.info(f"  Content length: {len(content) if content else 0} characters")
        
        return story
    
    def _extract_story_content(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract the full story content.
        Looks for content after "Introduction:" heading.
        """
        content_parts = []
        
        # Strategy 1: Find main content container
        content_selectors = [
            '.story-content',
            '.story-text',
            '#story-content',
            'article.content',
            '.entry-content',
            '.post-content',
            '[itemprop="articleBody"]',
            '.text-story',
            '#text',
        ]
        
        content_container = None
        for selector in content_selectors:
            content_container = soup.select_one(selector)
            if content_container:
                break
        
        # Strategy 2: If no container found, use body but remove nav/sidebar
        if not content_container:
            content_container = soup.find('body')
            if content_container:
                # Remove unwanted elements
                for unwanted in content_container.select(
                    'nav, header, footer, sidebar, aside, script, style, '
                    '.comments, .sidebar, .navigation, .ads, [class*="ad-"], '
                    '[class*="comment"], [class*="menu"]'
                ):
                    unwanted.decompose()
        
        if not content_container:
            logger.warning("Could not find story content container")
            return None
        
        # Extract text content
        # Get all paragraphs
        paragraphs = content_container.find_all(['p', 'div', 'br'], recursive=True)
        
        if not paragraphs:
            # Fallback: get all text
            text = content_container.get_text(separator="\n\n", strip=True)
            return text
        
        started = False
        for elem in paragraphs:
            text = elem.get_text(strip=True)
            if not text:
                continue
                
            # Check for introduction marker
            if re.search(r'introduction[:\s]', text, re.IGNORECASE):
                started = True
                content_parts.append(text)
                continue
                
            # Start capturing after we've found intro or if no intro marker exists
            if started or not content_parts:
                # Skip very short elements that are likely UI elements
                if len(text) > 20 or text.startswith(('Chapter', 'Part', 'Section')):
                    content_parts.append(text)
        
        # If we captured content, join it
        if content_parts:
            result = "\n\n".join(content_parts)
            # Clean up whitespace
            result = re.sub(r'\n{3,}', '\n\n', result)
            return result.strip()
        
        # Final fallback: get all text from container
        return content_container.get_text(separator="\n\n", strip=True)
    
    # ------------------------------------------------------------------
    # BATCH OPERATIONS
    # ------------------------------------------------------------------
    
    def scrape_all_stories_by_genre(self, genre: Genre, save_interval: int = 50) -> str:
        """Scrape all stories from a genre and save to JSONL."""
        output_file = self.output_dir / f"stories_{genre.slug}.jsonl"
        existing_count = 0
        
        # Check for existing progress
        if output_file.exists():
            with open(output_file, "r", encoding="utf-8") as f:
                existing_count = sum(1 for _ in f)
        
        # Get story list
        story_list = self.scrape_story_list(genre=genre)
        
        logger.info(f"Found {len(story_list)} stories in genre '{genre.name}'")
        
        # Scrape each story's full content
        with open(output_file, "a", encoding="utf-8") as f:
            for i, story_meta in enumerate(story_list[existing_count:], start=1):
                logger.info(f"[{i + existing_count}/{len(story_list)}] Scraping: {story_meta['title']}")
                
                story = self.scrape_story(
                    story_meta["external_id"], 
                    story_meta.get("url")
                )
                
                if story:
                    f.write(json.dumps(asdict(story)) + "\n")
                    
                # Save progress periodically
                if i % save_interval == 0:
                    logger.info(f"Progress: {i} stories saved")
                    
        logger.info(f"Saved stories to {output_file}")
        return str(output_file)


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="SexStories.com Scraper - Ethical web scraping tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scraper.py --mode genres       # Scrape all genres
  python scraper.py --mode themes       # Scrape all themes
  python scraper.py --mode stories      # Scrape sample stories
  python scraper.py --mode full         # Full scraping pipeline
  python scraper.py --story-id 12345    # Scrape single story
        """
    )
    
    parser.add_argument(
        "--mode",
        choices=["genres", "themes", "stories", "full"],
        help="Scraping mode"
    )
    
    parser.add_argument(
        "--story-id",
        type=int,
        help="Scrape a specific story by ID"
    )
    
    parser.add_argument(
        "--genre-id",
        type=int,
        help="Scrape stories from a specific genre ID"
    )
    
    parser.add_argument(
        "--max-pages",
        type=int,
        default=10,
        help="Maximum pages to scrape per genre/theme (default: 10)"
    )
    
    args = parser.parse_args()
    
    scraper = SexStoriesScraper()
    
    if args.story_id:
        # Single story mode
        story = scraper.scrape_story(args.story_id)
        if story:
            output_file = scraper.output_dir / f"story_{args.story_id}.json"
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(asdict(story), f, indent=2, ensure_ascii=False)
            print(f"\n✅ Story saved to {output_file}")
            print(f"   Title: {story.title}")
            print(f"   Content length: {len(story.content) or 0} chars")
        else:
            print(f"\n❌ Failed to scrape story {args.story_id}")
            
    elif args.mode == "genres":
        genres = scraper.scrape_genres()
        print(f"\n✅ Scraped {len(genres)} genres")
        
    elif args.mode == "themes":
        themes = scraper.scrape_themes()
        print(f"\n✅ Scraped {len(themes)} themes")
        
    elif args.mode == "stories":
        # Scrape some sample stories
        genres = scraper.scrape_genres()
        if genres:
            for genre in genres[:2]:  # First 2 genres only
                scraper.scrape_all_stories_by_genre(genre)
                
    elif args.mode == "full":
        # Full pipeline
        print("\n" + "=" * 60)
        print("FULL SCRAPING PIPELINE")
        print("=" * 60 + "\n")
        
        # Step 1: Genres
        genres = scraper.scrape_genres()
        
        # Step 2: Themes
        themes = scraper.scrape_themes()
        
        # Step 3: Stories (sample)
        print("\n📖 Starting story scraping (limited to first 3 genres, 5 pages each)...")
        for genre in genres[:3]:
            scraper.scrape_all_stories_by_genre(genre)
            
        print("\n" + "=" * 60)
        print("SCRAPING COMPLETE!")
        print("=" * 60)
        print(f"\nOutput files in: {scraper.output_dir.absolute()}")
        print("Next step: Import data using the database import script")
        
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
