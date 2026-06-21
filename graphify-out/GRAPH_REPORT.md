# Graph Report - .  (2026-06-20)

## Corpus Check
- 95 files · ~52,062 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 373 nodes · 814 edges · 17 communities (15 shown, 2 thin omitted)
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

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 39 edges
2. `getDatabase()` - 27 edges
3. `Text()` - 24 edges
4. `View()` - 14 edges
5. `expo` - 13 edges
6. `formatTimerDuration()` - 13 edges
7. `getDateRange()` - 11 edges
8. `AnalyticsPeriod` - 11 edges
9. `useColorScheme()` - 9 edges
10. `useActiveWorkoutStore` - 9 edges

## Surprising Connections (you probably didn't know these)
- `HistoryScreen()` --calls--> `useTabListPadding()`  [EXTRACTED]
  app/(tabs)/history.tsx → src/hooks/useTabListPadding.ts
- `StatsScreen()` --calls--> `useTabListPadding()`  [EXTRACTED]
  app/(tabs)/stats.tsx → src/hooks/useTabListPadding.ts
- `RootLayoutNav()` --calls--> `useColorScheme()`  [EXTRACTED]
  app/_layout.tsx → components/useColorScheme.ts
- `PlanEditorScreen()` --calls--> `useTheme()`  [EXTRACTED]
  app/plan/[id].tsx → src/hooks/useTheme.ts
- `ActiveWorkoutScreen()` --calls--> `useTheme()`  [EXTRACTED]
  app/workout/[sessionId].tsx → src/hooks/useTheme.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Communities (17 total, 2 thin omitted)

### Community 0 - "App Navigation"
Cohesion: 0.06
Nodes (43): RootLayoutNav(), styles, unstable_settings, styles, styles, EditScreenInfo(), styles, ExternalLink() (+35 more)

### Community 1 - "Database and Exercises"
Cohesion: 0.08
Nodes (37): DEFAULT_EXERCISES, columnExists(), getDatabase(), initDatabase(), runMigrations(), seedExerciseCatalog(), SCHEMA_STATEMENTS, Database (+29 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, expo, expo-constants, expo-crypto, expo-font, expo-linear-gradient, expo-linking, expo-router (+33 more)

### Community 3 - "Workout Session UI"
Cohesion: 0.09
Nodes (30): styles, WorkoutCompleteScreen(), ExercisePicker(), ExercisePickerProps, styles, ExerciseRow(), ExerciseRowProps, styles (+22 more)

### Community 4 - "Analytics Charts"
Cohesion: 0.09
Nodes (25): getGraphById(), GraphComponentProps, BodyWeightChart(), styles, DailyWorkoutTimeChart(), getMaxChartValue(), styles, ExerciseProgressChart() (+17 more)

### Community 5 - "Plans and Graph Hooks"
Cohesion: 0.09
Nodes (27): PlanCard(), PlanCardProps, styles, deletePlan(), getAllPlans(), getPlanExercises(), mapPlan(), PlanExerciseRow (+19 more)

### Community 6 - "Analytics Date Ranges"
Cohesion: 0.16
Nodes (25): buildMonthBuckets(), buildWeekBuckets(), buildYearBuckets(), DateBucket, DateRangeResult, endOfDay(), fillDailyWorkoutBuckets(), formatDateKey() (+17 more)

### Community 7 - "Expo App Configuration"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, permissions, predictiveBackGestureEnabled, typedRoutes (+18 more)

### Community 8 - "History and Active Workouts"
Cohesion: 0.16
Nodes (14): GRAPH_REGISTRY, GraphDefinition, GraphHubCard(), GraphHubCardProps, styles, OngoingWorkoutBanner(), useTabListPadding(), useActiveWorkoutStore (+6 more)

### Community 9 - "Web App Manifest"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 10 - "TypeScript Configuration"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

## Knowledge Gaps
- **136 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `Workout Session UI` to `History and Active Workouts`, `App Navigation`, `Analytics Charts`, `Plans and Graph Hooks`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Text()` connect `App Navigation` to `History and Active Workouts`, `Workout Session UI`, `Analytics Charts`, `Plans and Graph Hooks`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `getDatabase()` connect `Database and Exercises` to `Analytics Charts`, `Plans and Graph Hooks`, `Analytics Date Ranges`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.0642243328810493 - nodes in this community are weakly interconnected._
- **Should `Database and Exercises` be split into smaller, more focused modules?**
  _Cohesion score 0.08421985815602837 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._