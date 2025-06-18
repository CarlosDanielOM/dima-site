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
    // Comprehensive spacing utilities safelist
    // Space utilities (most critical for your issue)
    'space-x-0', 'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4', 'space-x-5', 'space-x-6', 'space-x-8', 'space-x-10', 'space-x-12',
    'space-y-0', 'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-5', 'space-y-6', 'space-y-8', 'space-y-10', 'space-y-12',
    'space-x-reverse', 'space-y-reverse',
    
    // Gap utilities
    'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12', 'gap-16',
    'gap-x-0', 'gap-x-1', 'gap-x-2', 'gap-x-3', 'gap-x-4', 'gap-x-5', 'gap-x-6', 'gap-x-8', 'gap-x-10', 'gap-x-12', 'gap-x-16',
    'gap-y-0', 'gap-y-1', 'gap-y-2', 'gap-y-3', 'gap-y-4', 'gap-y-5', 'gap-y-6', 'gap-y-8', 'gap-y-10', 'gap-y-12', 'gap-y-16',
    
    // Padding utilities
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16',
    'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16',
    'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16',
    'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-8', 'pt-10', 'pt-12', 'pt-16',
    'pr-0', 'pr-1', 'pr-2', 'pr-3', 'pr-4', 'pr-5', 'pr-6', 'pr-8', 'pr-10', 'pr-12', 'pr-16',
    'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5', 'pb-6', 'pb-8', 'pb-10', 'pb-12', 'pb-16',
    'pl-0', 'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pl-5', 'pl-6', 'pl-8', 'pl-10', 'pl-12', 'pl-16',
    
    // Margin utilities
    'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16',
    'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16',
    'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16',
    'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6', 'mt-8', 'mt-10', 'mt-12', 'mt-16',
    'mr-0', 'mr-1', 'mr-2', 'mr-3', 'mr-4', 'mr-5', 'mr-6', 'mr-8', 'mr-10', 'mr-12', 'mr-16',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8', 'mb-10', 'mb-12', 'mb-16',
    'ml-0', 'ml-1', 'ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-8', 'ml-10', 'ml-12', 'ml-16',
    
    // Auto margins
    'm-auto', 'mx-auto', 'my-auto', 'mt-auto', 'mr-auto', 'mb-auto', 'ml-auto',
    
    // Negative margins
    '-m-1', '-m-2', '-m-3', '-m-4', '-m-5', '-m-6', '-m-8', '-m-10', '-m-12', '-m-16',
    '-mx-1', '-mx-2', '-mx-3', '-mx-4', '-mx-5', '-mx-6', '-mx-8', '-mx-10', '-mx-12', '-mx-16',
    '-my-1', '-my-2', '-my-3', '-my-4', '-my-5', '-my-6', '-my-8', '-my-10', '-my-12', '-my-16',
    '-mt-1', '-mt-2', '-mt-3', '-mt-4', '-mt-5', '-mt-6', '-mt-8', '-mt-10', '-mt-12', '-mt-16',
    '-mr-1', '-mr-2', '-mr-3', '-mr-4', '-mr-5', '-mr-6', '-mr-8', '-mr-10', '-mr-12', '-mr-16',
    '-mb-1', '-mb-2', '-mb-3', '-mb-4', '-mb-5', '-mb-6', '-mb-8', '-mb-10', '-mb-12', '-mb-16',
    '-ml-1', '-ml-2', '-ml-3', '-ml-4', '-ml-5', '-ml-6', '-ml-8', '-ml-10', '-ml-12', '-ml-16',
    
    // Responsive variants for critical spacing
    'sm:space-x-1', 'sm:space-x-2', 'sm:space-x-3', 'sm:space-x-4', 'sm:space-x-6', 'sm:space-x-8',
    'sm:space-y-1', 'sm:space-y-2', 'sm:space-y-3', 'sm:space-y-4', 'sm:space-y-6', 'sm:space-y-8',
    'sm:gap-1', 'sm:gap-2', 'sm:gap-3', 'sm:gap-4', 'sm:gap-6', 'sm:gap-8',
    'md:space-x-1', 'md:space-x-2', 'md:space-x-3', 'md:space-x-4', 'md:space-x-6', 'md:space-x-8',
    'md:space-y-1', 'md:space-y-2', 'md:space-y-3', 'md:space-y-4', 'md:space-y-6', 'md:space-y-8',
    'md:gap-1', 'md:gap-2', 'md:gap-3', 'md:gap-4', 'md:gap-6', 'md:gap-8',
    'lg:space-x-1', 'lg:space-x-2', 'lg:space-x-3', 'lg:space-x-4', 'lg:space-x-6', 'lg:space-x-8',
    'lg:space-y-1', 'lg:space-y-2', 'lg:space-y-3', 'lg:space-y-4', 'lg:space-y-6', 'lg:space-y-8',
    'lg:gap-1', 'lg:gap-2', 'lg:gap-3', 'lg:gap-4', 'lg:gap-6', 'lg:gap-8',
    'xl:space-x-1', 'xl:space-x-2', 'xl:space-x-3', 'xl:space-x-4', 'xl:space-x-6', 'xl:space-x-8',
    'xl:space-y-1', 'xl:space-y-2', 'xl:space-y-3', 'xl:space-y-4', 'xl:space-y-6', 'xl:space-y-8',
    'xl:gap-1', 'xl:gap-2', 'xl:gap-3', 'xl:gap-4', 'xl:gap-6', 'xl:gap-8',
  ]
} 