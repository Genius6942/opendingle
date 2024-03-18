import request from "../request";

export default async function refreshToken(token: string) {
  return await request<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }>("/oauth2/token", {
    client_id: process.env.DISCORD_OAUTH_ID!,
    client_secret: process.env.DISCORD_OAUTH_SECRET!,
    grant_type: "refresh_token",
    refresh_token: token,
  });
}
