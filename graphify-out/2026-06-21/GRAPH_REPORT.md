# Graph Report - workout_tracker  (2026-06-21)

## Corpus Check
- 88 files · ~54,154 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 467 nodes · 942 edges · 30 communities (23 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Navigation|App Navigation]]
- [[_COMMUNITY_Database and Exercises|Database and Exercises]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Workout Session UI|Workout Session UI]]
- [[_COMMUNITY_Analytics Charts|Analytics Charts]]
- [[_COMMUNITY_Plans and Graph Hooks|Plans and Graph Hooks]]
- [[_COMMUNITY_Analytics Date Ranges|Analytics Date Ranges]]
- [[_COMMUNITY_Expo App Configuration|Expo App Configuration]]
- [[_COMMUNITY_History and Active Workouts|History and Active Workouts]]
- [[_COMMUNITY_Web App Manifest|Web App Manifest]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Metro Configuration|Metro Configuration]]
- [[_COMMUNITY_Vercel Deployment|Vercel Deployment]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 41 edges
2. `getDatabase()` - 29 edges
3. `Text()` - 25 edges
4. `View()` - 14 edges
5. `expo` - 13 edges
6. `formatTimerDuration()` - 13 edges
7. `AnalyticsPeriod` - 11 edges
8. `What You Must Do When Invoked` - 11 edges
9. `buildDateBuckets()` - 10 edges
10. `uuidv4()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `PlanEditorScreen()` --calls--> `useTheme()`  [EXTRACTED]
  app/plan/[id].tsx → src/hooks/useTheme.ts
- `HistoryScreen()` --calls--> `useTabListPadding()`  [EXTRACTED]
  app/(tabs)/history.tsx → src/hooks/useTabListPadding.ts
- `StatsScreen()` --calls--> `useTabListPadding()`  [EXTRACTED]
  app/(tabs)/stats.tsx → src/hooks/useTabListPadding.ts
- `RootLayoutNav()` --calls--> `useColorScheme()`  [EXTRACTED]
  app/_layout.tsx → components/useColorScheme.ts
- `ActiveWorkoutScreen()` --calls--> `useActiveWorkoutStore`  [EXTRACTED]
  app/workout/[sessionId].tsx → src/stores/activeWorkout.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Communities (30 total, 7 thin omitted)

### Community 0 - "App Navigation"
Cohesion: 0.07
Nodes (49): styles, WorkoutCompleteScreen(), ExercisePicker(), ExercisePickerProps, styles, ExerciseRow(), ExerciseRowProps, styles (+41 more)

### Community 1 - "Database and Exercises"
Cohesion: 0.06
Nodes (53): DEFAULT_EXERCISES, columnExists(), getDatabase(), initDatabase(), runMigrations(), seedExerciseCatalog(), SCHEMA_STATEMENTS, Database (+45 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-font, expo-linear-gradient, expo-linking, expo-router (+33 more)

### Community 3 - "Workout Session UI"
Cohesion: 0.11
Nodes (22): styles, styles, EditScreenInfo(), styles, EmptyState(), EmptyStateProps, styles, ExternalLink() (+14 more)

### Community 4 - "Analytics Charts"
Cohesion: 0.13
Nodes (17): GRAPH_REGISTRY, BodyWeightChart(), styles, getChartWidth(), getCommonLineChartProps(), getLineSpacing(), DailyWorkoutTimeChart(), getMaxChartValue() (+9 more)

### Community 5 - "Plans and Graph Hooks"
Cohesion: 0.22
Nodes (10): RootLayoutNav(), styles, unstable_settings, OngoingWorkoutBanner(), useClientOnlyValue(), useColorScheme(), Colors, ColorScheme (+2 more)

### Community 6 - "Analytics Date Ranges"
Cohesion: 0.06
Nodes (50): addDays(), buildDateBuckets(), DateBucket, endOfDay(), fillDailyWorkoutBuckets(), formatCalendarDate(), formatDateKey(), formatDayLabel() (+42 more)

### Community 7 - "Expo App Configuration"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, permissions, predictiveBackGestureEnabled, typedRoutes (+18 more)

### Community 8 - "History and Active Workouts"
Cohesion: 0.08
Nodes (23): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+15 more)

### Community 9 - "Web App Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 10 - "TypeScript Configuration"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (13): PlanCard(), PlanCardProps, styles, SessionCardProps, ActiveSetState, CompletedSessionSummary, SessionExercise, SessionExerciseWithSets (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (10): Commands, Data storage, Features, Getting started, License, Prerequisites, Project structure, Tech stack (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 23 - "Community 23"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **190 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+185 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `App Navigation` to `Database and Exercises`, `Analytics Charts`, `Plans and Graph Hooks`, `Analytics Date Ranges`, `Community 17`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Text()` connect `App Navigation` to `Database and Exercises`, `Workout Session UI`, `Analytics Charts`, `Analytics Date Ranges`, `Community 17`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `getDatabase()` connect `Database and Exercises` to `App Navigation`, `Analytics Charts`, `Analytics Date Ranges`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _190 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.06526806526806526 - nodes in this community are weakly interconnected._
- **Should `Database and Exercises` be split into smaller, more focused modules?**
  _Cohesion score 0.06377204884667571 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._