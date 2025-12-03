# Tava AI-Assisted Treatment Plans

An AI-powered mental health treatment planning application built for the Gauntlet x Tava Health AI Engineer Challenge.

## Overview

This application demonstrates AI-assisted treatment planning for mental health therapy, featuring:

- **Dual-view treatment plans**: Clinical documentation for therapists and plain-language summaries for clients
- **Synthetic session generation**: AI-powered simulation of therapy sessions using predefined client personas
- **Safety detection**: Automatic flagging of crisis language with keyword scanning
- **Treatment plan versioning**: Track changes across sessions with version history
- **Session summaries**: Auto-generated summaries for both therapist notes and client understanding

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Prisma ORM with SQLite (easily swappable to PostgreSQL)
- **AI**: OpenAI API (GPT-4.1-mini)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdayku/tava_ATP.git
   cd tava_ATP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env.local file
   echo "OPENAI_API_KEY=your-api-key-here" > .env.local
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tava_ATP/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── clients/          # Client data endpoints
│   │   ├── generate-plan/    # Treatment plan generation
│   │   ├── generate-summary/ # Session summary generation
│   │   ├── sessions/         # Session data endpoints
│   │   └── simulate-session/ # Synthetic session generation
│   ├── client/[id]/          # Client-facing dashboard
│   ├── therapist/            # Therapist dashboard
│   │   └── clients/[id]/     # Client timeline view
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── ui/                   # Base UI components
│   └── Header.tsx            # Navigation header
├── lib/                      # Shared utilities
│   ├── prompts/              # AI prompt templates
│   │   ├── clientPlan.ts     # Client-friendly plan prompts
│   │   ├── plan.ts           # Treatment plan prompts
│   │   ├── risk.ts           # Risk assessment prompts
│   │   ├── simulateSession.ts # Session simulation prompts
│   │   └── summary.ts        # Summary generation prompts
│   ├── db.ts                 # Prisma client singleton
│   ├── openai.ts             # OpenAI client wrapper
│   ├── personas.ts           # Client personas definition
│   ├── riskScanner.ts        # Crisis keyword detection
│   └── schemas.ts            # Zod validation schemas
├── prisma/                   # Database schema
│   └── schema.prisma         # Prisma schema definition
├── tests/                    # Test files
│   ├── planParsing.test.ts   # Schema validation tests
│   └── riskScanner.test.ts   # Risk scanner tests
└── vitest.config.ts          # Test configuration
```

## Features

### Therapist Dashboard

- View all assigned clients
- Generate synthetic therapy sessions
- Create AI-assisted treatment plans
- Generate session summaries
- View risk flags and crisis language alerts
- Track treatment plan versions

### Client Portal

- View personalized treatment plan in plain language
- See short-term and long-term goals
- Track homework assignments
- Review session summaries
- Understand identified strengths

### Synthetic Personas

The app includes 4 predefined client personas for testing:

1. **Alex** (28, they/them): Generalized anxiety, perfectionism, sleep issues
2. **Jordan** (35, he/him): Burnout, low mood, work-life balance
3. **Maya** (22, she/her): Social anxiety, fear of judgment
4. **Sam** (40, they/them): Depression with suicidal ideation (safety testing)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate-session` | Generate synthetic therapy session |
| POST | `/api/generate-plan` | Create treatment plan from transcript |
| POST | `/api/generate-summary` | Generate session summaries |
| GET | `/api/clients` | List all clients |
| GET | `/api/clients/[id]` | Get client details |
| GET | `/api/sessions/[id]` | Get session details |

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck
```

## Database Commands

```bash
# Run migrations
npm run db:migrate

# Push schema changes (dev)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Safety Features

The application includes multiple layers of safety detection:

1. **Keyword scanning**: Detects crisis language using a curated keyword list
2. **Risk categorization**: Classifies detected language as passive SI, active SI, harm to others, or other
3. **Visual alerts**: Risk flags are prominently displayed in the therapist dashboard
4. **Evidence excerpts**: Provides context snippets for flagged content

## Disclaimer

This is a demonstration application using synthetic data only. It is not intended for clinical use and should not be used as a substitute for professional mental health care.

## License

MIT
