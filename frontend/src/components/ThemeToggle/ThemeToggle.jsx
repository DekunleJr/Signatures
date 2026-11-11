import { toggleTheme, useTheme } from "../../utils/theme";

export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const next = theme === "light" ? "dark" : "light";
  return (
    <button
      type='button'
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span aria-hidden='true'>{theme === "light" ? "🌙" : "☀️"}</span>
    </button>
  );
}
