import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings

def send_contact_email(name: str, sender_email: str, message: str):
    """
    Sends a contact form email to the admin.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.mail_from
        msg['To'] = settings.mail_from  # Send to admin email, which is MAIL_FROM for now
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
