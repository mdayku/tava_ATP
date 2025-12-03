# Product Requirements Document (PRD)
## Tava AI-Assisted Treatment Plans

**Version**: 1.0  
**Last Updated**: December 3, 2025  
**Status**: MVP Complete

---

## 1. Executive Summary

Tava AI-Assisted Treatment Plans is a demonstration application showcasing how AI can support mental health clinicians in creating structured, comprehensive treatment plans from therapy session transcripts. The application generates dual-view treatment plans - clinical documentation for therapists and plain-language summaries for clients - while incorporating safety detection features for crisis language.

### 1.1 Problem Statement

Mental health clinicians spend significant time on administrative documentation, reducing time available for direct patient care. Treatment plans often lack standardization, and clients frequently don't receive accessible summaries of their care plans.

### 1.2 Solution

An AI-powered platform that:
- Generates structured treatment plans from session transcripts
- Provides clinician-facing and client-facing views of the same plan
- Detects and flags potential crisis language for clinician review
- Simulates realistic therapy sessions for testing and demonstration

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

| Goal | Description | Status |
|------|-------------|--------|
| Dual-view treatment plans | Generate clinical and client-friendly versions | COMPLETED |
| Session simulation | Create realistic synthetic transcripts | COMPLETED |
| Safety detection | Flag crisis language automatically | COMPLETED |
| Version tracking | Maintain treatment plan history | COMPLETED |
| Clean UX | Intuitive interfaces for both user types | COMPLETED |

### 2.2 Success Metrics (Demo Scope)

- Treatment plans parse successfully with valid JSON structure
- Risk scanner correctly identifies crisis keywords
- UI renders without errors for both therapist and client views
- All core API endpoints functional

---

## 3. User Personas

### 3.1 Primary Users

#### Therapist (Dr. Avery Rhodes)
- **Role**: Licensed mental health clinician
- **Goals**: Reduce documentation time, ensure comprehensive treatment plans
- **Pain Points**: Administrative burden, inconsistent documentation
- **Modalities**: CBT, ACT
- **Population**: Adults 25-45, anxiety/depression

#### Client
- **Role**: Therapy patient
- **Goals**: Understand their care plan, track progress, complete homework
- **Pain Points**: Clinical jargon, lack of accessible information
- **Needs**: Plain language, encouragement, clear action items

### 3.2 Synthetic Client Personas

| Persona | Age | Pronouns | Presenting Concerns | Context |
|---------|-----|----------|---------------------|---------|
| Alex | 28 | they/them | Generalized anxiety, perfectionism, sleep issues | Tech worker, performance anxiety |
| Jordan | 35 | he/him | Burnout, low mood, anhedonia | New parent, work-life imbalance |
| Maya | 22 | she/her | Social anxiety, rumination, fear of judgment | College senior, job search stress |
| Sam | 40 | they/them | Depression with suicidal ideation | Recently divorced, limited support |

---

## 4. Features & Requirements

### 4.1 Core Features

#### 4.1.1 Synthetic Session Generation
**Status**: COMPLETED

- Generate realistic 50-minute therapy session transcripts
- Use predefined client personas for consistency
- Alternate THERAPIST:/CLIENT: dialogue format
- Include presenting concerns, homework discussion, and next steps
- Support session numbering for continuity

**API**: `POST /api/simulate-session`

#### 4.1.2 Treatment Plan Generation
**Status**: COMPLETED

- Parse transcript into structured JSON
- Extract: presenting concerns, clinical impressions, goals (short/long-term), interventions, homework, strengths, risk indicators
- Generate therapist-facing clinical documentation
- Generate client-facing plain-language version
- Version treatment plans per session

**API**: `POST /api/generate-plan`

**Schema**:
```json
{
  "presenting_concerns": "string",
  "clinical_impressions": "string",
  "goals": {
    "short_term": ["string"],
    "long_term": ["string"]
  },
  "interventions": ["string"],
  "homework": ["string"],
  "strengths": ["string"],
  "risk_indicators": ["string"]
}
```

