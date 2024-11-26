export class PerformanceTests {
  constructor(data) {
    this.data = data;
    this.results = {};
  }

  async runAllTests() {
    const allResults = {
      basic: await this.basicMetrics(),
      parsing: await this.parsingTests(),
      operations: await this.operationTests(),
      memory: await this.memoryTests(),
      search: await this.searchTests(),
      batch: await this.batchProcessingTests()
    };

    return this.formatResults(allResults);
  }

  async basicMetrics() {
    const start = performance.now();
    const metrics = {
      totalItems: this.data.length,
      deepestNesting: this.findDeepestNesting(this.data),
      averageItemSize: new Blob([JSON.stringify(this.data[0])]).size,
      dataTypes: this.analyzeDataTypes(this.data),
      totalSize: new Blob([JSON.stringify(this.data)]).size
    };
    metrics.timeToAnalyze = performance.now() - start;
    return metrics;
  }

  async parsingTests() {
    const results = {
      stringify: [],
      parse: []
    };

    const sizes = [0.1, 0.25, 0.5, 0.75, 1];
    for (const size of sizes) {
      const subset = this.data.slice(0, Math.floor(this.data.length * size));

      const stringifyStart = performance.now();
      const stringified = JSON.stringify(subset);
      results.stringify.push({
        size: `${size * 100}%`,
        time: performance.now() - stringifyStart
      });

      const parseStart = performance.now();
      JSON.parse(stringified);
      results.parse.push({
        size: `${size * 100}%`,
        time: performance.now() - parseStart
      });
    }

    return results;
  }

  async operationTests() {
    const results = {};

    const cloneStart = performance.now();
    const structuredClone = window.structuredClone(this.data.slice(0, 1000));
    results.deepClone = performance.now() - cloneStart;

    const mapStart = performance.now();
    const mapped = this.data.map(item => ({ ...item }));
    results.mapOperation = performance.now() - mapStart;

    const filterStart = performance.now();
    const filtered = this.data.filter(() => true);
    results.filterOperation = performance.now() - filterStart;

    const reduceStart = performance.now();
    const reduced = this.data.reduce((acc, curr) => {
      return acc + JSON.stringify(curr).length;
    }, 0);
    results.reduceOperation = performance.now() - reduceStart;

    return results;
  }

  async memoryTests() {
    if (!window.performance.memory) {
      return { error: 'Memory API not available' };
    }

    const results = {};
    const testSizes = [0.2, 0.4, 0.6, 0.8, 1];

    for (const size of testSizes) {
      const subset = this.data.slice(0, Math.floor(this.data.length * size));
      const beforeMem = window.performance.memory.usedJSHeapSize;

      const stringified = JSON.stringify(subset);
      JSON.parse(stringified);

      const afterMem = window.performance.memory.usedJSHeapSize;
      results[`${size * 100}%`] = {
        memoryImpact: afterMem - beforeMem,
        heapSize: afterMem,
        heapDelta: afterMem - beforeMem
      };
    }

    return results;
  }

  async searchTests() {
    const results = {};

    const sampleItem = this.data[0];
    const searchKeys = Object.keys(sampleItem);
    const searchValue = sampleItem[searchKeys[0]];

    const findStart = performance.now();
    this.data.find(item => item[searchKeys[0]] === searchValue);
    results.simpleFind = performance.now() - findStart;

    const complexStart = performance.now();
    this.data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).includes(String(searchValue))
      )
    );
    results.complexSearch = performance.now() - complexStart;

    const sortableKey = this.findSortableKey(sampleItem);
    if (sortableKey) {
      const sortedData = [...this.data].sort((a, b) =>
        a[sortableKey] < b[sortableKey] ? -1 : 1
      );
      const binaryStart = performance.now();
      this.binarySearch(sortedData, sortedData[0][sortableKey], sortableKey);
      results.binarySearch = performance.now() - binaryStart;
    }

    return results;
  }

  async batchProcessingTests() {
    const results = {};
    const batchSizes = [100, 500, 1000, 5000];

    for (const batchSize of batchSizes) {
      const start = performance.now();
      let processed = 0;

      while (processed < this.data.length) {
        const batch = this.data.slice(processed, processed + batchSize);
        JSON.parse(JSON.stringify(batch));
        processed += batchSize;
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      results[`batch_${batchSize}`] = performance.now() - start;
    }

    return results;
  }

  findDeepestNesting(obj, depth = 0) {
    if (!obj || typeof obj !== 'object') return depth;
    return Math.max(...Object.values(obj)
      .map(val => this.findDeepestNesting(val, depth + 1)));
  }

  analyzeDataTypes(data) {
    const types = new Map();
    const analyzeValue = (value) => {
      const type = typeof value;
      types.set(type, (types.get(type) || 0) + 1);
      if (type === 'object' && value) {
        Object.values(value).forEach(analyzeValue);
      }
    };
    data.forEach(analyzeValue);
    return Object.fromEntries(types);
  }

  findSortableKey(item) {
    return Object.keys(item).find(key =>
      typeof item[key] === 'number' ||
      typeof item[key] === 'string'
    );
  }

  binarySearch(arr, target, key) {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid][key] === target) return mid;
      if (arr[mid][key] < target) left = mid + 1;
      else right = mid - 1;
    }
    return -1;
  }

  formatResults(results) {
    return `Performance Test Results
═══════════════════════════════

Basic Metrics:
• Total Items: ${results.basic.totalItems.toLocaleString()}
• Deepest Nesting: ${results.basic.deepestNesting}
• Average Item Size: ${(results.basic.averageItemSize / 1024).toFixed(2)} KB
• Total Size: ${(results.basic.totalSize / (1024 * 1024)).toFixed(2)} MB
• Analysis Time: ${results.basic.timeToAnalyze.toFixed(2)}ms

Parsing Performance:
${results.parsing.stringify.map(r =>
      `• Stringify ${r.size}: ${r.time.toFixed(2)}ms`
    ).join('\n')}
${results.parsing.parse.map(r =>
      `• Parse ${r.size}: ${r.time.toFixed(2)}ms`
    ).join('\n')}

Operation Times:
• Deep Clone (1000 items): ${results.operations.deepClone.toFixed(2)}ms
• Map: ${results.operations.mapOperation.toFixed(2)}ms
• Filter: ${results.operations.filterOperation.toFixed(2)}ms
• Reduce: ${results.operations.reduceOperation.toFixed(2)}ms

Search Performance:
• Simple Find: ${results.search.simpleFind.toFixed(2)}ms
• Complex Search: ${results.search.complexSearch.toFixed(2)}ms
${results.search.binarySearch ?
        `• Binary Search: ${results.search.binarySearch.toFixed(2)}ms` :
        '• Binary Search: N/A'}

Batch Processing (Full Dataset):
${Object.entries(results.batch).map(([size, time]) =>
          `• Batch Size ${size.split('_')[1]}: ${time.toFixed(2)}ms`
        ).join('\n')}

Memory Impact:
${results.memory.error ?
        `Memory metrics not available in this browser` :
        Object.entries(results.memory).map(([size, data]) =>
          `• ${size} Load Impact: ${(data.memoryImpact / (1024 * 1024)).toFixed(2)}MB`
        ).join('\n')}
`;
  }
}
