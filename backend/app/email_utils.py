import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from pydantic import EmailStr
from .config import settings

def send_otp_email(recipient_email: str, otp: str):
    """
    Sends an OTP to the user's email for password reset.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.mail_from
        msg['To'] = recipient_email
        msg['Subject'] = "Password Reset OTP"

        body = f"Your OTP for password reset is: {otp}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.mail_server, settings.mail_port) as server:
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.send_message(msg)
        return {"message": "OTP email sent successfully!"}
    except Exception as e:
        print(f"Error sending OTP email: {e}")
        raise Exception(f"Failed to send OTP email: {e}")


def send_contact_email(name: str, sender_email: str, message: str):
    """
    Sends a contact form email to the admin.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.mail_from
        msg['To'] = settings.mail_to  # Send to admin email, which is MAIL_TO for now
        msg['Subject'] = f"Contact Form: from {name} with email ({sender_email})"

        body = f"Name: {name}\nEmail: {sender_email}\n\nMessage:\n{message}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.mail_server, settings.mail_port) as server:
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.send_message(msg)
        return {"message": "Email sent successfully!"}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise Exception(f"Failed to send email: {e}")

async def send_email(recipient_emails: List[EmailStr], subject: str, message: str):
    """
    Sends an email to a list of recipients.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.mail_from
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        with smtplib.SMTP(settings.mail_server, settings.mail_port) as server:
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.send_message(msg, from_addr=settings.mail_from, to_addrs=recipient_emails)
        return {"message": "Emails sent successfully!"}
    except Exception as e:
        print(f"Error sending broadcast email: {e}")
        raise Exception(f"Failed to send broadcast email: {e}")

async def send_verification_email(recipient_email: str, subject: str, verification_url: str):
    """
    Sends a verification email with a confirmation link to the user.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.mail_from
        msg['To'] = recipient_email
        msg['Subject'] = subject

        body = f"Please click the following link to verify your account: {verification_url}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.mail_server, settings.mail_port) as server:
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.send_message(msg)
        return {"message": "Verification email sent successfully!"}
    except Exception as e:
        print(f"Error sending verification email: {e}")
        raise Exception(f"Failed to send verification email: {e}")
