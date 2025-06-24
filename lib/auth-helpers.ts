import { auth } from "@/auth";

export async function getAuthStatus() {
  const session = await auth();

  return {
    session,
    isAuthenticated: !!session?.user,
    isUnauthenticated: !session?.user,
    user: session?.user || null,
  };
}
