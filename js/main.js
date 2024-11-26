import { DataLoader } from './data-loader.js';

class JSONPerformanceApp {
  constructor() {
    this.loader = null;
    this.initializeApp();
    this.setupSampleGenerator();
    this.setupKeyboardShortcuts();
  }

  initializeApp() {
    this.loader = new DataLoader();
    this.setupThemeToggle();
    this.setupErrorHandling();
  }

  setupSampleGenerator() {
    document.getElementById('generateSample').addEventListener('click', () => {
      const size = parseInt(document.getElementById('sampleSize').value);
      const sampleData = this.generateSampleData(size);
      document.getElementById('jsonInput').value = JSON.stringify(sampleData, null, 2);
      document.querySelector('[data-tab="manual"]').click();
    });
  }

  generateSampleData(size) {
    return Array.from({ length: size }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.random() * 1000,
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)],
      metadata: {
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        priority: Math.floor(Math.random() * 5) + 1,
        tags: Array.from(
          { length: Math.floor(Math.random() * 4) + 1 },
          () => ['urgent', 'review', 'bug', 'feature', 'enhancement'][Math.floor(Math.random() * 5)]
        ),
        nested: {
          level1: {
            level2: {
              level3: {
                value: Math.random() * 100,
                array: Array.from({ length: 3 }, () => Math.random())
              }
            }
          }
        }
      },
      metrics: {
        processingTime: Math.random() * 100,
        errorRate: Math.random() * 0.1,
        successCount: Math.floor(Math.random() * 1000),
        performance: {
          cpu: Math.random() * 100,
          memory: Math.random() * 1024,
          latency: Math.random() * 200
        }
      },
      config: {
        enabled: Math.random() > 0.5,
        retryCount: Math.floor(Math.random() * 5),
        timeout: Math.floor(Math.random() * 5000),
        features: {
          logging: true,
          monitoring: Math.random() > 0.5,
          alerts: {
            email: Math.random() > 0.5,
            slack: Math.random() > 0.5,
            threshold: Math.random() * 10
          }
        }
      },
      history: Array.from({ length: 5 }, (_, index) => ({
        action: ['created', 'updated', 'processed', 'reviewed', 'completed'][index],
        timestamp: new Date(Date.now() - (5 - index) * 86400000).toISOString(),
        user: `user${Math.floor(Math.random() * 10) + 1}`,
        changes: Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => ({ field: ['status', 'priority', 'category'][Math.floor(Math.random() * 3)] })
        )
      }))
    }));
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + ...
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'p': // Performance Test
            e.preventDefault();
            document.querySelector('.load-btn.performance')?.click();
            break;
          case 'i': // Iteration Test
            e.preventDefault();
            document.querySelector('.load-btn.iteration')?.click();
            break;
          case 'g': // Generate Sample
            e.preventDefault();
            document.getElementById('generateSample')?.click();
            break;
          case 'c': // Clear
            e.preventDefault();
            document.getElementById('clearBtn')?.click();
            break;
        }
      }
    });
  }

  setupThemeToggle() {
    // Add theme toggle button if needed
    const themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.className = 'theme-btn';
    themeBtn.innerHTML = '🌙'; // Default dark theme
    document.body.appendChild(themeBtn);

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('light-theme', !prefersDark);
    themeBtn.innerHTML = prefersDark ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-theme');
      themeBtn.innerHTML = document.documentElement.classList.contains('light-theme') ? '☀️' : '🌙';
    });
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.loader?.showError(`An error occurred: ${event.error.message}`);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.loader?.showError(`Promise error: ${event.reason.message}`);
    });
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new JSONPerformanceApp();

  // Setup service worker if needed
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('ServiceWorker registration failed:', error);
    });
  }
});

// Export for potential use in console or tests
export { JSONPerformanceApp };
