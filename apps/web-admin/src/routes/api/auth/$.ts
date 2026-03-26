import { createFileRoute } from '@tanstack/react-router'
import { GET, POST } from '@/lib/auth'

/**
 * Auth.js API route handler
 * Handles all auth routes: /api/auth/*
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => GET({ request, response: new Response() }),
      POST: ({ request }) => POST({ request, response: new Response() }),
    },
  },
})
