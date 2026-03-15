// theme.js - Universal Dark Mode Toggle
// Inject this before </body> in all pages

(function () {
    // ── Apply saved theme immediately to prevent flash ──
    const saved = localStorage.getItem('rm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('rm_theme', theme);
        // Update all toggle buttons
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            const sunIcon = btn.querySelector('.icon-sun');
            const moonIcon = btn.querySelector('.icon-moon');
            if (sunIcon) sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
            if (moonIcon) moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
        });
    }

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    };

    // Apply on load
    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(saved);
    });
})();