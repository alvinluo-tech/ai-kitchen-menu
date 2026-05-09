import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 防御性检查：cookie 总大小超过 4KB 时清理，防止 HTTP 431
  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader.length > 4096) {
    const response = NextResponse.redirect(new URL("/", request.url));
    request.cookies.getAll().forEach((cookie) => {
      response.cookies.delete(cookie.name);
    });
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
