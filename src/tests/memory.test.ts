import '@types/jest'
import '@types/node'

declare global {
    var gc: () => void
}

type MemoryTestData = {
    key: string
    value: number
    timestamp: number
}

describe('Memory Management Tests', () => {
    test('Large object creation and deletion', () => {
        const initialMemory = process.memoryUsage().heapUsed

        let largeArray: MemoryTestData[] = []

        // Create large array of objects
        for (let i = 0; i < 100000; i++) {
            largeArray.push({
                key: `key-${i}`,
                value: Math.random(),
                timestamp: Date.now()
            })
        }

        const afterCreationMemory = process.memoryUsage().heapUsed
        expect(afterCreationMemory).toBeGreaterThan(initialMemory)

        // Clear the array
        largeArray = []
        global.gc && global.gc() // Force garbage collection if available

        const finalMemory = process.memoryUsage().heapUsed
        expect(finalMemory).toBeLessThan(afterCreationMemory)
    })
}) 
