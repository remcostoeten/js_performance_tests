import '@types/jest'
import { performance } from 'perf_hooks'

type TestNode = {
    value: number
    next?: TestNode
}

describe('Data Structure Operations', () => {
    test('Linked List Operations', () => {
        // Create a linked list
        const head: TestNode = { value: 1 }
        let current: TestNode | undefined = head

        for (let i = 2; i <= 1000; i++) {
            current.next = { value: i }
            current = current.next
        }

        // Test traversal
        const startTime = performance.now()
        let count = 0
        current = head

        while (current !== undefined) {
            count++
            current = current.next
        }

        const endTime = performance.now()
        expect(count).toBe(1000)
        expect(endTime - startTime).toBeLessThan(50)
    })

    test('Binary Search Performance', () => {
        const sortedArray = Array.from({ length: 1000000 }, (_, i) => i)

        const startTime = performance.now()
        const target = 999999

        let left = 0
        let right = sortedArray.length - 1
        let found = false

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)
            if (sortedArray[mid] === target) {
                found = true
                break
            }
            if (sortedArray[mid] < target) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }

        const endTime = performance.now()
        expect(found).toBe(true)
        expect(endTime - startTime).toBeLessThan(1)
    })
}) 
