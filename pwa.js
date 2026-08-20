// pwa.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// ===== Universal Network Loading Indicator =====

(function () {
  let activeRequests = 0;
  let loadingBar = null;

  function createLoadingBar() {
    if (loadingBar) return loadingBar;

    loadingBar = document.createElement('div');
    loadingBar.id = 'hcNetworkLoadingBar';

    loadingBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      pointer-events: none;
      background: transparent;
      overflow: hidden;
      display: none;
    `;

    const inner = document.createElement('span');
    inner.style.cssText = `
      display: block;
      width: 30%;
      height: 100%;
      background: #0F172A;
      border-radius: 0 2px 2px 0;
      animation: hcNetworkSlide 1.2s ease-in-out infinite;
    `;

    loadingBar.appendChild(inner);
    document.body.appendChild(loadingBar);

    // Add keyframes if not already present
    if (!document.getElementById('hcNetworkKeyframes')) {
      const style = document.createElement('style');
      style.id = 'hcNetworkKeyframes';
      style.textContent = `
        @keyframes hcNetworkSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(333%); }
        }
      `;
      document.head.appendChild(style);
    }

    return loadingBar;
  }

  function showLoading() {
    const bar = createLoadingBar();
    bar.style.display = 'block';
  }

  function hideLoading() {
    if (loadingBar) {
      loadingBar.style.display = 'none';
    }
  }

  function startRequest() {
    activeRequests++;
    showLoading();
  }

  function endRequest() {
    activeRequests--;
    if (activeRequests <= 0) {
      activeRequests = 0;
      hideLoading();
    }
  }

  // Wrap fetch
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    startRequest();

    return originalFetch.apply(this, args)
      .then((response) => {
        endRequest();
        return response;
      })
      .catch((error) => {
        endRequest();
        throw error;
      });
  };

  // Also show loading while the page is loading
  window.addEventListener('load', () => {
    setTimeout(() => {
      hideLoading();
    }, 100);
  });

  // Show loading immediately when script runs
  startRequest();
})();