#### 4.1.3 Session Summary Generation
**Status**: COMPLETED

- Generate therapist summary (clinical, domain-organized)
- Generate client summary (warm, encouraging)
- Include "what we did" and "next steps" for clients

**API**: `POST /api/generate-summary`

#### 4.1.4 Crisis Language Detection
**Status**: COMPLETED

- Keyword-based scanning for crisis language
- Categories: passive SI, active SI, harm to others, other
- Extract context excerpts around flagged keywords
- Visual indicators in therapist UI
- Risk level classification (none/low/high)

**Keywords Monitored**:
- "kill myself", "end my life", "suicidal", "suicide"
- "self-harm", "hurt myself", "hurt someone", "harm others"
- "don't want to live", "want to die", "better off dead"
- "no reason to live", "can't go on", "end it all"

### 4.2 User Interface

#### 4.2.1 Landing Page
**Status**: COMPLETED

- Role selection (Therapist/Client)
- Feature highlights
- Persona overview cards
- Modern gradient design

#### 4.2.2 Therapist Dashboard
**Status**: COMPLETED

- Client list with last session info
- Quick stats (clients, sessions, available personas)
- Generate new client from persona
- Risk flag indicators
- Navigation to client timelines

#### 4.2.3 Client Timeline (Therapist View)
**Status**: COMPLETED

- Session history in reverse chronological order
- Treatment plan version badges
- Risk flag alerts with keyword details
- View transcript modal
- Generate plan/summary buttons
- Client portal link

#### 4.2.4 Client Portal
**Status**: COMPLETED

- Personalized greeting
- Plain-language treatment plan display
- Goals with progress indicators
- Homework checklist
- Strengths recognition
- Session summary display
- Warm, encouraging design

### 4.3 Technical Requirements

#### 4.3.1 Database Schema
**Status**: COMPLETED

**Models**:
- `User`: id, role, name, email, createdAt
- `Client`: id, therapistId, displayName, personaId, createdAt
- `Session`: id, clientId, therapistId, source, date, transcript, createdAt
- `SessionSummary`: id, sessionId, therapistView, clientView, createdAt
- `TreatmentPlanVersion`: id, sessionId, versionNumber, therapistView, clientView, riskFlags, editedByTherapist, createdAt

**Constraints**:
- Unique constraint on Client (therapistId, personaId)
- One-to-one Session-SessionSummary relationship

#### 4.3.2 API Endpoints
**Status**: COMPLETED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/simulate-session | Generate synthetic session |
| POST | /api/generate-plan | Create treatment plan |
| POST | /api/generate-summary | Create session summary |
| GET | /api/clients | List therapist's clients |
| GET | /api/clients/[id] | Get client details |
| GET | /api/sessions/[id] | Get session details |

#### 4.3.3 AI Integration
**Status**: COMPLETED

- OpenAI GPT-4.1-mini model
- JSON response format for structured outputs
- Text format for transcript generation
- Modular prompt templates

---

## 5. Technical Architecture

### 5.1 Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Prisma ORM + SQLite |
| AI | OpenAI API |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Testing | Vitest |

### 5.2 Directory Structure

