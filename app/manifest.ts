import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinkNest',
    short_name: 'LinkNest',
    description: 'Your personal link hub — share all your important links in one place.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    categories: ['productivity', 'social', 'utilities'],
  }
}
