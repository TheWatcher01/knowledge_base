// Middleware Auth.js to protect API routes

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/register"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Get the token from the request
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // If no token and trying to access a protected route, redirect to login
    if (!token) {
        const url = new URL("/login", req.url);
        return NextResponse.redirect(url);
    }

    // If token exists, allow the request
    return NextResponse.next();
}

// Apply middleware to API routes and all other routes except static files
export const config = {
    matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};