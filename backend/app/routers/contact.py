from fastapi import APIRouter, HTTPException, status
from ..schemas import ContactMessage
from ..email_utils import send_contact_email

router = APIRouter(
    prefix="/api/contact",
    tags=["Contact"]
)

@router.post("/", status_code=status.HTTP_200_OK)
async def submit_contact_form(contact_message: ContactMessage):
    try:
        await send_contact_email(
            name=contact_message.name,
            sender_email=contact_message.email,
            message=contact_message.message
        )
        return {"message": "Contact message sent successfully!"}
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send contact message: {e}"
        )
