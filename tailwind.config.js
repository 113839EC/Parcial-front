/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  safelist: [
    'bg-blue-600', 'bg-red-600', 'bg-slate-700', 'bg-slate-600',
    'ring-2', 'ring-white', 'ring-yellow-400',
    'bg-green-500/40', 'bg-orange-500/40', 'bg-purple-500/40',
    'opacity-0', 'scale-75', 'piece-move', 'piece-attack', 'piece-mutate'
  ],
  theme: {
    extend: {
      animation: {
        'flash-red': 'flashRed 0.3s ease-in-out',
        'spin-once': 'spinOnce 0.35s ease-in-out',
        'pulse-ring': 'pulseRing 1s ease-in-out infinite'
      },
      keyframes: {
        flashRed: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239,68,68,0.7)' }
        },
        spinOnce: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.3)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(250,204,21,0.6)' },
          '50%': { boxShadow: '0 0 0 6px rgba(250,204,21,0)' }
        }
      }
    }
  },
  plugins: []
};
