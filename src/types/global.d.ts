/// <reference types="jest" />
/// <reference types="node" />

declare module 'perf_hooks' {
    export const performance: Performance
}

declare global {
    var gc: () => void
} 
