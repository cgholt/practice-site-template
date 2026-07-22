import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "OAuth not configured" }, { status: 500 });
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/callback`;
  const scope = "repo,user";

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);

  return NextResponse.redirect(authUrl.toString());
}
