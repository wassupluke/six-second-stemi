/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        screen: '#0b1a24',      // ECG screen background
        trace: '#e6faff',       // waveform stroke
        grid: '#123b4a',        // graph-paper lines
        bezel: '#1b2b34',       // simulator chrome
        learn: '#2b7bb9',       // LEARN accent (blue)
        game: '#d2691e',        // GAME accent (orange)
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
