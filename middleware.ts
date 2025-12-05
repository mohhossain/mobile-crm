import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',               // <--- ADD THIS: Allows the Landing Page to load
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/upload(.*)', 
  '/api/public(.*)', // Allow public API routes
  '/p(.*)',          // Public Profiles
  '/portal(.*)'      // Public Deal Portals
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}