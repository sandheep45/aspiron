<script lang="ts">
import {
  ArrowRight,
  BookOpen,
  Brain,
  GraduationCap,
  Users,
} from '@lucide/svelte'

const heroStats = [
  { value: '3', label: 'Exams Supported' },
  { value: '26', label: 'Documentation Pages' },
  { value: 'AI-Powered', label: 'Learning Assistant' },
]

const features = [
  {
    icon: Brain,
    title: 'Memory-Aware Learning',
    description:
      'AI tracks what you forget and guides you back to the material before you lose it.',
  },
  {
    icon: GraduationCap,
    title: 'Exam-Focused Content',
    description:
      'Structured learning for PGT, JEE, and NEET with context that persists across all features.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description:
      'Peer discussions and a virtual Community Bot that guides without replacing human interaction.',
  },
]
</script>

<svelte:head>
  <title>Aspiron Documentation - Student-First Learning Platform</title>
  <meta
    name="description"
    content="Documentation for Aspiron - A memory-aware, AI-guided learning platform for competitive exam preparation."
  />
</svelte:head>

<div class="py-12">
  <section class="mb-16 text-center">
    <h1
      class="mb-4 text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-5xl"
    >
      Aspiron Documentation
    </h1>
    <p
      class="mx-auto mb-8 max-w-2xl text-lg text-surface-600 dark:text-surface-400"
    >
      Learn how Aspiron helps students prepare for competitive exams through
      memory-aware learning, active recall, and guided revision.
    </p>
    <div class="flex justify-center gap-4">
      <a
        href="/docs/intro"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
      >
        Get Started
        <ArrowRight class="h-4 w-4" />
      </a>
      <a
        href="/docs/student-journey"
        class="inline-flex items-center gap-2 rounded-lg border border-surface-300 bg-white px-6 py-3 font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
      >
        See Student Journey
      </a>
    </div>

    <div class="mt-8 flex justify-center gap-8">
      {#each heroStats as stat}
        <div class="text-center">
          <div
            class="text-2xl font-bold text-primary-600 dark:text-primary-400"
          >
            {stat.value}
          </div>
          <div class="text-sm text-surface-500">{stat.label}</div>
        </div>
      {/each}
    </div>
  </section>

  <section class="mb-16 grid gap-8 sm:grid-cols-3">
    {#each features as feature}
      <div
        class="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-800"
      >
        <div
          class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
        >
          <feature.icon class="h-6 w-6" />
        </div>
        <h3
          class="mb-2 text-lg font-semibold text-surface-900 dark:text-surface-100"
        >
          {feature.title}
        </h3>
        <p class="text-surface-600 dark:text-surface-400">
          {feature.description}
        </p>
      </div>
    {/each}
  </section>

  <section>
    <h2 class="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
      Documentation
    </h2>
    <div class="grid gap-4 sm:grid-cols-2">
      <a
        href="/docs/intro"
        class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
      >
        <div
          class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400"
        >
          <BookOpen class="h-5 w-5" />
        </div>
        <div>
          <h3
            class="font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-100 dark:group-hover:text-primary-300"
          >
            Introduction
          </h3>
          <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
            What is Aspiron and how it differs from other learning platforms.
          </p>
        </div>
      </a>
      <a
        href="/docs/mvp-scope"
        class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
      >
        <div
          class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400"
        >
          <BookOpen class="h-5 w-5" />
        </div>
        <div>
          <h3
            class="font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-100 dark:group-hover:text-primary-300"
          >
            MVP Scope
          </h3>
          <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
            What's included and what's intentionally excluded in the MVP.
          </p>
        </div>
      </a>
      <a
        href="/docs/student-journey"
        class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
      >
        <div
          class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400"
        >
          <BookOpen class="h-5 w-5" />
        </div>
        <div>
          <h3
            class="font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-100 dark:group-hover:text-primary-300"
          >
            Student Journey
          </h3>
          <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
            Day 1 onboarding to exam preparation - how students use Aspiron.
          </p>
        </div>
      </a>
      <a
        href="/docs/design-philosophy"
        class="group flex items-start gap-4 rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-surface-700 dark:bg-surface-800 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
      >
        <div
          class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400"
        >
          <BookOpen class="h-5 w-5" />
        </div>
        <div>
          <h3
            class="font-semibold text-surface-900 group-hover:text-primary-700 dark:text-surface-100 dark:group-hover:text-primary-300"
          >
            Design Philosophy
          </h3>
          <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
            Student-first principles and why systems matter more than
            motivation.
          </p>
        </div>
      </a>
    </div>
  </section>
</div>
