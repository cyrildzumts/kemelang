import smtplib
from email.mime.text import MIMEText
from typing import Iterable, Optional
from django.core.mail.backends.smtp import EmailBackend
from django.core.mail.message import EmailMessage
from kemelang import settings
import logging


logger = logging.getLogger(__name__)


HOST = "localhost"
PORT = '25'







class CoreEmailBackend(EmailBackend):
    
    def open(self):
        logger.info(f"Opening CoreEmailBackend using TLS - type of SSS Context {type(self.ssl_context)} - SSL-Context : {self.ssl_context}")
        return super().open()
    
    def send_messages(self, email_messages: Iterable[EmailMessage]) -> int:
        if(self.use_tls):
            logger.info(f"CoreEmailBackend using TLS - type of SSS Context {type(self.ssl_context)} -  SSL-Context : {self.ssl_context}")
            self.connection.starttls()
        return super().send_messages(email_messages)
    
    


def sendmail():
    receivers = ['cyrildz@gmail.com']
    subject = 'Test mail'
    to = 'cyrildz@gmail.com'
    sender = 'info@kemelang.com'
    msg = MIMEText('Test is test mail')
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to
    
    message = EmailMessage(subject=subject, from_email=sender, body="Test mail CoreEmailBackend", bcc=receivers)
    with smtplib.SMTP(HOST, PORT) as server:
        try:
            server.starttls()
            server.sendmail(sender, receivers, msg.as_string())
            logger.info('Test Mail sent with Standard Python smtp')
        except Exception as e:
            logger.warn(f"Error while sending : {e}", e)
    
    logger.info(f"Sending Mail with CoreEmailBackend")
    try:
        with CoreEmailBackend(
                host=settings.EMAIL_HOST, 
                port=settings.EMAIL_PORT, 
                username=settings.EMAIL_HOST_USER,
                password=settings.EMAIL_HOST_PASSWORD,
                use_tls=settings.EMAIL_USE_TLS,
                use_ssl=settings.EMAIL_USE_SSL,
                ssl_keyfile=settings.EMAIL_SSL_KEYFILE,
                ssl_certfile=settings.EMAIL_SSL_CERTFILE
                ) as backend :
            backend.send_messages([message])
            logger.info(f"Sent Mail with CoreEmailBackend")
    except Exception as e:
        logger.warn(f"Error while sending with CoreEmailBackend : {e.getMessage()}")