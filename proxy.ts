import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          // Server Component — middleware handles session refresh
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/change-password",
  ];

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

 if (!user) {
  if (!isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

  const {data:profile,error} = await supabase.from("profiles").select("role").eq("id",user.id).single();

  if (error || !profile) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = profile.role;

  if (pathname === "/dashboard") {
    if (role === "buyer") {
      return NextResponse.redirect(new URL("/dashboard/buyer", request.url));
    }
    if (role === "broker") {
      return NextResponse.redirect(new URL("/dashboard/broker", request.url));
    }
  }

  if (role === "buyer" && pathname.startsWith("/dashboard/broker")) {
    return NextResponse.redirect(new URL("/dashboard/buyer", request.url));
  }
  if (role === "broker" && pathname.startsWith("/dashboard/buyer")) {
    return NextResponse.redirect(new URL("/dashboard/broker", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
