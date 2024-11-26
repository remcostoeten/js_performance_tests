import { PerformanceTests } from './perf-test.js'
import { PerformanceMetricsInfo } from './perf-metrics.js'
import { IterationTests } from './itteration.js'

export class DataLoader {
  constructor() {
    this.data = null;
    this.target = document.getElementById('target');
    this.setupInputHandlers();
    this.setupButtons();
    this.setupCopyAndClear();
    this.metricsInfo = new PerformanceMetricsInfo();
  }

  setupInputHandlers() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-input`).classList.add('active');
      });
    });

    // File input handling
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => this.handleFileInput(e));

    // Drag and drop handling
    const dropZone = document.querySelector('.file-drop-zone');
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');

      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        this.handleFileInput({ target: fileInput });
      }
    });

    // Manual JSON input handling
    const validateBtn = document.getElementById('validateJson');
    validateBtn.addEventListener('click', () => this.validateManualInput());
  }

  setupCopyAndClear() {
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const text = this.target.textContent;
      navigator.clipboard.writeText(text).then(() => {
        this.showSuccess('Copied to clipboard!');
      }).catch(err => {
        this.showError('Failed to copy: ' + err.message);
      });
    });

    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.target.textContent = 'Results will appear here...';
      this.showSuccess('Output cleared');
    });
  }

  async handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        this.processInput(text, `File: ${file.name}`);
      } catch (error) {
        this.showError(`Error reading file: ${error.message}`);
      }
    }
  }

  validateManualInput() {
    const input = document.getElementById('jsonInput').value;
    if (!input.trim()) {
      this.showError('Please enter some JSON data');
      return;
    }
    this.processInput(input, 'Manual Input');
  }

  processInput(input, source) {
    try {
      this.data = JSON.parse(input);
      this.showSuccess(`✓ Valid JSON loaded from ${source}`);
      this.enableControls();
    } catch (error) {
      this.showError(`Invalid JSON: ${error.message}`);
    }
  }

  setupButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.id = 'controlPanel';

    const percentages = [
      { text: '10%', percentage: 0.1 },
      { text: '20%', percentage: 0.2 },
      { text: '50%', percentage: 0.5 }
    ];

    percentages.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.className = 'load-btn';
      button.disabled = true;
      button.onclick = () => this.loadData(btn.percentage);
      buttonContainer.appendChild(button);
    });

    const customContainer = document.createElement('div');
    customContainer.className = 'custom-container';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.max = '100';
    input.value = '30';
    input.className = 'percentage-input';
    input.disabled = true;

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Custom %';
    loadBtn.className = 'load-btn custom';
    loadBtn.disabled = true;
    loadBtn.onclick = () => this.loadData(input.value / 100);

    const stringifyBtn = document.createElement('button');
    stringifyBtn.textContent = 'Stringify All';
    stringifyBtn.className = 'load-btn stringify';
    stringifyBtn.disabled = true;
    stringifyBtn.onclick = () => this.stringifyAllData();

    const perfTestBtn = document.createElement('button');
    perfTestBtn.textContent = 'Run Performance Tests';
    perfTestBtn.className = 'load-btn performance';
    perfTestBtn.disabled = true;
    perfTestBtn.onclick = () => this.runPerformanceTests();

    const iterationTestBtn = document.createElement('button');
    iterationTestBtn.textContent = 'Run Iteration Tests';
    iterationTestBtn.className = 'load-btn iteration';
    iterationTestBtn.disabled = true;
    iterationTestBtn.onclick = () => this.runIterationTests();

    customContainer.appendChild(input);
    customContainer.appendChild(loadBtn);
    customContainer.appendChild(stringifyBtn);
    customContainer.appendChild(perfTestBtn);
    customContainer.appendChild(iterationTestBtn);
    buttonContainer.appendChild(customContainer);

    const existingPanel = document.getElementById('controlPanel');
    if (existingPanel) {
      existingPanel.replaceWith(buttonContainer);
    }
  }

  enableControls() {
    document.querySelectorAll('.load-btn, .percentage-input').forEach(el => {
      el.disabled = false;
    });
  }

  async measureEventLoopBlocking(callback) {
    return new Promise(resolve => {
      const samples = [];
      let lastCheck = performance.now();

      const check = () => {
        const now = performance.now();
        const delta = now - lastCheck;
        if (delta > 0) samples.push(delta);
        lastCheck = now;

        if (samples.length < 50) {
          requestAnimationFrame(check);
        } else {
          const maxBlocking = Math.max(...samples);
          const avgBlocking = samples.reduce((a, b) => a + b, 0) / samples.length;
          resolve({
            maxBlocking: maxBlocking.toFixed(2),
            avgBlocking: avgBlocking.toFixed(2),
            count: samples.length
          });
        }
      };

      requestAnimationFrame(check);
      callback();
    });
  }

  async loadData(percentage) {
    if (!this.data) {
      this.showError('No data loaded');
      return;
    }

    const startTime = performance.now();
    this.target.textContent = 'Processing...';

    try {
      const totalLength = this.data.length;
      const itemsToShow = Math.floor(totalLength * percentage);
      const partialData = this.data.slice(0, itemsToShow);

      const blockingMetrics = await this.measureEventLoopBlocking(() => {
        this.stringifyResult = JSON.stringify(partialData, null, 2);
      });

      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      // Update metrics visualization
      this.metricsInfo.updateMetrics({
        totalTime: parseFloat(timeTaken),
        blockingEvents: parseInt(blockingMetrics.count),
        maxBlocking: parseFloat(blockingMetrics.maxBlocking),
        avgBlocking: parseFloat(blockingMetrics.avgBlocking)
      });

      const sizeInBytes = new Blob([this.stringifyResult]).size;
      const formattedSize = sizeInBytes > 1024 * 1024
        ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(sizeInBytes / 1024).toFixed(2)} KB`;

