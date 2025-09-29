import "@testing-library/jest-dom";
import React from "react";

// Certaines dépendances (comme Next.js en mode client) s'attendent à trouver React en global.
(globalThis as typeof globalThis & { React?: typeof React }).React = React;
