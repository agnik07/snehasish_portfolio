import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  fallbackUsed?: boolean;
  note?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<EmailDeliveryResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Snehasish Photography" <no-reply@snehasishphotography.com>`;

  // If SMTP is configured
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      console.error("[Email Error]: Failed to deliver via SMTP:", err);
      return {
        success: false,
        note: `SMTP delivery failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // Safe fallback when SMTP credentials are not yet configured
  console.log("--------------------------------------------------");
  console.log("📧 [EMAIL NOTIFICATION SIMULATION / SECURE FALLBACK]");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------");
  console.log(text || html);
  console.log("--------------------------------------------------");

  return {
    success: true,
    fallbackUsed: true,
    note: "SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in .env. Email details were logged securely to the server terminal.",
  };
}
