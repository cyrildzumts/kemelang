import smtplib
from email.mime.text import MIMEText
import ssl
from typing import Iterable, Optional
from django.utils.functional import cached_property
from django.core.mail.backends.smtp import EmailBackend as DefaultEmailBackend
from django.core.mail.utils import DNS_NAME
from django.core.mail.message import EmailMessage
from kemelang import settings
import logging


logger = logging.getLogger(__name__)


HOST = "localhost"
PORT = '25'







class CoreEmailBackend(DefaultEmailBackend):
    
    def open(self):
        logger.info(f"Opening CoreEmailBackend using TLS - type of SSS Context {type(self.ssl_context)} - SSL-Context : {self.ssl_context}")
        #return super().open()
        """
        Ensure an open connection to the email server. Return whether or not a
        new connection was required (True or False) or None if an exception
        passed silently.
        """
        if self.connection:
            # Nothing to do if the connection is already open.
            return False

        # If local_hostname is not specified, socket.getfqdn() gets used.
        # For performance, we use the cached FQDN for local_hostname.
        connection_params = {'local_hostname': DNS_NAME.get_fqdn()}
        if self.timeout is not None:
            connection_params['timeout'] = self.timeout
        if self.use_ssl:
            connection_params.update({
                'keyfile': self.ssl_keyfile,
                'certfile': self.ssl_certfile,
            })
        try:
            self.connection = self.connection_class(self.host, self.port, **connection_params)

            # TLS/SSL are mutually exclusive, so only attempt TLS over
            # non-secure connections.
            if not self.use_ssl and self.use_tls:
                self.connection.starttls(keyfile=self.ssl_keyfile, certfile=self.ssl_certfile)
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except OSError:
            if not self.fail_silently:
                raise
    
    # def send_messages(self, email_messages: Iterable[EmailMessage]) -> int:
    #     if(self.use_tls):
    #         logger.info(f"CoreEmailBackend using TLS - type of SSS Context {type(self.ssl_context)} -  SSL-Context : {self.ssl_context}")
    #         self.connection.starttls()
    #     return super().send_messages(email_messages)
    


class EMailBackend(DefaultEmailBackend):
    
    @cached_property
    def ssl_context(self):
        logger.info(f"ssl_context : using TLS  - SSL-Context")
        if self.ssl_certfile or self.ssl_keyfile:
            ssl_context = ssl.SSLContext(protocol=ssl.PROTOCOL_TLS_CLIENT)
            ssl_context.load_cert_chain(self.ssl_certfile, self.ssl_keyfile)
            return ssl_context
        else:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            return ssl_context
    
    def open(self):
        logger.info(f"Opening CoreEmailBackend using TLS  - SSL-Context : {self.ssl_context}")
        return super().open()
        
    
    # def send_messages(self, email_messages: Iterable[EmailMessage]) -> int:
    #     if(self.use_tls):
    #         logger.info(f"CoreEmailBackend using TLS - type of SSS Context {type(self.ssl_context)} -  SSL-Context : {self.ssl_context}")
    #         self.connection.starttls()
    #     return super().send_messages(email_messages)
    
    


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
    # with smtplib.SMTP(HOST, PORT) as server:
    #     try:
    #         server.starttls()
    #         server.sendmail(sender, receivers, msg.as_string())
    #         logger.info('Test Mail sent with Standard Python smtp')
    #     except Exception as e:
    #         logger.warn(f"Error while sending : {e}", e)
    
    logger.info(f"Sending Mail with MailBackend CERT_KEY = {settings.EMAIL_SSL_KEYFILE}")
    try:
        with EMailBackend(
                host=settings.EMAIL_HOST, 
                port=settings.EMAIL_PORT, 
                username=settings.EMAIL_HOST_USER,
                password=settings.EMAIL_HOST_PASSWORD,
                use_tls=settings.EMAIL_USE_TLS,
                use_ssl=settings.EMAIL_USE_SSL,
                #ssl_keyfile=settings.EMAIL_SSL_KEYFILE,
                #ssl_certfile=settings.EMAIL_SSL_CERTFILE,
                ssl_keyfile=None,
                ssl_certfile=None
                ) as backend :
            backend.send_messages([message])
            logger.info(f"Sent Mail with CoreEmailBackend")
    except Exception as e:
        logger.warn(f"Error while sending with CoreEmailBackend : {e.getMessage()}")