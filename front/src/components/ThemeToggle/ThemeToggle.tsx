import { useThemeStore } from '../../store/themeStore.ts'
import './ThemeToggle.css'

function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const baseColor = theme === 'dark' ? '#16151a' : '#ffffff'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <circle cx="10" cy="10" r="10" fill={baseColor} />
        <path d="M10 0 A10 10 0 0 1 10 20 Z" fill="var(--color-accent)" />
      </svg>
    </button>
  )
}

export default ThemeToggle
