import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize dark mode before React renders to avoid flash
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

console.log('Theme initialization:', { savedTheme, prefersDark, shouldBeDark });

if (shouldBeDark) {
  document.documentElement.classList.add('dark');
  console.log('Dark mode applied on startup');
} else {
  console.log('Light mode on startup');
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
