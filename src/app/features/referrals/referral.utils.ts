/**
 * Available gradient classes for referral cards
 */
const CARD_GRADIENTS = [
  'bg-gradient-to-br from-purple-600 to-indigo-600',   // Purple
  'bg-gradient-to-br from-orange-500 to-red-500',      // Orange
  'bg-gradient-to-br from-emerald-500 to-teal-600',    // Emerald
  'bg-gradient-to-br from-blue-500 to-cyan-600',       // Blue
  'bg-gradient-to-br from-pink-500 to-rose-600',       // Pink
];

/**
 * Returns a consistent gradient class based on a string hash
 */
export function getCardGradient(code: string): string {
  // Simple hash function to get consistent index from string
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get positive index
  const index = Math.abs(hash) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[index];
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Format relative date
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
}
