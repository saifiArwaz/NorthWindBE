import axios from "axios";
import logger from "./logger.utils.js";

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

export async function getSalesforceToken() {
  // Check if we have a valid cached token (valid for 1 hour and 50 minutes)
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  const loginUrl =
    process.env.SALESFORCE_LOGIN_URL ||
    "https://login.salesforce.com/services/oauth2/token";

  const params = new URLSearchParams();
  params.append("grant_type", process.env.SALESFORCE_GRANT_TYPE || "password");
  params.append("client_id", process.env.SALESFORCE_CLIENT_ID || "");
  params.append("client_secret", process.env.SALESFORCE_CLIENT_SECRET || "");
  params.append("username", process.env.SALESFORCE_USERNAME || "");
  params.append("password", process.env.SALESFORCE_PASSWORD || "");

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (process.env.SALESFORCE_TOKEN_COOKIES) {
    headers["Cookie"] = process.env.SALESFORCE_TOKEN_COOKIES;
  } else {
    headers["Cookie"] =
      "BrowserId=D6-tU2MvEfGpzjvAfQrbsQ; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0";
  }

  try {
    const response = await axios.post(loginUrl, params.toString(), { headers });

    if (response.data && response.data.access_token) {
      cachedToken = response.data.access_token;
      // Cache token for 1 hour 50 minutes (Salesforce session tokens usually last for 2 hours)
      tokenExpiryTime = Date.now() + 110 * 60 * 1000;
      return cachedToken!;
    }
    throw new Error("No access token returned from Salesforce");
  } catch (error: any) {
    logger.error(
      "Failed to fetch Salesforce OAuth token:",
      error?.response?.data || error.message,
    );
  }
}
