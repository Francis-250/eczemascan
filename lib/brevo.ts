type EmailMessage = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

type EmailResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

export async function sendEmail({ to, subject, html, text }: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "EczemaScan";

  if (!apiKey || !senderEmail) {
    return { success: false, error: "Email delivery is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL." };
  }
  if (!to || !subject || (!html && !text)) {
    return { success: false, error: "Email recipient, subject, and content are required." };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
      }),
    });
    if (!response.ok) {
      // Never log email bodies, verification codes, credentials, or recipient details.
      console.error("Brevo email request failed", { status: response.status });
      return { success: false, error: "Email delivery failed. Please try again later." };
    }
    const result = await response.json();
    if (typeof result.messageId !== "string" || !result.messageId) {
      return { success: false, error: "Brevo did not confirm email acceptance. Please try again later." };
    }
    return { success: true, messageId: result.messageId };
  } catch {
    return { success: false, error: "Unable to reach the email service. Please try again later." };
  }
}

export async function sendEmailOrThrow(message: EmailMessage) {
  const result = await sendEmail(message);
  if (!result.success) throw new Error(result.error);
  return result;
}
