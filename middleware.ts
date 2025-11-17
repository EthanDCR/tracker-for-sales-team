import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all other routes
  await auth.protect();

  // If user is authenticated and not on onboarding page
  if (userId && !isOnboardingRoute(request)) {
    // Check if user exists in database
    const response = await fetch(`${request.nextUrl.origin}/api/check-user`, {
      headers: {
        'user-id': userId,
      },
    });

    if (response.ok) {
      const { exists } = await response.json();

      if (!exists) {
        // Redirect to onboarding if user doesn't exist in database
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
