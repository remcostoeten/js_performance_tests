export class IterationTests {
  constructor(data) {
    this.data = data;
    this.iterations = 100; // Number of times to run each test for averaging
  }

  async runAllTests() {
    const results = {
      loopTests: await this.testLoops(),
      arrayTests: await this.testArrayMethods(),
      objectTests: await this.testObjectMethods(),
      functionTests: await this.testFunctionStyles(),
      conditionalTests: await this.testConditionals()
    };

    return this.formatResults(results);
  }

  // Helper to run a test multiple times and get average
  async benchmarkFunction(fn) {
    const times = [];
    const memoryUsage = [];

    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);

      // Measure memory if available
      if (window.performance.memory) {
        memoryUsage.push(window.performance.memory.usedJSHeapSize);
      }
    }

    return {
      avgTime: times.reduce((a, b) => a + b) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      medianTime: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      memoryImpact: memoryUsage.length ?
        (memoryUsage[memoryUsage.length - 1] - memoryUsage[0]) / 1024 / 1024 :
        null
    };
  }

  async testLoops() {
    const results = {};
    const arr = this.data;

    // For loop
    results.forLoop = await this.benchmarkFunction(() => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += JSON.stringify(arr[i]).length;
      }
      return sum;
    });

    // For...of
    results.forOf = await this.benchmarkFunction(() => {
      let sum = 0;
      for (const item of arr) {
        sum += JSON.stringify(item).length;
      }
      return sum;
    });

    // For...in (not recommended for arrays but included for comparison)
    results.forIn = await this.benchmarkFunction(() => {
      let sum = 0;
      for (const index in arr) {
        sum += JSON.stringify(arr[index]).length;
      }
      return sum;
    });

    // While loop
    results.while = await this.benchmarkFunction(() => {
      let sum = 0;
      let i = 0;
      while (i < arr.length) {
        sum += JSON.stringify(arr[i]).length;
        i++;
      }
      return sum;
    });

    // Do...while
    results.doWhile = await this.benchmarkFunction(() => {
      let sum = 0;
      let i = 0;
      do {
        sum += JSON.stringify(arr[i]).length;
        i++;
      } while (i < arr.length);
      return sum;
    });

    return results;
  }

  async testArrayMethods() {
    const results = {};
    const arr = this.data;

    // forEach
    results.forEach = await this.benchmarkFunction(() => {
      let sum = 0;
      arr.forEach(item => {
        sum += JSON.stringify(item).length;
      });
      return sum;
    });

    // map
    results.map = await this.benchmarkFunction(() => {
      return arr.map(item => JSON.stringify(item).length);
    });

    // filter
    results.filter = await this.benchmarkFunction(() => {
      return arr.filter(item => JSON.stringify(item).length > 100);
    });

    // reduce
    results.reduce = await this.benchmarkFunction(() => {
      return arr.reduce((acc, item) => acc + JSON.stringify(item).length, 0);
    });

    // some
    results.some = await this.benchmarkFunction(() => {
      return arr.some(item => JSON.stringify(item).length > 100);
    });

    // every
    results.every = await this.benchmarkFunction(() => {
      return arr.every(item => JSON.stringify(item).length > 0);
    });

    // find
    results.find = await this.benchmarkFunction(() => {
      return arr.find(item => JSON.stringify(item).length > 100);
    });

    // findIndex
    results.findIndex = await this.benchmarkFunction(() => {
      return arr.findIndex(item => JSON.stringify(item).length > 100);
    });

    return results;
  }

  async testObjectMethods() {
    const results = {};
    const obj = this.data[0]; // Test with first object

    // Object.keys
    results.objectKeys = await this.benchmarkFunction(() => {
      return Object.keys(obj).map(key => obj[key]);
    });

    // Object.values
    results.objectValues = await this.benchmarkFunction(() => {
      return Object.values(obj);
    });

    // Object.entries
    results.objectEntries = await this.benchmarkFunction(() => {
      return Object.entries(obj).map(([key, value]) => value);
    });

    // Object.getOwnPropertyNames
    results.getOwnPropertyNames = await this.benchmarkFunction(() => {
      return Object.getOwnPropertyNames(obj).map(key => obj[key]);
    });

    // Reflect.ownKeys
    results.reflectOwnKeys = await this.benchmarkFunction(() => {
      return Reflect.ownKeys(obj).map(key => obj[key]);
    });

    return results;
  }

  async testFunctionStyles() {
    const results = {};
    const arr = this.data;

    // Regular function
    results.regularFunction = await this.benchmarkFunction(() => {
      return arr.map(function (item) {
        return JSON.stringify(item).length;
      });
    });

    // Arrow function
    results.arrowFunction = await this.benchmarkFunction(() => {
      return arr.map(item => JSON.stringify(item).length);
    });

    // Method shorthand
    const obj = {
      process(item) {
        return JSON.stringify(item).length;
      }
    };
    results.methodShorthand = await this.benchmarkFunction(() => {
      return arr.map(obj.process);
    });

    // Bound function
    const boundFn = function (item) {
      return JSON.stringify(item).length;
    }.bind(this);
    results.boundFunction = await this.benchmarkFunction(() => {
      return arr.map(boundFn);
    });

    return results;
  }

  async testConditionals() {
    const results = {};
    const arr = this.data;

    // If...else
    results.ifElse = await this.benchmarkFunction(() => {
      return arr.map(item => {
        const len = JSON.stringify(item).length;
        if (len > 100) {
          return 'large';
        } else if (len > 50) {
          return 'medium';
        } else {
          return 'small';
        }
      });
    });

    // Switch
    results.switch = await this.benchmarkFunction(() => {
      return arr.map(item => {
        const len = JSON.stringify(item).length;
        switch (true) {
          case len > 100:
            return 'large';
          case len > 50:
            return 'medium';
          default:
            return 'small';
        }
      });
    });

    // Ternary
    results.ternary = await this.benchmarkFunction(() => {
      return arr.map(item => {
        const len = JSON.stringify(item).length;
        return len > 100 ? 'large' : len > 50 ? 'medium' : 'small';
      });
    });

    // Object lookup
    results.objectLookup = await this.benchmarkFunction(() => {
      const lookup = {
        large: len => len > 100,
        medium: len => len > 50 && len <= 100,
        small: len => len <= 50
      };
      return arr.map(item => {
        const len = JSON.stringify(item).length;
        return Object.keys(lookup).find(key => lookup[key](len)) || 'unknown';
      });
    });

    return results;
  }

  formatResults(results) {
    return `Iteration Performance Test Results
═════════════════════════════

Loop Performance (${this.iterations} iterations each)
──────────────────────
${this.formatTestGroup(results.loopTests, 'ms')}

Array Methods
────────────
${this.formatTestGroup(results.arrayTests, 'ms')}

Object Methods
─────────────
${this.formatTestGroup(results.objectMethods, 'ms')}

Function Styles
──────────────
${this.formatTestGroup(results.functionTests, 'ms')}

Conditional Statements
────────────────────
${this.formatTestGroup(results.conditionalTests, 'ms')}

Memory Impact (if available):
${Object.entries(results).flatMap(([group, tests]) =>
      Object.entries(tests).map(([name, data]) =>
        data.memoryImpact ?
          `• ${name}: ${data.memoryImpact.toFixed(2)}MB` :
          ''
      ).filter(Boolean)
    ).join('\n')}

Note: Results are averaged over ${this.iterations} iterations.
Lower times are better. Memory impact shows heap size change.
`;
  }

  formatTestGroup(group, unit) {
    return Object.entries(group)
      .map(([name, data]) => {
        const memory = data.memoryImpact ? ` (Δ${data.memoryImpact.toFixed(2)}MB)` : '';
        return `• ${name}: ${data.avgTime.toFixed(2)}${unit} (min: ${data.minTime.toFixed(2)}${unit}, max: ${data.maxTime.toFixed(2)}${unit})${memory}`;
      })
      .join('\n');
  }
}
