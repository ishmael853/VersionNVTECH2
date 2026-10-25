(function () {
  'use strict';

  const root = document.documentElement;
  const storageKey = 'novatech-theme-mode';
  const positionKey = 'novatech-theme-position';

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch (error) {}

  const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', initialTheme);

  function addToggle() {
    if (document.getElementById('novatech-theme-toggle')) return;

    const button = document.createElement('button');

    button.id = 'novatech-theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Switch color theme');
    button.setAttribute('title', 'Drag to move • Click to change theme');
    button.innerHTML =
      '<span class="theme-icon" aria-hidden="true"></span>' +
      '<span class="theme-label"></span>';

    // Restore the saved position, or use the bottom-right corner.
    let savedPosition = null;

    try {
      savedPosition = JSON.parse(localStorage.getItem(positionKey));
    } catch (error) {}

    button.style.position = 'fixed';
    button.style.zIndex = '99999';

    if (
      savedPosition &&
      Number.isFinite(savedPosition.x) &&
      Number.isFinite(savedPosition.y)
    ) {
      button.style.left = Math.max(0, savedPosition.x) + 'px';
      button.style.top = Math.max(0, savedPosition.y) + 'px';
    } else {
      button.style.right = '24px';
      button.style.bottom = '24px';
    }

    function updateLabel() {
      const theme = root.getAttribute('data-theme');
      button.querySelector('.theme-icon').textContent =
        theme === 'dark' ? '☀' : '☾';

      button.querySelector('.theme-label').textContent =
        theme === 'dark' ? 'Light mode' : 'Dark mode';

      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }

    updateLabel();

    // Click to switch themes.
    button.addEventListener('click', function () {
      if (button.dataset.dragged === 'true') {
        button.dataset.dragged = 'false';
        return;
      }

      const nextTheme =
        root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

      root.setAttribute('data-theme', nextTheme);
      updateLabel();

      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch (error) {}
    });

    // Drag the button around the screen.
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    button.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      const rect = button.getBoundingClientRect();

      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      button.style.left = rect.left + 'px';
      button.style.top = rect.top + 'px';
      button.style.right = 'auto';
      button.style.bottom = 'auto';

      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener('pointermove', function (event) {
      if (!dragging) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        moved = true;
      }

      if (!moved) return;

      const maxLeft = window.innerWidth - button.offsetWidth;
      const maxTop = window.innerHeight - button.offsetHeight;

      const newLeft = Math.max(
        0,
        Math.min(maxLeft, startLeft + deltaX)
      );

      const newTop = Math.max(
        0,
        Math.min(maxTop, startTop + deltaY)
      );

      button.style.left = newLeft + 'px';
      button.style.top = newTop + 'px';
    });

    function stopDragging() {
      if (!dragging) return;

      dragging = false;

      if (moved) {
        button.dataset.dragged = 'true';

        try {
          const rect = button.getBoundingClientRect();

          localStorage.setItem(
            positionKey,
            JSON.stringify({
              x: rect.left,
              y: rect.top
            })
          );
        } catch (error) {}
      }
    }

    button.addEventListener('pointerup', stopDragging);
    button.addEventListener('pointercancel', stopDragging);

    // Keep the button visible after the screen resizes.
    window.addEventListener('resize', function () {
      const rect = button.getBoundingClientRect();

      button.style.left =
        Math.max(0, Math.min(rect.left, window.innerWidth - button.offsetWidth)) + 'px';

      button.style.top =
        Math.max(0, Math.min(rect.top, window.innerHeight - button.offsetHeight)) + 'px';

      button.style.right = 'auto';
      button.style.bottom = 'auto';
    });

    document.body.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addToggle);
  } else {
    addToggle();
  }
})();
