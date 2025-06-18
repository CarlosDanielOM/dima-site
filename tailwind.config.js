/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Spacing utilities that might be purged
    'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-6',
    'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6',
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
    'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8',
    'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8',
    'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-6', 'mx-8',
    'my-1', 'my-2', 'my-3', 'my-4', 'my-6', 'my-8',
    'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-6', 'ml-8',
    'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-6', 'mr-8',
    'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-6', 'mt-8',
    'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mb-8',
  ]
} 