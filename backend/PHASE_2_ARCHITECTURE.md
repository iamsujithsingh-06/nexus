# Phase 2: Nexus Personal AI Operating System

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXUS API SERVER                              │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Auth     │  │  Chat    │  │  Health  │  │  Legacy Routes   │   │
│  │  Routes  │  │  Routes  │  │  Route  │  │  (future Phase N) │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────────────┘   │
│       │             │                                              │
│       └──────┬──────┘                                              │
│              ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                  NEXUS PIPELINE (core/pipeline.js)            │ │
│  │                                                               │ │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐        │ │
│  │  │ Planner │→ │ Analyzer │→ │Executor │→ │ Reviewer │        │ │
│  │  └─────────┘  └──────────┘  └────┬───┘  └──────────┘        │ │
│  │                                  │                           │ │
│  │  ┌───────────────────────────────┘                           │ │
│  │  ▼                                                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │
│  │  │ Context      │  │ Response     │  │ Self Review  │      │ │
│  │  │ Engine       │→ │ Formatter    │→ │ System       │      │ │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘      │ │
│  │         │                                                   │ │
│  │  ┌──────┴─────────────────────────────────────────────┐     │ │
│  │  │           Memory Engine (memory/)                    │     │ │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐  │     │ │
│  │  │  │ Storage  │ │Retrieval │ │ Updater  │ │Manager│  │     │ │
│  │  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬───┘  │     │ │
│  │  │       │            │            │           │        │     │ │
│  │  │       └───────┬────┴────────────┴───────────┘        │     │ │
│  │  │               ▼                                      │     │ │
│  │  │        ┌──────────────┐                              │     │ │
│  │  │        │   MongoDB    │                              │     │ │
│  │  │        │  (Memory)    │                              │     │ │
│  │  │        └──────────────┘                              │     │ │
│  │  └──────────────────────────────────────────────────────┘     │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────┐     │ │
│  │  │      Prompt Orchestration Layer (prompts/)            │     │ │
│  │  └──────────────────────────────────────────────────────┘     │ │
│  │                                                               │ │
│  │  ┌──────────────────────────────────────────────────────┐     │ │
│  │  │      Project Intelligence (services/)                 │     │ │
│  │  └──────────────────────────────────────────────────────┘     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                  │                               │
│                                  ▼                               │
│                ┌──────────────────────────────────┐               │
│                │      Gemini API Service           │               │
│                │   (services/geminiService.js)     │               │
│                │    Model chain: 2.5-f-lite →      │               │
│                │     3.5-flash → 2.0-flash         │               │
│                └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
backend/src/
├── agents/
│   ├── planner.js          # Request breakdown into subtasks
│   ├── analyzer.js         # Requirement/risk analysis
│   ├── executor.js         # Solution generation via Gemini
│   └── reviewer.js         # Output quality validation
├── memory/
│   ├── manager/
│   │   └── memoryManager.js    # Facade over storage/retrieval/updater
│   ├── storage/
│   │   └── memoryStorage.js    # MongoDB CRUD for Memory model
│   ├── retrieval/
│   │   └── memoryRetriever.js  # Relevance-based memory search
│   └── updater/
│       └── memoryUpdater.js    # Auto-extract insights from conversation
├── context/
│   └── contextEngine.js    # Merges User + Session + Memory + Project
├── prompts/
│   ├── index.js            # Prompt registry/getter
│   └── systemPrompts.js    # All prompt definitions
├── formatting/
│   └── responseFormatter.js # Template-based response structuring
├── core/
│   └── pipeline.js         # Main orchestration entry point
├── services/
│   ├── geminiService.js    # (existing) Gemini API with model fallback
│   ├── projectIntelligence.js # Auto-project detection & tracking
│   └── selfReview.js       # Pre-response validation checks
├── models/
│   ├── Memory.js           # (NEW) Memory persistence schema
│   └── ... (existing)
├── controllers/
│   └── chatController.js   # (MODIFIED) Now routes through pipeline
├── server.js               # (MODIFIED) Phase 2 initialization
└── ... (existing files)
```

## Data Flow

### Message Processing Flow

```
User sends message
  → chatController.sendMessage()
    → pipeline.processMessage(userId, chat, content, history)
      → ContextEngine.build(userId, chatData)
        → MemoryRetriever.getRelevantContext(userId)   [from MongoDB]
        → ProjectIntelligence.getActiveProjectsContext() [from memory]
        → SessionContext from chat/history
        → Returns merged context
      → Planner.analyze(message, context)
        → Detects format type: coding | general | learning | project-planning
        → Assesses complexity: simple | moderate | complex
        → Returns plan { objective, subtasks, formatType, complexity }
      → Analyzer.analyze(message, plan, context)
        → Extracts requirements, risks, missing info, constraints
        → Returns analysis
      → Executor.execute(plan, analysis, message, history)
        → Builds enhanced system prompt with context + format instructions
        → Calls geminiService.generateAIResponse() with custom prompt
        → Gemini API returns response (with model fallback on failure)
        → Returns { content, formatType }
      → Reviewer.review(executorResult, plan, analysis)
        → Validates: completeness, structure, code blocks, relevance, actionability
        → Returns { passed, score, issues, suggestions }
      → ResponseFormatter.format(content, formatType)
        → Ensures section headings match expected template
      → SelfReview.review(formattedContent, context)
        → Final validation pass
      → Post-process (async, non-blocking):
        → ProjectIntelligence.detectInMessage()
        → MemoryUpdater.extractAndStore() — preferences, facts, skills
      → Returns { content, formatType, review, metadata }
    → Assistant message saved to MongoDB
    → Response sent to frontend with pipeline metadata
