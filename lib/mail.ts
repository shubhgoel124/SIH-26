import { MailtrapClient } from "mailtrap"

const skipEmails = process.env.SKIP_EMAILS === "true"

export const client = new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN || "",
    testInboxId: 4241427,
    sandbox: true,
})

// Email sender wrapper
export const sendEmail = async (options: {
    from: { email: string; name: string }
    to: { email: string }[]
    subject: string
    html: string
}) => {
    // Skip actual email sending if SKIP_EMAILS is true
    if (skipEmails) {
        console.log(`[DEV] Skipping email to: ${options.to.map(t => t.email).join(", ")}`)
        console.log(`[DEV] Subject: ${options.subject}`)
        return { success: true, skipped: true }
    }

    // Actually send the email - let errors propagate
    await client.send(options)
    return { success: true, skipped: false }
}