      const report =
        `Performance Report (${(percentage * 100).toFixed(0)}% of data)\n` +
        `═══════════════════════════════\n` +
        `Items: ${itemsToShow.toLocaleString()} of ${totalLength.toLocaleString()}\n` +
        `Data Size: ${formattedSize}\n` +
        `Total Time: ${timeTaken}ms\n` +
        `Event Loop Blocking:\n` +
        `  • Max: ${blockingMetrics.maxBlocking}ms\n` +
        `  • Avg: ${blockingMetrics.avgBlocking}ms\n` +
        `═══════════════════════════════\n\n` +
        this.stringifyResult;

      this.target.textContent = report;

    } catch (error) {
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);
      this.showError(`Error processing data: ${error.message}`);
      this.target.textContent = `Error after ${timeTaken}ms: ${error.message}`;
    }
  }

  async stringifyAllData() {
    if (!this.data) {
      this.showError('Please load data first');
      return;
    }

    this.target.textContent = 'Processing full dataset...';

    setTimeout(async () => {
      const startTime = performance.now();
      let stringifiedData = '';
      let blockingMetrics;

      try {
        blockingMetrics = await this.measureEventLoopBlocking(() => {
          stringifiedData = JSON.stringify(this.data, null, 2);
        });

        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);

        // Update metrics visualization
        this.metricsInfo.updateMetrics({
          totalTime: parseFloat(timeTaken),
          blockingEvents: parseInt(blockingMetrics.count),
          maxBlocking: parseFloat(blockingMetrics.maxBlocking),
          avgBlocking: parseFloat(blockingMetrics.avgBlocking)
        });

        const sizeInBytes = new Blob([stringifiedData]).size;
        const formattedSize = sizeInBytes > 1024 * 1024
          ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
          : `${(sizeInBytes / 1024).toFixed(2)} KB`;

        const report =
          `Full Stringify Performance Report\n` +
          `═══════════════════════════════\n` +
          `Total Items: ${this.data.length.toLocaleString()}\n` +
          `Data Size: ${formattedSize}\n` +
          `Total Time: ${timeTaken}ms\n` +
          `Event Loop Blocking:\n` +
          `  • Max: ${blockingMetrics.maxBlocking}ms\n` +
          `  • Avg: ${blockingMetrics.avgBlocking}ms\n` +
          `═══════════════════════════════\n\n` +
          `Sample of stringified data (first 1000 chars):\n` +
          `${stringifiedData.slice(0, 1000)}${stringifiedData.length > 1000 ? '\n\n[... truncated ...]' : ''}`;

        this.target.textContent = report;

      } catch (error) {
        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        this.showError(`Error stringifying data: ${error.message}`);
        this.target.textContent = `Error after ${timeTaken}ms: ${error.message}`;
      }
    }, 100);
  }

  async runPerformanceTests() {
    if (!this.data) {
      this.showError('Please load data first');
      return;
    }

    this.target.textContent = 'Running comprehensive performance tests...';

    try {
      const tester = new PerformanceTests(this.data);
      const results = await tester.runAllTests();
      this.target.textContent = results;
    } catch (error) {
      this.showError(`Error running performance tests: ${error.message}`);
      this.target.textContent = `Error: ${error.message}`;
    }
  }

  async runIterationTests() {
    if (!this.data) {
      this.showError('Please load data first');
      return;
    }

    this.target.textContent = 'Running iteration performance tests...';

    try {
      const tester = new IterationTests(this.data);
      const results = await tester.runAllTests();
      this.target.textContent = results;
    } catch (error) {
      this.showError(`Error running iteration tests: ${error.message}`);
      this.target.textContent = `Error: ${error.message}`;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}
