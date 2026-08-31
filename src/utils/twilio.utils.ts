import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export const formatPhoneNumber = (phone: string): string => {
  const trimmed = phone.trim().replace(/[\s-]/g, "");
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  // Default to +91 if 10-digit Indian mobile number
  if (trimmed.length === 10) {
    return `+91${trimmed}`;
  }
  return `+${trimmed}`;
};

export const sendVerifyOtp = async (to: string) => {
  const formattedTo = formatPhoneNumber(to);
  if (!verifyServiceSid) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured in .env");
  }
  const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
    to: formattedTo,
    channel: "sms",
  });
  console.log(`[Twilio Verify] Sent OTP to ${formattedTo}. Status: ${verification.status}`);
  return verification;
};

export const checkVerifyOtp = async (to: string, code: string): Promise<boolean> => {
  const formattedTo = formatPhoneNumber(to);
  if (!verifyServiceSid) {
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured in .env");
  }
  const verificationCheck = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
    to: formattedTo,
    code,
  });
  return verificationCheck.status === "approved";
};

export const sendSms = async (to: string, message: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedTo,
    });
    console.log("SMS sent successfully to " + formattedTo + ". Message SID: " + response.sid);
    return response;
  } catch (error) {
    console.error("Failed to send SMS to " + to + ":", error);
    throw error;
  }
};
