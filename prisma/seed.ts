import { PrismaClient } from '@prisma/client';
import slugify from './slugify';

const prisma = new PrismaClient();

// Genres from sexstories.com
const GENRES = [
  { name: 'Diary', description: 'Personal diary entries and journal-style stories' },
  { name: 'Essay', description: 'Thought-provoking essays and reflections' },
  { name: 'Fantasm', description: 'Fantasy dreams and imaginative scenarios' },
  { name: 'Fantastic', description: 'Fantastic tales beyond reality' },
  { name: 'Fantasy', description: 'Magical and fantasy world adventures' },
  { name: 'Fiction', description: 'Creative fictional stories' },
  { name: 'Information', description: 'Informative content and guides' },
  { name: 'News', description: 'News-style story formats' },
  { name: 'Poem', description: 'Poetic expressions and verses' },
  { name: 'Science-Fiction', description: 'Sci-fi adventures in space and future' },
  { name: 'Sex Joke', description: 'Humorous adult jokes and comedy' },
  { name: 'True Story', description: 'Real-life experiences and true events' },
];

// Themes from sexstories.com
const THEMES = [
  { name: 'Alien' },
  { name: 'Anal' },
  { name: 'Asian' },
  { name: 'Ass to mouth' },
  { name: 'Authoritarian' },
  { name: 'BDSM' },
  { name: 'Bi-sexual' },
  { name: 'Black' },
  { name: 'Blackmail' },
  { name: 'Blowjob' },
  { name: 'Bondage and restriction' },
  { name: 'Boy' },
  { name: 'Boy/Boy' },
  { name: 'Boys/Teen Female' },
  { name: 'Cheating' },
  { name: 'Cock & ball torture' },
  { name: 'Coercion' },
  { name: 'Consensual Sex' },
  { name: 'Cosplay' },
  { name: 'Cruelty' },
  { name: 'Cuckold' },
  { name: 'Cum Swallowing' },
  { name: 'Dark fiction' },
  { name: 'Death' },
  { name: 'Discipline' },
  { name: 'Domination/submission' },
  { name: 'Drug' },
  { name: 'Enema' },
  { name: 'Erotica' },
  { name: 'Exhibitionism' },
  { name: 'Extreme' },
  { name: 'Fan fiction' },
  { name: 'Female / Girl' },
  { name: 'Female Domination' },
  { name: 'Female exhibitionist' },
  { name: 'Female solo' },
  { name: 'Female/Female' },
  { name: 'First Time' },
  { name: 'Fisting' },
  { name: 'Foot or shoe fetish' },
  { name: 'Gay' },
  { name: 'Girls / Female' },
  { name: 'Girls domination' },
  { name: 'Gothic' },
  { name: 'Group Sex' },
  { name: 'Hardcore' },
  { name: 'Horror' },
  { name: 'Humiliation' },
  { name: 'Interracial' },
  { name: 'Job/Place-of-work' },
  { name: 'Lactation' },
  { name: 'Latex fetish' },
  { name: 'Latina' },
  { name: 'Lesbian' },
  { name: 'Male / Female Teens' },
  { name: 'Male / Females' },
  { name: 'Male / Older Female' },
  { name: 'Male Domination' },
  { name: 'Male Male/Teen Female' },
  { name: 'Male Solo' },
  { name: 'Male/Female' },
  { name: 'Male/Teen Female' },
  { name: 'Males / Female' },
  { name: 'Males / Females' },
  { name: 'massage' },
  { name: 'Masturbation' },
  { name: 'Mature' },
  { name: 'Mind Control' },
  { name: 'Monster' },
  { name: 'Murder' },
  { name: 'Non-Erotic' },
  { name: 'Older Female / Males' },
  { name: 'Older Male / Female' },
  { name: 'Oral Sex' },
  { name: 'Pegging' },
  { name: 'Plumper' },
  { name: 'Pregnant' },
  { name: 'Prostitution' },
  { name: 'Reluctance' },
  { name: 'Role-playing' },
  { name: 'Romance' },
  { name: 'Sado-Masochism' },
  { name: 'Scatology' },
  { name: 'School' },
  { name: 'Slavery' },
  { name: 'Snuff' },
  { name: 'Spanking' },
  { name: 'Stockholm Syndrome' },
  { name: 'Teen' },
  { name: 'Teen Female Solo' },
  { name: 'Teen Female/Boy' },
  { name: 'Teen Female/Teen Female' },
  { name: 'Teen Male / Female' },
  { name: 'Teen Male / Teen Male' },
  { name: 'Teen Male Solo' },
  { name: 'Teen Male/Teen Female' },
  { name: 'Teen Male/Teen Females' },
  { name: 'Threesome' },
  { name: 'Toys' },
  { name: 'Transgendered' },
  { name: 'Transsexual' },
  { name: 'Transvestite' },
  { name: 'Virginity' },
  { name: 'Voyeurism' },
  { name: 'Water Sports/Pissing' },
  { name: 'Wife' },
  { name: 'Written by women' },
  { name: 'Young' },
];

function simpleSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.storyTheme.deleteMany();
  await prisma.story.deleteMany();
  await prisma.author.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.genre.deleteMany();

  console.log('✅ Cleared existing data');

  // Seed Genres
  console.log('📚 Seeding genres...');
  for (let i = 0; i < GENRES.length; i++) {
    const genre = GENRES[i];
    await prisma.genre.create({
      data: {
        name: genre.name,
        slug: simpleSlugify(genre.name),
        description: genre.description,
        sortOrder: i,
      },
    });
  }
  console.log(`✅ Created ${GENRES.length} genres`);

  // Seed Themes
  console.log('🏷️ Seeding themes...');
  for (let i = 0; i < THEMES.length; i++) {
    const theme = THEMES[i];
    await prisma.theme.create({
      data: {
        name: theme.name,
        slug: simpleSlugify(theme.name),
        sortOrder: i,
      },
    });
  }
  console.log(`✅ Created ${THEMES.length} themes`);

  // Create sample authors
  console.log('✍️ Creating sample authors...');
  const sampleAuthors = [
    { name: 'Anonymous Writer', bio: 'Anonymous contributor' },
    { name: 'StoryTeller99', bio: 'Passionate writer since 2020' },
    { name: 'NightOwl', bio: 'Late night creative mind' },
    { name: 'DreamWeaver', bio: 'Weaving tales of imagination' },
    { name: 'PenName', bio: 'Just another storyteller' },
  ];

  for (const author of sampleAuthors) {
    await prisma.author.create({
      data: {
        name: author.name,
        slug: simpleSlugify(author.name),
        bio: author.bio,
      },
    });
  }
  console.log(`✅ Created ${sampleAuthors.length} sample authors`);

  // Create sample stories
  console.log('📖 Creating sample stories...');
  const genres = await prisma.genre.findMany();
  const themes = await prisma.theme.findMany();
  const authors = await prisma.author.findMany();

  const sampleStories = [
    {
      title: 'The Midnight Encounter',
      description: 'A chance meeting that changed everything',
      genre: 'Fiction',
      author: 'Anonymous Writer',
      themeNames: ['Romance', 'First Time'],
      rating: 4.5,
      readsCount: 12543,
      content: `Introduction:\n\nThe night was dark and full of mysteries. Sarah had never expected that her life would take such an unexpected turn when she decided to take a walk through the old park.\n\nChapter 1\n\nIt was past midnight when Sarah found herself wandering through the empty streets. The moon cast long shadows across the pavement, creating an almost magical atmosphere. She had been unable to sleep, her mind racing with thoughts about the changes happening in her life.\n\nThe park entrance loomed ahead, its wrought iron gates slightly ajar. Something drew her toward it - perhaps curiosity, perhaps something else entirely. As she stepped through the gates, the world seemed to shift around her.\n\n"Beautiful night, isn't it?"\n\nThe voice came from nowhere and everywhere at once. Sarah spun around to find a figure emerging from the shadows.`,
    },
    {
      title: 'Summer Memories',
      description: 'Recalling that unforgettable summer vacation',
      genre: 'True Story',
      author: 'StoryTeller99',
      themeNames: ['Romance', 'Teen', 'First Time'],
      rating: 4.8,
      readsCount: 28901,
      content: `Introduction:\n\nEvery time summer rolls around, I'm transported back to that one special summer when everything changed. This is the true story of that unforgettable season.\n\nThe Beginning\n\nIt was June 1995, and I had just graduated from high school. The whole summer stretched before me like an endless possibility. My parents had surprised me with a trip to visit my aunt's beach house on the coast.\n\nI didn't know it then, but those three months would shape who I would become. The salty air, the endless beaches, and most importantly, the people I met there would stay with me forever.\n\nMeeting Her\n\nThe second day of my arrival, I was walking along the beach when I saw her. She was sitting on a large rock, watching the waves crash against the shore. There was something about the way she held herself, a quiet confidence that drew me in.`,
    },
    {
      title: 'The Office Secret',
      description: 'What happens after hours in the corporate world',
      genre: 'Fiction',
      author: 'NightOwl',
      themeNames: ['Job/Place-of-work', 'Romance', 'Cheating'],
      rating: 4.2,
      readsCount: 8765,
      content: `Introduction:\n\nIn the high-stakes world of corporate finance, secrets are currency. But some secrets are more valuable - and dangerous - than others.\n\nChapter One: Late Nights\n\nThe office was silent except for the hum of computers and the occasional creak of leather chairs. Jennifer was the only one left on the 23rd floor, or so she thought.\n\nShe had been working late for weeks now, trying to prove herself in the competitive environment of Sterling & Associates. The merger was coming up, and everyone was feeling the pressure.\n\n"You're still here?"\n\nJennifer jumped at the sound. Marcus stood in the doorway of her office, looking surprisingly casual without his usual suit jacket. His sleeves were rolled up, revealing forearms that... she stopped that thought immediately.`,
    },
    {
      title: 'Fantasy Realm Chronicles',
      description: 'An epic journey through magical lands',
      genre: 'Fantasy',
      author: 'DreamWeaver',
      themeNames: ['Fantastic', 'Romance', 'Adventure'],
      rating: 4.7,
      readsCount: 15678,
      content: `Introduction:\n\nIn the realm of Aethermoor, where magic flows like rivers and dragons still roam the skies, one young adventurer would discover their destiny.\n\nPrologue\n\nThe ancient prophecies spoke of a chosen one who would arrive when the realm needed them most. For a thousand years, the people of Aethermoor waited. Kingdoms rose and fell. Magic waxed and waned.\n\nBut prophecies have a way of fulfilling themselves in unexpected ways.\n\nChapter One: The Awakening\n\nElena woke to the sound of thunder, though the sky outside her window was clear. The thunder was inside her - a power she never knew she possessed suddenly making itself known.\n\nHer small cottage at the edge of the village shook as items began to float around her. Plates, books, even her cat Mr. Whiskers hovered in mid-air, looking thoroughly confused.`,
    },
    {
      title: 'Weekend Getaway',
      description: 'A relaxing trip turns into an adventure',
      genre: 'Diary',
      author: 'PenName',
      themeNames: ['Romance', 'Mature', 'Vacation'],
      rating: 4.0,
      readsCount: 5432,
      content: `Introduction:\n\nDear Diary,\n\nThis weekend was supposed to be simple - just a quick getaway to clear my head. But as I've learned, nothing in life ever goes exactly as planned.\n\nFriday Evening\n\nI packed light: just a change of clothes, my laptop, and enough snacks to survive the drive. The cabin I rented was supposed to be rustic but comfortable, nestled in the mountains about three hours from the city.\n\nThe drive itself was uneventful until I hit the mountain roads. That's when my GPS decided to take me on what it called "a scenic route." Two hours later, I was completely lost.\n\nSaturday\n\nAfter finally finding the cabin (which was nothing like the pictures, by the way), I decided to make the best of it. The view was actually stunning once I stopped being annoyed.`,
    },
    {
      title: 'Digital Dreams',
      description: 'Love in the age of technology',
      genre: 'Science-Fiction',
      author: 'Anonymous Writer',
      themeNames: ['Romance', 'Technology', 'Future'],
      rating: 4.6,
      readsCount: 11234,
      content: `Introduction:\n\nIn 2157, love hadn't changed much - only the way we found it. When Maya matched with someone who seemed too perfect to be real, she was about to discover why.\n\nPart One: The Match\n\nMaya's neural implant pinged with the familiar notification: "98% Compatibility Match Found." She'd been using the SoulSearch algorithm for two years now, and she'd never seen a percentage that high.\n\nHis name was Kael. His profile showed classic literature interests, a passion for pre-digital music, and eyes that seemed to look directly into her soul through the holographic display.\n\n"Interesting," she muttered, initiating contact.\n\nTheir first conversation lasted six hours. It felt like minutes.`,
    },
    {
      title: 'The Reunion',
      description: 'High school sweethearts meet again',
      genre: 'Romance',
      author: 'StoryTeller99',
      themeNames: ['Romance', 'Mature', 'Reunion'],
      rating: 4.9,
      readsCount: 32100,
      content: `Introduction:\n\nTen years is a long time. People change, grow, become different versions of themselves. But sometimes, just sometimes, the connection remains.\n\nThe Invitation\n\nThe invitation arrived on cream-colored cardstock with elegant gold lettering. "Ten Year Reunion - Class of 2014." Emma stared at it for a long time before deciding to go.\n\nShe hadn't kept in touch with anyone from high school. Not really. Life had taken her across the country, built a career, and created a comfortable if somewhat lonely existence.\n\nBut there was one person she thought about occasionally. One person whose face still appeared in her dreams.\n\nThe Night Of\n\nThe gymnasium was decorated exactly as it had been for prom, complete with cheesy streamers and a DJ playing music that was popular a decade ago. Emma grabbed a glass of punch and tried to blend in.`,
    },
    {
      title: 'Haunted Hearts',
      description: 'A ghost story with a romantic twist',
      genre: 'Horror',
      author: 'DreamWeaver',
      themeNames: ['Horror', 'Romance', 'Supernatural'],
      rating: 4.3,
      readsCount: 9876,
      content: `Introduction:\n\nBlackwood Manor had been abandoned for fifty years when Sarah inherited it from a great-aunt she'd never met. The locals said it was haunted. They were right - but not in the way anyone expected.\n\nArrival\n\nThe manor loomed against the stormy sky like a Gothic nightmare come to life. Its windows were empty eyes staring out at the overgrown grounds. Sarah shivered despite the warm autumn air.\n\n"Inherited," the lawyer had said. "With conditions." She was required to live there for one full year to claim the inheritance.\n\nOne year. How hard could it be?\n\nThe First Night\n\nSarah had barely unpacked when she heard it - footsteps in the hallway upstairs. But she was alone in the house. She was certain of it.\n\nShe grabbed a flashlight and climbed the creaking stairs.`,
    },
    {
      title: 'Island Paradise',
      description: 'Stranded together in paradise',
      genre: 'Fiction',
      author: 'NightOwl',
      themeNames: ['Romance', 'Adventure', 'Island'],
      rating: 4.4,
      readsCount: 7654,
      content: `Introduction:\n\nWhen the cruise ship went down, Mark and Lisa washed up on what appeared to be a deserted island. What happened next would test everything they thought they knew about themselves.\n\nDay One\n\nThe sun was brutal. The sand was hot. And Mark was pretty sure he had a concussion from hitting his head during the evacuation.\n\n"Are you alive?" a voice called out.\n\nHe turned to see a woman pulling herself from the surf. She looked familiar - yes, they'd been at the same dinner table the night before. Lisa, if he remembered correctly.\n\n"I think so," he replied. "You?"\n\n"Still here." She collapsed next to him on the beach. "Any idea where we are?"\n\n"Somewhere between Miami and Nassau, roughly."`,
    },
    {
      title: 'Coffee Shop Tales',
      description: 'Where strangers become something more',
      genre: 'Diary',
      author: 'PenName',
      themeNames: ['Romance', 'Modern', 'Everyday'],
      rating: 4.1,
      readsCount: 4567,
      content: `Introduction:\n\nThere's something about coffee shops that makes people open up. Maybe it's the caffeine. Maybe it's the atmosphere. Or maybe it's just that we're all looking for connection in unexpected places.\n\nMonday\n\nI started working at The Daily Grind because I needed money for college tuition. What I didn't expect was that it would become my favorite place on earth - not for the coffee (though that's excellent), but for the people.\n\nTake Tuesday regulars, for example. There's the woman who writes poetry on napkins. The man who brings his dog and orders two lattes - one for him, one in a cup for the pup. The teenagers who study furiously while pretending not to study at all.\n\nAnd then there's Him.\n\nHe comes in every day at 8 AM sharp. Orders black coffee. Sits in the corner booth. Reads.`,
    },
  ];

  for (let i = 0; i < sampleStories.length; i++) {
    const storyData = sampleStories[i];
    const genre = genres.find(g => g.name === storyData.genre) || genres[0];
    const author = authors.find(a => a.name === storyData.author) || authors[0];
    const storyThemes = themes.filter(t => storyData.themeNames.includes(t.name));

    const story = await prisma.story.create({
      data: {
        externalId: 1000 + i,
        title: storyData.title,
        slug: simpleSlugify(storyData.title),
        description: storyData.description,
        content: storyData.content,
        rating: storyData.rating,
        readsCount: storyData.readsCount,
        publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        authorId: author.id,
        genreId: genre.id,
      },
    });

    // Connect themes
    for (const theme of storyThemes) {
      await prisma.storyTheme.create({
        data: {
          storyId: story.id,
          themeId: theme.id,
        },
      });
    }
  }

  console.log(`✅ Created ${sampleStories.length} sample stories`);
  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
