import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import logger from "./logger.utils.js";

// Initialize transporter using SMTP config from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>
) => {
    try {
        const templatePath = path.join(process.cwd(), "src", "templates", "emails", `${templateName}.ejs`);
        const htmlContent = await ejs.renderFile(templatePath, templateData);

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error("Error sending email:", error);
    }
};
