package com.expensetracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.client.url:http://localhost:5173}")
    private String clientUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = clientUrl + "/verify-email?token=" + token;
        String subject = "Verify your Smart Expense Tracker account";
        String content = "Hello,\n\nPlease verify your email address by clicking the link below or entering the token:\n"
                + verifyUrl + "\n\nToken: " + token + "\n\nThank you!";

        logger.info("==================================================================");
        logger.info("[EMAIL SERVICE - EMAIL VERIFICATION]");
        logger.info("To: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Verification Link: {}", verifyUrl);
        logger.info("Token: {}", token);
        logger.info("==================================================================");

        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                logger.info("Verification email sent successfully to {}", toEmail);
            } catch (Exception ex) {
                logger.warn("Failed to send verification email via SMTP: {}. Token logged above.", ex.getMessage());
            }
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = clientUrl + "/reset-password?token=" + token;
        String subject = "Password Reset Request - Smart Expense Tracker";
        String content = "Hello,\n\nYou requested a password reset. Click the link below or enter the token to reset your password:\n"
                + resetUrl + "\n\nToken: " + token + "\n\nThis token will expire in 1 hour.\n\nThank you!";

        logger.info("==================================================================");
        logger.info("[EMAIL SERVICE - PASSWORD RESET]");
        logger.info("To: {}", toEmail);
        logger.info("Subject: {}", subject);
        logger.info("Reset Link: {}", resetUrl);
        logger.info("Token: {}", token);
        logger.info("==================================================================");

        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                logger.info("Password reset email sent successfully to {}", toEmail);
            } catch (Exception ex) {
                logger.warn("Failed to send password reset email via SMTP: {}. Token logged above.", ex.getMessage());
            }
        }
    }
}
