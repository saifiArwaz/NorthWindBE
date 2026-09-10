import axios from "axios";
import logger from "./logger.utils.js";
import { formatMobileNumber } from "./fast2sms.utils.js";

export interface ParamantraLeadPayload {
  fullName?: string;
  f_name?: string;
  l_name?: string;
  emailAddress?: string;
  email?: string;
  mobileNo?: string;
  phonefax?: string;
  phone?: string;
  query?: string;
  notes?: string;
  message?: string;
  project?: string;
  projectName?: string;
  projectId?: string;
  rep_id?: string;
  channel_id?: string;
  subject?: string;
  alert_client?: string | number;
  alert_rep?: string | number;
  [key: string]: any;
}

export interface ParamantraLeadResponse {
  success: boolean;
  data?: any;
  error?: any;
}

const getParamantraApiUrl = (): string =>
  process.env.PARAMANTRA_API_URL ||
  "https://cloud.paramantra.com/paramantra/api/data/new/format/json";

const getParamantraActionOn = (): string =>
  process.env.PARAMANTRA_ACTION_ON || "wpACN";

const getParamantraApiKey = (): string =>
  process.env.PARAMANTRA_API_KEY || "Fy6HDw1DLBzIxAJJME0yCBNJqG";

const getParamantraUsername = (): string =>
  process.env.PARAMANTRA_USERNAME || "paramantra";

const getParamantraPassword = (): string =>
  process.env.PARAMANTRA_PASSWORD || "paramantra_101";

const getParamantraAuthHeader = (): string => {
  if (process.env.PARAMANTRA_AUTH) {
    return process.env.PARAMANTRA_AUTH;
  }
  const username = getParamantraUsername();
  const password = getParamantraPassword();
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
};

const getParamantraRepId = (): string =>
  process.env.PARAMANTRA_REP_ID || "Founderoffice@nwestates.in";

const getParamantraChannelId = (): string =>
  process.env.PARAMANTRA_CHANNEL_ID || "GetInTouch";

const getParamantraSubject = (): string =>
  process.env.PARAMANTRA_SUBJECT || "Lead from Website";

/**
 * Splits a full name string into first name and last name.
 */
export const splitFullName = (
  fullName?: string
): { f_name: string; l_name: string } => {
  if (!fullName) return { f_name: "", l_name: "" };
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { f_name: trimmed, l_name: "" };
  }
  return {
    f_name: trimmed.substring(0, spaceIndex).trim(),
    l_name: trimmed.substring(spaceIndex + 1).trim(),
  };
};

/**
 * Builds the form urlencoded body for the Paramantra CRM API.
 */
export const buildParamantraPayload = (
  payload: ParamantraLeadPayload | Record<string, any>
): URLSearchParams => {
  const params = new URLSearchParams();

  // Campaign / Routing headers
  params.append("rep_id", payload.rep_id || getParamantraRepId());
  params.append("channel_id", payload.channel_id || getParamantraChannelId());
  params.append("subject", payload.subject || getParamantraSubject());

  // First & Last Name
  let f_name = payload.f_name;
  let l_name = payload.l_name;
  if (!f_name && payload.fullName) {
    const split = splitFullName(payload.fullName);
    f_name = split.f_name;
    l_name = split.l_name;
  }
  params.append("f_name", f_name || "");
  params.append("l_name", l_name || "");

  // Email
  const email = payload.email || payload.emailAddress || "";
  params.append("email", email);

  // Phone / Fax (10-digit mobile number)
  const rawPhone = payload.phonefax || payload.mobileNo || payload.phone || "";
  const phonefax = rawPhone ? formatMobileNumber(String(rawPhone)) : "";
  params.append("phonefax", phonefax);

  // Notes / Query
  const notes = payload.notes || payload.query || payload.message || "";
  params.append("notes", notes);

  // Project Name
  const project = payload.project || payload.projectName || "";
  params.append("project", project);

  // Alerts
  params.append(
    "alert_client",
    payload.alert_client !== undefined ? String(payload.alert_client) : "0"
  );
  params.append(
    "alert_rep",
    payload.alert_rep !== undefined ? String(payload.alert_rep) : "0"
  );

  return params;
};

/**
 * Sends a lead / project enquiry to Paramantra CRM API.
 */
export const sendParamantraLead = async (
  payload: ParamantraLeadPayload | Record<string, any>
): Promise<ParamantraLeadResponse> => {
  try {
    const url = getParamantraApiUrl();
    const headers: Record<string, string> = {
      "ACTION-ON": getParamantraActionOn(),
      "X-API-KEY": getParamantraApiKey(),
      Authorization: getParamantraAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const bodyParams = buildParamantraPayload(payload);

    logger.info(
      `[Paramantra CRM] Submitting lead for ${payload.fullName || payload.f_name || payload.emailAddress || payload.email || payload.phonefax || "unknown"
      } (Project: "${payload.project || payload.projectName || "N/A"}")`
    );

    const response = await axios.post(url, bodyParams.toString(), {
      headers,
    });

    logger.info("[Paramantra CRM] Lead submitted successfully:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    const errorData = error?.response?.data || error.message;
    logger.error("[Paramantra CRM] Error submitting lead:", errorData);
    return {
      success: false,
      error: errorData,
    };
  }
};
