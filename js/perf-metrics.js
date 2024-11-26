export class PerformanceMetricsInfo {
  constructor() {
    this.setupInfoSection();
    this.metrics = {
      totalTime: [],
      blockingEvents: [],
      maxBlocking: [],
      avgBlocking: []
    };
  }

  setupInfoSection() {
    const infoSection = document.querySelector('.info-content');
    if (!infoSection) return;

    infoSection.innerHTML = `
            <h3>Performance Metrics Live Monitor</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Total Processing Time</h4>
                    <div id="totalTimeValue">-</div>
                    <div class="metric-stats">
                        <small>Min: <span id="totalTimeMin">-</span></small>
                        <small>Max: <span id="totalTimeMax">-</span></small>
                        <small>Avg: <span id="totalTimeAvg">-</span></small>
                    </div>
                    <div class="mini-chart" id="totalTimeChart"></div>
                </div>
                
                <div class="metric-card">
                    <h4>Event Loop Blocking</h4>
                    <div id="blockingValue">-</div>
                    <div class="metric-stats">
                        <small>Blocks: <span id="blockCount">-</span></small>
                        <small>Total: <span id="totalBlocking">-</span></small>
                    </div>
                    <div class="mini-chart" id="blockingChart"></div>
                </div>
                
                <div class="metric-card">
                    <h4>Max Blocking Time</h4>
                    <div id="maxBlockingValue">-</div>
                    <div class="metric-stats">
                        <small>Threshold: 50ms</small>
                        <small>Critical: <span id="criticalBlocks">-</span></small>
                    </div>
                    <div class="mini-chart" id="maxBlockingChart"></div>
                </div>
                
                <div class="metric-card">
                    <h4>Average Blocking Time</h4>
                    <div id="avgBlockingValue">-</div>
                    <div class="metric-stats">
                        <small>Trend: <span id="blockingTrend">-</span></small>
                        <small>StdDev: <span id="blockingStdDev">-</span></small>
                    </div>
                    <div class="mini-chart" id="avgBlockingChart"></div>
                </div>
            </div>
            <div class="metrics-explanation">
                <h4>Understanding the Metrics</h4>
                <div class="metric-explain">
                    <strong>Total Time:</strong> 
                    <p>Overall time from start to finish of the operation. Includes both processing and rendering time.
                    High times (>1000ms) may indicate need for optimization.</p>
                </div>
                <div class="metric-explain">
                    <strong>Event Loop Blocking:</strong>
                    <p>Time periods when the main thread can't respond to user input.
                    More than 50ms of blocking can cause noticeable UI lag.</p>
                </div>
                <div class="metric-explain">
                    <strong>Max Blocking:</strong>
                    <p>Longest single period the main thread was blocked.
                    Spikes over 100ms require immediate attention.</p>
                </div>
                <div class="metric-explain">
                    <strong>Avg Blocking:</strong>
                    <p>Typical blocking duration. Should stay under 16ms for 60fps.
                    Rising averages indicate accumulating performance debt.</p>
                </div>
            </div>
        `;
  }

  updateMetrics(data) {
    // Update metrics arrays
    this.metrics.totalTime.push(data.totalTime);
    this.metrics.blockingEvents.push(data.blockingEvents);
    this.metrics.maxBlocking.push(data.maxBlocking);
    this.metrics.avgBlocking.push(data.avgBlocking);

    // Keep only last 10 values
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].length > 10) {
        this.metrics[key].shift();
      }
    });

    // Update DOM
    this.updateMetricDisplay('totalTimeValue', `${data.totalTime.toFixed(2)}ms`);
    this.updateMetricDisplay('blockingValue', `${data.blockingEvents} events`);
    this.updateMetricDisplay('maxBlockingValue', `${data.maxBlocking.toFixed(2)}ms`);
    this.updateMetricDisplay('avgBlockingValue', `${data.avgBlocking.toFixed(2)}ms`);

    // Update stats
    this.updateStats();
    this.updateCharts();
  }

  updateMetricDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  updateStats() {
    // Calculate statistics for total time
    const totalTimeStats = this.calculateStats(this.metrics.totalTime);
    this.updateMetricDisplay('totalTimeMin', `${totalTimeStats.min.toFixed(2)}ms`);
    this.updateMetricDisplay('totalTimeMax', `${totalTimeStats.max.toFixed(2)}ms`);
    this.updateMetricDisplay('totalTimeAvg', `${totalTimeStats.avg.toFixed(2)}ms`);

    // Calculate blocking statistics
    const blockingStats = this.calculateStats(this.metrics.blockingEvents);
    this.updateMetricDisplay('blockCount', blockingStats.total);
    this.updateMetricDisplay('totalBlocking', `${blockingStats.sum.toFixed(2)}ms`);

    // Calculate critical blocks (>50ms)
    const criticalBlocks = this.metrics.maxBlocking.filter(t => t > 50).length;
    this.updateMetricDisplay('criticalBlocks', criticalBlocks);

    // Calculate blocking trend
    const trend = this.calculateTrend(this.metrics.avgBlocking);
    this.updateMetricDisplay('blockingTrend', this.getTrendSymbol(trend));
    this.updateMetricDisplay('blockingStdDev',
      `${this.calculateStdDev(this.metrics.avgBlocking).toFixed(2)}ms`);
  }

  calculateStats(array) {
    if (!array.length) return { min: 0, max: 0, avg: 0, total: 0, sum: 0 };
    return {
      min: Math.min(...array),
      max: Math.max(...array),
      avg: array.reduce((a, b) => a + b, 0) / array.length,
      total: array.length,
      sum: array.reduce((a, b) => a + b, 0)
    };
  }

  calculateTrend(array) {
    if (array.length < 2) return 0;
    const last = array[array.length - 1];
    const prev = array[array.length - 2];
    return last - prev;
  }

  getTrendSymbol(trend) {
    if (trend > 0) return '↗️ Rising';
    if (trend < 0) return '↘️ Falling';
    return '→ Stable';
  }

  calculateStdDev(array) {
    if (array.length < 2) return 0;
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    const variance = array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  updateCharts() {
    this.updateChart('totalTimeChart', this.metrics.totalTime);
    this.updateChart('blockingChart', this.metrics.blockingEvents);
    this.updateChart('maxBlockingChart', this.metrics.maxBlocking);
    this.updateChart('avgBlockingChart', this.metrics.avgBlocking);
  }

  updateChart(id, data) {
    const element = document.getElementById(id);
    if (!element) return;

    // Clear previous chart
    element.innerHTML = '';

    // Create sparkline
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const width = element.clientWidth / data.length;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', `0 0 ${data.length} 100`);

    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = data.map((value, index) => {
      const x = index;
      const y = 100 - ((value - min) / range * 100 || 0);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'var(--accent)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');

    svg.appendChild(path);
    element.appendChild(svg);
  }
}
