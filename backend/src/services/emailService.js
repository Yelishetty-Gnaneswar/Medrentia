import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASSWORD || 'test',
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'MedRentia Healthcare'} <${process.env.FROM_EMAIL || 'noreply@medrentia.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MedRentia Email Simulated] To: ${options.email} | Subject: ${options.subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(message);
    return info;
  } catch (error) {
    console.error('[MedRentia Email Error]:', error.message);
    return { success: false, error: error.message };
  }
};
