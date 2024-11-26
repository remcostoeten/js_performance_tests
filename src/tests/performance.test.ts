import '@types/jest'
import { performance } from 'perf_hooks'

type LargeDataSet = {
    id: number
    name: string
    value: number
    nested: {
        field1: string
        field2: number[]
    }
}[]

// Helper to generate large test data
function generateLargeDataSet(size: number): LargeDataSet {
    return Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        nested: {
            field1: `Nested ${i}`,
            field2: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
        }
    }))
}

describe('Performance Tests', () => {
    const largeDataSet = generateLargeDataSet(10000)

    test('Array.filter performance', () => {
        const startTime = performance.now()

        const filtered = largeDataSet.filter(item => item.value > 500)

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(50) // Should complete in under 50ms
        expect(filtered.length).toBeGreaterThan(0)
    })

    test('Array.reduce with complex computation', () => {
        const startTime = performance.now()

        const result = largeDataSet.reduce((acc, item) => {
            return acc + item.nested.field2.reduce((sum, num) => sum + num, 0)
        }, 0)

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(100)
        expect(result).toBeGreaterThan(0)
    })

    test('Array.sort performance', () => {
        const startTime = performance.now()

        const sorted = [...largeDataSet].sort((a, b) =>
            b.nested.field2.length - a.nested.field2.length
        )

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(150)
        expect(sorted[0].nested.field2.length).toBeGreaterThanOrEqual(sorted[sorted.length - 1].nested.field2.length)
    })
}) 