```
tava_ATP/
├── app/                    # Next.js pages & API routes
├── components/             # React components
├── lib/                    # Utilities & prompts
├── prisma/                 # Database schema
├── tests/                  # Test files
└── public/                 # Static assets
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
- API responses < 30s (AI generation dependent)
- Page load < 3s

### 6.2 Security
- No real PHI in synthetic data
- API key environment variable protection
- Input validation on all endpoints

### 6.3 Accessibility
- Semantic HTML structure
- Color contrast compliance
- Keyboard navigation support

### 6.4 Maintainability
- TypeScript strict mode
- Modular component architecture
- Comprehensive test coverage for core logic

---

## 7. Testing Strategy

### 7.1 Unit Tests
**Status**: COMPLETED

- Schema validation tests (Zod)
- Risk scanner keyword detection
- Risk level classification

### 7.2 Integration Tests
**Status**: PENDING (future enhancement)

- API endpoint testing
- Database operations

### 7.3 E2E Tests
**Status**: PENDING (future enhancement)

- User flow testing
- Cross-browser validation

---

## 8. Development Progress

### 8.1 Completed Milestones

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Setup | COMPLETED |
| Phase 2 | Database Layer | COMPLETED |
| Phase 3 | Core Libraries | COMPLETED |
| Phase 4 | AI Prompt System | COMPLETED |
| Phase 5 | API Routes | COMPLETED |
| Phase 6 | UI Components | COMPLETED |
| Phase 7 | Landing Page | COMPLETED |
| Phase 8 | Therapist Dashboard | COMPLETED |
| Phase 9 | Client Portal | COMPLETED |
| Phase 10 | Interactive Features | COMPLETED |
| Phase 11 | Testing | COMPLETED |
| Phase 12 | Documentation | COMPLETED |

### 8.2 Files Created

**Configuration**:
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `vitest.config.ts` - Test configuration
- `.gitignore` - Git ignore rules

**Libraries**:
- `lib/db.ts` - Prisma client singleton
- `lib/openai.ts` - OpenAI wrapper
- `lib/personas.ts` - Client personas
- `lib/riskScanner.ts` - Crisis detection
- `lib/schemas.ts` - Zod validation

**Prompts**:
- `lib/prompts/simulateSession.ts`
- `lib/prompts/plan.ts`
- `lib/prompts/clientPlan.ts`
- `lib/prompts/summary.ts`
- `lib/prompts/risk.ts`
- `lib/prompts/index.ts`

**API Routes**:
- `app/api/simulate-session/route.ts`
- `app/api/generate-plan/route.ts`
- `app/api/generate-summary/route.ts`
- `app/api/clients/route.ts`
- `app/api/clients/[id]/route.ts`
- `app/api/sessions/[id]/route.ts`

**Pages**:
- `app/page.tsx` - Landing page
- `app/layout.tsx` - Root layout
- `app/globals.css` - Global styles
- `app/therapist/page.tsx` - Therapist dashboard
- `app/therapist/GenerateClientButton.tsx`
- `app/therapist/clients/[id]/page.tsx` - Client timeline
- `app/therapist/clients/[id]/SessionActions.tsx`
- `app/therapist/clients/[id]/TranscriptModal.tsx`
- `app/client/[id]/page.tsx` - Client portal

**Components**:
- `components/Header.tsx`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/RiskBadge.tsx`
- `components/ui/index.ts`

**Tests**:
- `tests/planParsing.test.ts`
- `tests/riskScanner.test.ts`

**Documentation**:
- `README.md`
- `PRD.md` (this document)

---

## 9. Future Enhancements

### 9.1 Short-term (Next Sprint)
- [ ] Treatment plan editing by therapist
- [ ] Manual transcript upload/paste
- [ ] Client authentication
- [ ] Session scheduling

### 9.2 Medium-term
- [ ] Progress tracking visualizations
- [ ] Homework completion tracking
- [ ] Multi-therapist support
- [ ] PostgreSQL migration

### 9.3 Long-term
- [ ] Real-time collaboration
- [ ] Mobile application
- [ ] Integration with EHR systems
- [ ] Advanced NLP risk assessment

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI hallucination | Medium | Human review required, clear disclaimers |
| Crisis language missed | High | Multiple detection layers, conservative flagging |
| API rate limits | Medium | Error handling, retry logic |
| Data privacy | High | Synthetic data only, no real PHI |

---

## 11. Appendix

### 11.1 Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript validation

# Database
npm run db:migrate   # Run migrations
npm run db:push      # Push schema
npm run db:studio    # Open Prisma Studio

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
```

### 11.2 Environment Variables

```env
OPENAI_API_KEY=sk-...    # Required: OpenAI API key
DATABASE_URL=file:...    # Optional: Database path
```

---

**Document Owner**: Development Team  
**Stakeholders**: Gauntlet, Tava Health  
**Approval Status**: Draft

