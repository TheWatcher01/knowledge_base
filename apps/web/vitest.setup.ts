import "@testing-library/jest-dom";
import React from "react";

// Certaines dépendances (comme Next.js en mode client) s'attendent à trouver React en global.
(globalThis as typeof globalThis & { React?: typeof React }).React = React;

class ResizeObserverMock {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element) {
        // stocke la cible pour permettre d'appeler la callback si besoin dans un test
        this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
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
