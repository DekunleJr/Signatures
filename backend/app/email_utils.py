import httpx
import os
import requests
from typing import List
from pydantic import EmailStr
from .config import settings
from contextlib import asynccontextmanager

# ✅ CORRECT Zoho Mail API URL
ZOHO_API_URL = "https://mail.zoho.com/api/accounts/{}/messages"
ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token"

# Global token storage (auto-refreshes)
current_access_token = None
refresh_token = settings.zoho_refresh_token

async def refresh_zoho_token():
    """Auto-refresh token every hour"""
    global current_access_token
    if not refresh_token:
        raise Exception("ZOHO_REFRESH_TOKEN not set!")
    
    response = requests.post(ZOHO_TOKEN_URL, data={
        "grant_type": "refresh_token",
        "client_id": settings.zoho_client_id,
        "client_secret": settings.zoho_client_secret,
        "refresh_token": refresh_token
    })
    
    if response.status_code == 200:
        current_access_token = response.json()["access_token"]
        print("✅ Zoho token refreshed!")
    else:
        raise Exception(f"Token refresh failed: {response.text}")

@asynccontextmanager
async def get_valid_token():
    """Get valid token, refresh if needed"""
    global current_access_token
    if not current_access_token:
        await refresh_zoho_token()
    yield current_access_token

async def send_email_via_zoho_api(recipient_email: str, subject: str, body: str):
    """
    Sends an email using the Zoho Mail REST API (FIXED).
    """
    async with get_valid_token() as token:
        headers = {
            "Authorization": f"Zoho-oauthtoken {token}",
            "Content-Type": "application/json",
        }
        
        # ✅ CORRECT PAYLOAD FORMAT for Zoho Mail API
        payload = {
            "fromAddress": settings.mail_from,
            "toAddress": recipient_email,
            "subject": subject,
            "content": body,
            "mailFormat": "html"  # or "text"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # ✅ CORRECT URL with account ID
                url = ZOHO_API_URL.format(settings.zoho_account_id)
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return {"message": "Email sent successfully!"}
            except httpx.HTTPStatusError as e:
                print(f"Error sending email: {e.response.text}")
                raise Exception(f"Failed to send email: {e.response.text}")
            except Exception as e:
                print(f"Unexpected error: {e}")
                raise Exception(f"Unexpected error: {e}")

async def send_otp_email(recipient_email: str, otp: str):
    subject = "Password Reset OTP"
    body = f"<h2>Your OTP for password reset is: <strong>{otp}</strong></h2>"
    return await send_email_via_zoho_api(recipient_email, subject, body)

async def send_contact_email(name: str, sender_email: str, message: str):
    subject = f"Contact Form: from {name} ({sender_email})"
    body = f"""
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {sender_email}</p>
    <p><strong>Message:</strong></p>
    <p>{message}</p>
    """
    return await send_email_via_zoho_api(settings.mail_to, subject, body)

async def send_email(recipient_emails: List[EmailStr], subject: str, message: str):
    for email in recipient_emails:
        await send_email_via_zoho_api(email, subject, message)
    return {"message": "Emails sent successfully!"}

async def send_verification_email(recipient_email: str, subject: str, verification_url: str):
    body = f"""
    <h2>Verify Your Account</h2>
    <p>Please click the following link to verify your account:</p>
    <a href="{verification_url}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none;">Verify Account</a>
    """
    return await send_email_via_zoho_api(recipient_email, subject, body)

# Startup: Initialize token
async def init_zoho():
    await refresh_zoho_token()