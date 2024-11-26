import { fireEvent } from '@testing-library/dom'
import '@testing-library/jest-dom'

type TestElement = {
    id: string
    content: string
    children?: TestElement[]
}

describe('DOM Performance Tests', () => {
    test('Large DOM Tree Rendering', async () => {
        // Create a large nested DOM structure
        const createNestedElements = (depth: number, breadth: number): TestElement[] => {
            if (depth === 0) return []

            return Array.from({ length: breadth }, (_, i) => ({
                id: `node-${depth}-${i}`,
                content: `Content ${depth}-${i}`,
                children: createNestedElements(depth - 1, breadth)
            }))
        }

        const tree = createNestedElements(5, 5) // 5 levels deep, 5 children each
        const startTime = performance.now()

        // Render the tree
        const container = document.createElement('div')
        const renderTree = (elements: TestElement[], parent: HTMLElement) => {
            elements.forEach(el => {
                const div = document.createElement('div')
                div.id = el.id
                div.textContent = el.content
                parent.appendChild(div)
                if (el.children) {
                    renderTree(el.children, div)
                }
            })
        }

        renderTree(tree, container)
        document.body.appendChild(container)

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(100) // Should render in under 100ms

        // Cleanup
        document.body.removeChild(container)
    })

    test('Scroll Performance', async () => {
        const container = document.createElement('div')
        container.style.height = '400px'
        container.style.overflow = 'auto'

        // Add 1000 items
        for (let i = 0; i < 1000; i++) {
            const item = document.createElement('div')
            item.textContent = `Item ${i}`
            item.style.height = '40px'
            container.appendChild(item)
        }

        document.body.appendChild(container)

        const startTime = performance.now()

        // Simulate rapid scrolling
        for (let scroll = 0; scroll < container.scrollHeight; scroll += 100) {
            container.scrollTop = scroll
            await new Promise(resolve => setTimeout(resolve, 16)) // ~60fps
        }

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(1000) // Should complete scroll in 1s

        // Cleanup
        document.body.removeChild(container)
    })

    test('Event Handler Performance', async () => {
        const button = document.createElement('button')
        let clickCount = 0

        const handler = () => {
            clickCount++
        }

        button.addEventListener('click', handler)
        document.body.appendChild(button)

        const startTime = performance.now()

        // Simulate rapid clicks
        for (let i = 0; i < 1000; i++) {
            fireEvent.click(button)
        }

        const endTime = performance.now()
        expect(endTime - startTime).toBeLessThan(100) // Should handle 1000 clicks in 100ms
        expect(clickCount).toBe(1000)

        // Cleanup
        document.body.removeChild(button)
    })

    test('Layout Thrashing Prevention', async () => {
        const elements = Array.from({ length: 100 }, () => {
            const div = document.createElement('div')
            div.style.width = '100px'
            div.style.height = '100px'
            return div
        })

        elements.forEach(el => document.body.appendChild(el))

        const startTime = performance.now()

        // Bad pattern (causes layout thrashing)
        const badPattern = () => {
            elements.forEach(el => {
                const height = el.offsetHeight // Forces layout
                el.style.height = `${height + 1}px` // Forces reflow
            })
        }

        // Good pattern (batches reads and writes)
        const goodPattern = () => {
            // Read phase
            const heights = elements.map(el => el.offsetHeight)
            // Write phase
            elements.forEach((el, i) => {
                el.style.height = `${heights[i] + 1}px`
            })
        }

        // Test both patterns
        const badStart = performance.now()
        badPattern()
        const badTime = performance.now() - badStart

        const goodStart = performance.now()
        goodPattern()
        const goodTime = performance.now() - goodStart

        expect(goodTime).toBeLessThan(badTime) // Good pattern should be faster

        // Cleanup
        elements.forEach(el => document.body.removeChild(el))
    })
}) 
