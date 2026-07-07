import os
from dotenv import load_dotenv

load_dotenv("whatsapp-bot/.env")

verify = os.environ.get('WHATSAPP_VERIFY_TOKEN')
access = os.environ.get('WHATSAPP_ACCESS_TOKEN')
phone_id = os.environ.get('WHATSAPP_PHONE_NUMBER_ID')
secret = os.environ.get('META_APP_SECRET')
staff = os.environ.get('STAFF_WHATSAPP_NUMBER')
db = os.environ.get('NEON_CONNECTION_STRING')

# In TOML, backslashes and quotes must be escaped. We wrap the override string in double quotes, 
# and the inner key=value strings don't necessarily need quotes unless they contain spaces, 
# but if they contain special characters we must quote them. 
# The easiest way for SAM parameter overrides in samconfig.toml is:
# parameter_overrides = "Key1=\"Value1\" Key2=\"Value2\""

overrides = f'WhatsAppVerifyToken="{verify}" WhatsAppAccessToken="{access}" WhatsAppPhoneNumberId="{phone_id}" MetaAppSecret="{secret}" StaffWhatsAppNumber="{staff}" DatabaseUrl="{db}"'

toml = f"""version = 0.1
[default.deploy.parameters]
stack_name = "whatsapp-bot"
resolve_s3 = true
capabilities = "CAPABILITY_IAM"
parameter_overrides = '{overrides}'
"""

with open("samconfig.toml", "w", encoding="utf-8") as f:
    f.write(toml)
