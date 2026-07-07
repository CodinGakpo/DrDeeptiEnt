import os
import subprocess
from dotenv import load_dotenv

load_dotenv("whatsapp-bot/.env")

sam_cmd = r"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd"

args = [
    sam_cmd,
    "deploy",
    "--stack-name", "whatsapp-bot",
    "--resolve-s3",
    "--capabilities", "CAPABILITY_IAM",
    "--parameter-overrides",
    f"WhatsAppVerifyToken={os.environ.get('WHATSAPP_VERIFY_TOKEN')}",
    f"WhatsAppAccessToken={os.environ.get('WHATSAPP_ACCESS_TOKEN')}",
    f"WhatsAppPhoneNumberId={os.environ.get('WHATSAPP_PHONE_NUMBER_ID')}",
    f"MetaAppSecret={os.environ.get('META_APP_SECRET')}",
    f"StaffWhatsAppNumber={os.environ.get('STAFF_WHATSAPP_NUMBER')}",
    f"DatabaseUrl={os.environ.get('NEON_CONNECTION_STRING')}",
]

print("Running deployment...")
subprocess.run(args, check=True)
