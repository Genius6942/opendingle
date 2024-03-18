import request from "../request";

export default async function getAccessToken(code: string) {
  return await request<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }>("/oauth2/token", {
    client_id: process.env.DISCORD_OAUTH_ID!,
    client_secret: process.env.DISCORD_OAUTH_SECRET!,
    grant_type: "authorization_code",
    code,
    redirect_uri:
      process.env.MODE === "production"
        ? "https://dingle.smart09codes.repl.co/oauth"
        : "http://localhost:3000/oauth",
  });
}
