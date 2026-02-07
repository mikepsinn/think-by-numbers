# Think by Numbers

**Using data to minimize human suffering and optimize life for everyone. A better world through math.**

Look, humanity invented math thousands of years ago. You have calculators in your pockets. Yet you still make trillion-dollar decisions based on how a flag makes you feel. This is... let's call it "suboptimal."

Think by Numbers teaches you how to stop doing that. Using this strange technique called "counting," you can figure out which problems are killing the most people and which solutions actually work. Revolutionary, I know.

## The Situation

Here's what you're currently doing with your opposable thumbs:

- **Spending $2 trillion on weapons** while people die from diseases that cost $68 billion to cure. $2 trillion is bigger than $68 billion. I checked.
- **Allocating resources based on who gave your politician papers** instead of, say, reducing suffering
- **Choosing leaders by which face you like** instead of measuring whether their policies actually work
- **Fighting about red team versus blue team** while both teams somehow agree that counting is for nerds

The good news: You already know third-grade arithmetic. The confusion is notable.

## What Numbers Can Do (That Feelings Can't)

Numbers cannot lie. They can be used incorrectly—you're very talented at that—but the numbers themselves just... exist. Like gravity. They don't care about your feelings.

Here's how you use them:
- **Count the problem** - How many people are dying? From what? Where?
- **Calculate solutions** - Which intervention prevents the most dying per dollar?
- **Implement the thing that works** - Not the thing that feels nice. The thing that math says works.
- **Repeat** - Keep doing this until utopia or heat death of the universe, whichever comes first

This is not a metaphor. This is literally just counting and then doing the thing with the bigger number.

---

