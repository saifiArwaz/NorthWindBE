import axios from "axios";
import { prisma } from "../../config/prisma.config.js";
import cron from "node-cron";

const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";

export async function getValidInstagramToken(): Promise<string> {
  const tokenRow = await prisma.instagramToken.findFirst();

  if (!tokenRow) {
    throw new Error("Instagram token not initialized in DB");
  }

  const fiveDays = 5 * 24 * 60 * 60 * 1000;

  if (new Date(tokenRow.expiresAt).getTime() - Date.now() < fiveDays) {
    return await refreshInstagramToken();
  }

  return tokenRow.accessToken;
}

export async function refreshInstagramToken(): Promise<string> {
  const tokenRow = await prisma.instagramToken.findFirst();

  const { data } = await axios.get(REFRESH_URL, {
    params: {
      grant_type: "ig_refresh_token",
      access_token: tokenRow!.accessToken,
    },
  });

  const newToken = data.access_token;

  await prisma.instagramToken.update({
    where: { id: tokenRow?.id },
    data: {
      accessToken: newToken,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  return newToken;
}

cron.schedule("0 0 */30 * *", async () => {
  await refreshInstagramToken();
});
