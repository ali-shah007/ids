// src/components/EmailAlertSender.js
import emailjs from "emailjs-com";

/**
 * Sends an email alert using EmailJS.
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.message - Email message body
 * @param {string} params.snapshot - Base64 snapshot image
 * @returns {Promise}
 */
const sendEmailAlert = async ({ toEmail, subject, message, snapshot }) => {
  const templateParams = {
    user_email: toEmail,
    subject,
    message,

  };

  return emailjs.send(
    "service_gfau2la",    // replace with your EmailJS service ID
    "template_p9f81br",   // replace with your EmailJS template ID
    templateParams,
    "rPNBd7-mXA-ZK2mlD"     // replace with your EmailJS public key
  );
};

export default sendEmailAlert;
