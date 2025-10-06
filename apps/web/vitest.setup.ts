import "@testing-library/jest-dom";
import React from "react";

// Certaines dépendances (comme Next.js en mode client) s'attendent à trouver React en global.
(globalThis as typeof globalThis & { React?: typeof React }).React = React;

class ResizeObserverMock {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element) {
        const width = (target as HTMLElement).clientWidth ?? 0;
        const height = (target as HTMLElement).clientHeight ?? 0;
        const contentRect = {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: height,
            right: width,
            width,
            height,
            toJSON() {
                return { x: this.x, y: this.y, top: this.top, left: this.left, bottom: this.bottom, right: this.right, width: this.width, height: this.height };
            },
        } satisfies DOMRectReadOnly;

        const entry = {
            target,
            contentRect: contentRect as DOMRectReadOnly,
            borderBoxSize: [] as unknown as ResizeObserverSize[],
            contentBoxSize: [] as unknown as ResizeObserverSize[],
            devicePixelContentBoxSize: [] as unknown as ResizeObserverSize[],
        } as ResizeObserverEntry;

        this.callback([entry], this as unknown as ResizeObserver);
        // noop pour le reste
    }

    unobserve() {
        // noop
    }

    disconnect() {
        // noop
    }
}

if (typeof (globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver === "undefined") {
    (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
        ResizeObserverMock as unknown as typeof ResizeObserver;
}
