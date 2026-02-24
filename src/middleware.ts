// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// const SESSION_KEY = process.env.SESSION_KEY;

// export function middleware(request: NextRequest) {
//   if (
//     request.nextUrl.pathname.startsWith("/_next") ||
//     request.nextUrl.pathname.startsWith("/api") ||
//     request.nextUrl.pathname.startsWith("/static") ||
//     request.nextUrl.pathname === "/favicon.ico" ||
//     request.nextUrl.pathname === "/"
//   ) {
//     return NextResponse.next();
//   }

//   const session = request.cookies.get(SESSION_KEY as string);

//   if (request.nextUrl.pathname.startsWith("/onboarding")) {
//     if (session?.value) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   if (!session?.value) {
//     return NextResponse.redirect(new URL("/onboarding", request.url));
//   }

//   const cookieStore = request.cookies;

//   cookieStore.set({
//     name: SESSION_KEY as string,
//     value: session.value,
//   });

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|api/|manifest.webmanifest|[^/]+\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|mp3|woff|woff2|ttf|otf|css|js)).*)",
//   ],
// };

export default function middleware() {}
