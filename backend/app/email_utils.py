import httpx
import os
from typing import List
from pydantic import EmailStr
from .config import settings

# ✅ Resend API URL
RESEND_API_URL = "https://api.resend.com/emails"

# ✅ Read API Key from settings (or .env)
RESEND_API_KEY = settings.resend_api_key  # Add this field in your settings/config

# ✅ Default sender address
DEFAULT_FROM = "info@nonreply.2125signature.com"  # change this to your verified sender

async def send_email_via_resend(sender_email: str, recipient_email: str, subject: str, body: str):
    """
    Sends an email using the Resend API.
    """
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "from": sender_email,
        "to": [recipient_email],
        "subject": subject,
        "html": body,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(RESEND_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            return {"message": "Email sent successfully!"}
        except httpx.HTTPStatusError as e:
            print(f"❌ Error sending email: {e.response.text}")
            raise Exception(f"Failed to send email: {e.response.text}")
        except Exception as e:
            import traceback
            print(f"❌ Unexpected error: {e}")
            traceback.print_exc()
            raise Exception(f"Unexpected error: {e}")


# 🔹 Reuse your existing wrappers with no change to your codebase
async def send_otp_email(recipient_email: str, otp: str):
    sender_email = "support@nonreply.2125signature.com"
    subject = "Password Reset OTP"
    body = f"<h2>Your OTP for password reset is: <strong>{otp}</strong></h2>"
    return await send_email_via_resend(sender_email, recipient_email, subject, body)


async def send_contact_email(name: str, sender_email: str, message: str):
    send_email = "contact@nonreply.2125signature.com"
    subject = f"Contact Form: from {name} ({sender_email})"
    body = f"""
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {sender_email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
    """
    return await send_email_via_resend(send_email, settings.mail_to, subject, body)


async def send_email(recipient_emails: List[EmailStr], subject: str, message: str):
    for email in recipient_emails:
        send_email = DEFAULT_FROM
        await send_email_via_resend(send_email, email, subject, message)
    return {"message": "Emails sent successfully!"}


async def send_verification_email(recipient_email: str, subject: str, verification_url: str):
    sender_email = "support@nonreply.2125signature.com"
    body = f"""
    <h2>Verify Your Account</h2>
    <p>Please click the following link to verify your account:</p>
    <a href="{verification_url}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none;">Verify Account</a>
    """
    return await send_email_via_resend(sender_email, recipient_email, subject, body)