*This is a static site built with [Eleventy](https://www.11ty.dev/) from WordPress export.*

## Features

- ✅ 100 pages with full content (93 blog posts + 7 standalone pages)
- ✅ Featured images for all posts
- ✅ Self-hosted podcast with 13 episodes (130MB MP3s)
- ✅ RSS feed for blog
- ✅ Podcast RSS feed
- ✅ Client-side search (Pagefind)
- ✅ LaTeX math rendering (KaTeX)
- ✅ Responsive layouts

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
# Server will be at http://localhost:8080

# Build for production
npm run build
```

## Scripts

- `npm start` - Clean, build, and start dev server with live reload
- `npm run serve` - Start dev server (shows URL in console)
- `npm run build` - Build site + generate search index
- `npm run search` - Generate Pagefind search index
- `npm run clean` - Remove _site directory

## Project Structure

```
.
├── 11ty/                      # Source files
│   ├── _data/                 # Global data (site.json)
│   ├── _includes/             # Layouts & templates
│   │   └── base.njk          # Base layout
│   ├── assets/               # Global assets
│   │   └── podcasts/         # Self-hosted podcast MP3s
│   ├── [categories]/         # Blog posts by category
│   │   ├── *.md             # Markdown posts
│   │   └── assets/          # Post-specific assets
│   ├── feed.njk             # RSS feed template
│   ├── podcast.njk          # Podcast RSS feed
│   ├── index.njk            # Homepage
│   └── search.njk           # Search page
├── _site/                    # Built site (gitignored)
├── .eleventy.js              # Eleventy config
└── package.json              # Dependencies & scripts
```

## Feeds

- **Blog RSS**: `/feed.xml`
- **Podcast RSS**: `/podcast.xml`

## Search

Search is powered by [Pagefind](https://pagefind.app/), a static search library that indexes your site at build time.

## LaTeX Math Rendering

Mathematical expressions are rendered using [KaTeX](https://katex.org/). Use these delimiters:
- Inline math: `$equation$` or `\(equation\)`
- Display math: `$$equation$$` or `\[equation\]`

Example:
```markdown
The formula $$E = mc^2$$ shows mass-energy equivalence.
```

## Featured Images

Featured images are automatically displayed at the top of each post. The importer downloads them from WordPress and stores them in `assets/` subdirectories.

## How You Can Help Fix This

### 1. **Write Articles with Numbers In Them**

If you can prove something with data, write it down. Topics we need:
- Why we're spending money on the wrong things (with receipts)
- Cost-benefit analysis of not dying
- Statistics about problems you've actually researched

**The rules:**
- Show your work. Link to sources.
- Include actual numbers, charts, or math
- Explain HOW to solve things, not just that things are bad
- No "Vote for my team because the other team is evil" - both teams are buying the wrong things

**How to submit:**
- Open a [GitHub Issue](../../issues) with your draft
- Submit a Pull Request with a markdown file in `content/[category]/`
- Email: [we should probably add this]

### 2. **Fix Our Mistakes**

We're wrong about things sometimes. If you find:
- Math that's mathing incorrectly
- Links that go nowhere (like our civilization)
- Outdated statistics
- Confusing explanations

Fork the repo, fix it, submit a Pull Request. It's like peer review but on the internet.

### 3. **Suggest Better Uses of Brainpower**

See a problem that would be funny if it weren't killing people? [Open an issue](../../issues) with "topic suggestion" and explain:
- What's happening
- How many people it's affecting (use numbers)
- Where the data lives

### 4. **Upvote Facts, Downvote Yelling**

In comments:
- ⬆️ Upvote: "Here's data showing X, source: [link]"
- ⬇️ Downvote: "You're an idiot and so is your mother"

Name-calling makes primates out of philosophers. You have a neocortex. Use it.

### 5. **Make the Website Less Terrible**

Can you:
- Fix bugs?
- Make it work on phones?
- Add fancy charts?
- Improve accessibility?

Great. [Open an issue](../../issues) or submit a PR.

### 6. **Tell Other Humans**

If this helps you count better:
- Share articles when they have good numbers
- Cite us in your own counting
- Join the [Empiricist Movement](https://thinkbynumbers.org/empiricist-movement/) (it's like a movement but with spreadsheets)

## The Actual Rules

**Do this:**
- ✅ Count things and show your work
- ✅ Calculate which solution prevents the most dying per dollar
- ✅ Ask "What's in it for them?" not "Why won't they do the right thing?"
- ✅ Write like you're explaining to a friend, not writing a grant proposal
- ✅ Make it funny if possible (suffering is easier to read about when it's not boring)

**Don't do this:**
- ❌ "I feel like this is true" - Cool, prove it
- ❌ "Vote red/blue because the other side is evil" - They're both buying the wrong things
- ❌ "You're an idiot" - Critique the idea, not the person
- ❌ Find one study that agrees with you and ignore the other 47
- ❌ Manipulate people's feelings instead of showing them the math

## How to Write Good

Full style guide: [STYLE_GUIDE.md](STYLE_GUIDE.md)

Short version: Write like a weary parent who found their kid making pipe bombs in the basement while complaining they can't afford lunch. You're not mad. You're just... confused. And slightly concerned.

- Dark humor about humanity's talent for choosing the worst option
- Explain solutions like you're teaching someone how to actually DO this
- Target the broken system (spending $2 trillion on weapons), not Bob who voted for it
- Ask "What's in it for them?" not "Why won't they be good people?"
- If your mom can't understand it, rewrite it

Bad example: "We propose a paradigm shift toward stakeholder-centric resource optimization."

Good example: "You're spending the grocery money on fireworks. Here's how to stop doing that."

## Deployment

The site is static HTML and can be deployed to:
- GitHub Pages
- Netlify (recommended - includes _redirects support)
- Vercel
- Cloudflare Pages
- Any static host

Just run `npm run build` and deploy the `_site` directory.

## URL Validation

Before deploying, ensure all legacy URLs are accounted for:

```bash
npm run validate-urls
```

This checks that all URLs from the live sitemap exist as pages or redirects.

## WordPress Import

This site was imported from WordPress using [@11ty/import](https://github.com/11ty/eleventy-import) with Windows compatibility fixes and podcast MP3 download support.

## License

Content: [Specify license - CC BY-SA 4.0 recommended]
Code: MIT License

## Related Projects

- [How to End War and Disease](https://howtoendwaranddisease.org)
- [The Decentralized FDA](https://dfda.earth)
- [Wishonia](https://wishonia.love)
- [QuantiModo](https://quantimo.do)
