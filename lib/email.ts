export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  // Email sending implementation - using a mock for now
  // In production, integrate with Brevo, SendGrid, or similar
  console.log(`Sending email to ${to}: ${subject}`);
  if (text) console.log(`Text: ${text}`);
  if (html) console.log(`HTML: ${html}`);
  return { success: true };
}

export async function sendEmailOrThrow({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  const result = await sendEmail({ to, subject, html, text });
  if (!result.success) {
    throw new Error("Failed to send email");
  }
  return result;
}