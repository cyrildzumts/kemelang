import smtplib
from email.mime.text import MIMEText
from kemelang import settings
import logging


logger = logging.getLogger(__name__)


HOST = "localhost"
PORT = '25'


def sendmail():
    receivers = ['cyrildz@gmail.com']
    subject = 'Test mail'
    to = 'cyrildz@gmail.com'
    sender = 'info@kemelang.com'
    msg = MIMEText('Test is test mail')
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to
    
    with smtplib.SMTP(HOST, PORT) as server:
        try:
            server.starttls()
            server.sendmail(sender, receivers, msg.as_string())
            logger.info('Test Mail sent')
        except Exception as e:
            logger.warn(f"Error while sending : {e}", e)