```

### Memory Flow

```
Conversation happens
  → MemoryUpdater.extractAndStore(userId, userMessage, response)
    → Regex-based extraction: name, role, learning goals, preferences
    → MemoryStorage.save() to MongoDB
  → MemoryUpdater.storeInsight()
    → Captures conversation insights with timestamp
  → ProjectIntelligence.detectInMessage()
    → Detects project mentions, tech stack references
    → Creates/updates project records in memory

Next conversation
  → MemoryRetriever.getRelevantContext(userId)
    → Queries MongoDB for high-priority, recent memories
    → Categorizes by type (profile, preferences, goals, skills, etc.)
    → Returns formatted context string
  → ContextEngine merges into prompt automatically
```

### Agent Pipeline Flow

```
                     User Message
                         │
                         ▼
                   ┌──────────┐
                   │ Planner  │──→ Objective, subtasks, formatType, complexity
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │ Analyzer │──→ Requirements, risks, missing info, constraints
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │ Executor │──→ Calls Gemini API with enhanced prompt
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │ Reviewer │──→ Validates output quality (PASS/FAIL + score)
                   └────┬─────┘
                        │
                        ▼
                ┌──────────────┐
                │   Response   │──→ Applies template formatting
                │  Formatter   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Self Review  │──→ Final completeness + structure check
                └──────┬───────┘
                       │
                       ▼
                Formatted Response
```

## Memory Schema

```javascript
{
  userId:    ObjectId,       // Reference to User
  type:      String,         // user_profile | preference | goal | skill
                             // project | learning_progress
                             // conversation_insight | fact | decision
  key:       String,         // Unique identifier per user (e.g. "pref:like:python")
  value:     Mixed,          // The actual stored data (any structure)
  tags:      [String],       // Searchable tags
  priority:  Number,         // -10 to 10 (higher = more important)
  expiresAt: Date,           // Optional TTL expiry
  source:    String,         // auto | manual | system
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `{ userId: 1, key: 1 }` — unique compound key
- `{ userId: 1, type: 1 }` — type-based queries
- `{ userId: 1, tags: 1 }` — tag-based search
- `{ expiresAt: 1 }` — TTL auto-expiry

## Prompt Management

All prompts are centralized in `prompts/`:

| Prompt Name | File | Purpose |
|---|---|---|
| `system` | `systemPrompts.js` | Main Nexus OS system prompt with formatting rules |
| `planner` | `systemPrompts.js` | Agent prompt for request breakdown |
| `analyzer` | `systemPrompts.js` | Agent prompt for requirement analysis |
| `executor` | `systemPrompts.js` | Agent prompt for solution generation |
| `reviewer` | `systemPrompts.js` | Agent prompt for output validation |

Formats available: `general`, `coding`, `project-planning`, `learning`, `direct`.

## Format Templates

### General Response
```
**Understanding**: ...
**Analysis**: ...
**Solution**: ...
**Action Steps**: ...
**Summary**: ...
```

### Coding Response
```
**Problem**: ...
**Root Cause**: ...
**Solution**: ...
**Implementation Steps**: ...
**Potential Issues**: ...
**Next Steps**: ...
```

### Project Planning Response
```
**Objective**: ...
**Requirements**: ...
**Architecture**: ...
**Roadmap**: ...
**Risks**: ...
**Next Actions**: ...
```

### Learning Response
```
**Concept**: ...
**Explanation**: ...
**Example**: ...
**Common Mistakes**: ...
**Challenge**: ...
```

## Quality Control

### Agent Review (agents/reviewer.js)
Checks performed on every response:
- Completeness (sufficient length)
- Structure (headings, lists, breaks)
- Code block balance (matched ``` delimiters)
- Code inclusion (for coding responses)
- Example inclusion (for learning responses)
- Actionability (actionable guidance present)
- Relevance (no AI disclaimers)

Score: 0-100%. Pass threshold: 60%+.

### Self Review (services/selfReview.js)
Additional pre-delivery validation:
- Completeness check
- Structure check
- Readability (line length, paragraph count)
- Code block integrity
- Relevance (disclaimer-free)
- Actionability (next steps present)

## Project Intelligence

Automatic detection triggers:
- User mentions building/creating a project
- User mentions a technology stack
- User references a named application

Stored in memory as `project` type with:
- Name, tech stack, current stage, status, mention count
- Tracked across conversations
- Active projects injected into context

## Scalability Considerations

1. **Memory TTL**: Expiring memories can be set via `expiresAt` for time-sensitive context
2. **Priority scoring**: High-priority memories (score 5+) always included; lower scores filtered
3. **MongoDB indexes**: Compound indexes support efficient queries by userId + type/key/tags
4. **Async post-processing**: Memory extraction runs asynchronously after response delivery
5. **Agent pipeline**: Each agent is independently testable and replaceable
6. **Prompt separation**: No hardcoded prompts in business logic; all managed from prompts/
7. **Model fallback chain**: Gemini API calls fall through 3 models with retry

## Future Extensions

- Vector search for semantic memory retrieval
- Tool-use (web search, code execution, file I/O)
- Multi-turn agent conversations (agents calling agents)
- Streaming response through pipeline
- User-configurable memory priority rules
- Memory export/import
- Analytics on memory usage and pipeline performance
