import nodemailer from 'nodemailer';

/**
 * Email Service using Nodemailer
 * Sends verification emails to users
 */

// Create transporter
const createTransporter = () => {
  // For development: Use Gmail or any SMTP service
  // For production: Use services like SendGrid, AWS SES, etc.
  
  const isProduction = process.env.NODE_ENV === 'production';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  
  // Determine secure mode based on port
  // Port 465 uses SSL/TLS directly, port 587 uses STARTTLS
  const useSecure = port === 465 || process.env.EMAIL_SECURE === 'true';
  
  // Base configuration
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: useSecure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Connection options to fix IPv6 issues in production
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
    // Force IPv4 to avoid IPv6 connection issues (ENETUNREACH errors)
    // This fixes the issue where production servers can't connect via IPv6
    family: 4, // Use IPv4 only (4 = IPv4, 6 = IPv6, 0 = auto)
    // TLS options
    tls: {
      rejectUnauthorized: false // Set to true in production with valid certs if needed
    }
  };

  return nodemailer.createTransport(config);
};

/**
 * Send verification email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.token - Verification token
 */
export const sendVerificationEmail = async ({ email, name, token }) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"Schemz Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Schemz Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Schemz! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with Schemz - Government Scheme Eligibility Platform.</p>
              <p>To complete your registration and start discovering eligible government schemes, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Schemz, please ignore this email.</p>
              <div class="footer">
                <p>© 2026 Schemz Platform. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send welcome email after verification
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 */
export const sendWelcomeEmail = async ({ email, name }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Schemz Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Schemz Platform! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome Aboard! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Your email has been verified successfully! You're all set to explore government schemes tailored for you.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">
                <strong>📋 Complete Your Profile</strong><br>
                Add your details to get personalized scheme recommendations
              </div>
              <div class="feature">
                <strong>🔍 Discover Schemes</strong><br>
                Browse through approved government schemes
              </div>
              <div class="feature">
                <strong>📊 View Match Scores</strong><br>
                See how well you match with each scheme
              </div>
              <div class="feature">
                <strong>🧑‍💼 Apply as Organizer</strong><br>
                Want to create schemes? Apply to become an organizer
              </div>
              
              <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy exploring! 🚀</p>
              
              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>© 2026 Schemz Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT
    });
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};
