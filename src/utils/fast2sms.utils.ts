import axios from "axios";

const getFast2SmsApiKey = () =>
  process.env.FAST2SMS_AUTHORIZATION ||
  "3fVPiDjcM25zB9SsQhaNRdC4ETgAxeZnH8L7qlK1pJUYWtIvwu9VhlOzw106TSaPKgfipLNWRnY2tcAF";

const getFast2SmsMessageId = () => process.env.FAST2SMS_MESSAGE_ID || "31330";

const getFast2SmsPhoneNumberId = () =>
  process.env.FAST2SMS_PHONE_NUMBER_ID || "1111178612068097";

export const formatMobileNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.slice(2);
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return cleaned.slice(1);
  }
  return cleaned;
};

export const sendWhatsappOtp = async (to: string, otp: string) => {
  try {
    const formattedNumber = formatMobileNumber(to);
    const authorization = getFast2SmsApiKey();
    const messageId = getFast2SmsMessageId();
    const phoneNumberId = getFast2SmsPhoneNumberId();

    const response = await axios.get("https://www.fast2sms.com/dev/whatsapp", {
      params: {
        authorization,
        message_id: messageId,
        phone_number_id: phoneNumberId,
        numbers: formattedNumber,
        variables_values: otp,
      },
    });

    console.log(
      `[Fast2SMS WhatsApp] Sent OTP to ${formattedNumber}. Response:`,
      response.data,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `[Fast2SMS WhatsApp] Failed to send OTP to ${to}:`,
      error?.response?.data || error.message,
    );
    throw error;
  }
};
