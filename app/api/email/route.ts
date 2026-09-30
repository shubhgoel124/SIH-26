import { client } from "@/lib/mail"
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    await client.send({
        from: {
            name: "Placement Cell",
            email: "cell@gmail.com"
        },
        to: [{
            name: "Student",
            email: "s@gmail.com"
        }],
        subject: "Test Email",
        text: "This is a test email from Placement Cell",
    })

    return new Response(JSON.stringify({ message: "Email sent" }), { status: 200 });
}