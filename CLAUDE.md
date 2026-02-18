# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev              # Start dev server with Turbopack (http://localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint
npm run test             # Run Vitest test suite
npm run setup            # Install deps + generate Prisma client + run migrations
npm run db:reset         # Reset database (force)
```

## Architecture Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, Claude generates them in real-time with a virtual file system and live preview.

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Prisma/SQLite + Vercel AI SDK (Anthropic)

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/actions/` - Server Actions for data mutations (create-project, get-project, etc.)
- `src/components/chat/` - Chat interface (ChatInterface, MessageList, MessageInput)
- `src/components/editor/` - Monaco editor integration and FileTree
- `src/components/preview/` - Live component preview iframe
- `src/components/ui/` - shadcn/ui primitives
- `src/lib/contexts/` - React Context providers (chat-context, file-system-context)
- `src/lib/tools/` - AI tool definitions (str-replace, file-manager)
- `src/lib/prompts/` - System prompt for Claude generation

### Core Patterns

**Virtual File System** (`src/lib/file-system.ts`): In-memory file system with CRUD operations, serialized to database. No actual disk I/O.

**AI Streaming** (`src/app/api/chat/route.ts`): Uses Vercel AI SDK with tool calling (str_replace_editor, file_manager). Falls back to mock provider without API key.

**Auth** (`src/lib/auth.ts`): JWT sessions with HTTP-only cookies. Optional - supports anonymous users with local storage tracking.

**UI Layout**: 3-panel resizable layout - Chat (left), Editor with file tree (middle), Live preview iframe (right).

### Database Schema

Two models: `User` (email, password, projects) and `Project` (name, messages as JSON, data as serialized file system).

## Path Aliases

`@/*` maps to `./src/*`

## Code Style

Use comments sparingly. Only comment complex code.

## Database

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.
