// src/services/emailService.ts

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from '../models/db';
import ENV from '@src/common/constants/ENV';

/******************************************************************************
 Types and Interfaces
******************************************************************************/

export interface IGuestBookingAccess {
  id: string;
  booking_id: string;
  email: string;
  access_token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface IEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/******************************************************************************
 Database Setup for Guest Access Tokens
******************************************************************************/

export async function createGuestAccessTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS guest_booking_access (
      id VARCHAR(50) PRIMARY KEY,
      booking_id VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      access_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_guest_access_token ON guest_booking_access(access_token);
    CREATE INDEX IF NOT EXISTS idx_guest_access_booking ON guest_booking_access(booking_id);
    CREATE INDEX IF NOT EXISTS idx_guest_access_expires ON guest_booking_access(expires_at);
  `;
  
  try {
    await db.getPool().query(sql);
    console.log('✅ Guest booking access table created/verified');
  } catch (error) {
    console.error('❌ Error creating guest access table:', error);
    throw error;
  }
}

/******************************************************************************
 Email Service Class
******************************************************************************/

export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ENV.SmtpUser,
        pass: ENV.SmtpPassword,
      },
    });
    
    // Alternative configuration for custom SMTP servers:
    // this.transporter = nodemailer.createTransport({
    //   host: ENV.SmtpHost,
    //   port: ENV.SmtpPort,
    //   secure: ENV.SmtpPort === 465,
    //   auth: {
    //     user: ENV.SmtpUser,
    //     pass: ENV.SmtpPassword,
    //   },
    // } as nodemailer.TransportOptions);
  }

  /**
   * Generate secure access token for guest booking
   */
  private generateAccessToken(bookingId: string, email: string): string {
    const payload = {
      bookingId,
      email,
      purpose: 'guest_booking_access',
      timestamp: Date.now()
    };
    
    return jwt.sign(
      payload,
      ENV.JwtSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Generate secure access link for guest booking
   */
  private generateAccessLink(accessToken: string): string {
    return `${ENV.FrontendUrl}/guest-booking/${accessToken}`;
  }

  /**
   * Updated email template creation to handle both guest and user bookings
   */
  private createBookingAccessTemplate(
    bookingId: string, 
    accessLink: string, 
    customerName: string,
    bookingType: 'guest' | 'user' = 'guest',
    username?: string
  ): IEmailTemplate {
    const subject = `Access Your Booking - ${bookingId}`;
    
    // Different greeting based on booking type
    const greeting = bookingType === 'user' 
      ? `Hello ${customerName} (${username}),` 
      : `Hello ${customerName},`;
    
    const accountInfo = bookingType === 'user'
      ? `<p><strong>Account holder:</strong> ${username}</p>`
      : '';
    
    const loginReminder = bookingType === 'user'
      ? `
        <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">💡 Did you know?</h3>
          <p style="margin: 0;">Since you have an account with us, you can also view this booking by logging into your account dashboard.</p>
        </div>
      `
      : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Access</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #666; 
          }
          .warning { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .account-type {
            display: inline-block;
            background-color: ${bookingType === 'user' ? '#28a745' : '#6c757d'};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Booking Details</h1>
            <p>Booking ID: <strong>${bookingId}</strong>
              <span class="account-type">${bookingType === 'user' ? 'Account Holder' : 'Guest Booking'}</span>
            </p>
            ${accountInfo}
          </div>
          
          <div class="content">
            <p>${greeting}</p>
            
            <p>You requested access to view your booking details. Click the secure link below to access your booking information:</p>
            
            ${loginReminder}
            
            <div style="text-align: center;">
              <a href="${accessLink}" class="button">View My Booking</a>
            </div>
            
            <p>Alternatively, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${accessLink}
            </p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 24 hours for security purposes</li>
                <li>Do not share this link with others</li>
                <li>If you didn't request this access, please ignore this email</li>
                ${bookingType === 'user' ? '<li>You can also access this booking by logging into your account</li>' : ''}
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
            ${bookingType === 'user' ? '<p><a href="' + ENV.FrontendUrl + '/login">Login to your account</a></p>' : ''}
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
      Your Booking Access - ${bookingId}
      ${bookingType === 'user' ? '(Account Holder)' : '(Guest Booking)'}
      
      ${greeting}
      
      You requested access to view your booking details.
      
      Please use this secure link to access your booking: ${accessLink}
      
      ${bookingType === 'user' ? 'You can also view this booking by logging into your account at ' + ENV.FrontendUrl + '/login' : ''}
      
      IMPORTANT:
      - This link will expire in 24 hours
      - Do not share this link with others
      - If you didn't request this access, please ignore this email
      
      This is an automated message. Please do not reply.
    `;
    
    return { subject, htmlContent, textContent };
  }

  /**
   * Send booking access email to both guest and registered users
   */
  async sendBookingAccessEmail(bookingId: string, email: string): Promise<{ 
      success: boolean; 
      accessToken?: string; 
      message: string 
    }> {
      // Validate inputs first
      if (!bookingId || !email) {
        return {
          success: false,
          message: 'Booking ID and email are required'
        };
      }

      let connection;
      try {
        connection = await db.getPool().connect();
        await connection.query("BEGIN");

        // 1. Get booking info (combine both queries into one)
        const bookingInfo = await this.getBookingInfo(connection, bookingId, email);
        if (!bookingInfo) {
          await connection.query("ROLLBACK");
          return {
            success: false,
            message: 'Booking not found or email does not match our records'
          };
        }

        // 2. Get or create access token
        const { accessToken, isNewToken } = await this.getOrCreateAccessToken(
          connection, 
          bookingId, 
          email
        );

        // 3. Prepare and send email
        await this.sendAccessEmail(
          bookingInfo,
          accessToken
        );

        await connection.query("COMMIT");
        console.log("access token"+accessToken);
        return { 
          success: true, 
          accessToken,
          message: `Access email sent successfully to ${bookingInfo.bookingType === 'user' ? 
            'registered user' : 'guest'}`
        };

      } catch (error) {
        try {
          if (connection) {
            await connection.query("ROLLBACK");
          }
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
          // Continue with original error
        }

        console.error('Error sending booking access email:', error);
        return { 
          success: false, 
          message: this.getErrorMessage(error) 
        };
      } finally {
        if (connection) {
          try {
            connection.release();
          } catch (releaseError) {
            console.error('Failed to release connection:', releaseError);
          }
        }
      }
    }

// Helper methods extracted from main function
private async getBookingInfo(connection: any, bookingId: string, email: string) {
  const query = `
    SELECT 
      b.booking_id,
      COALESCE(n.first_name, c.first_name) as first_name,
      COALESCE(n.last_name, c.last_name) as last_name,
      COALESCE(n.email, c.email) as email,
      c.username,
      CASE WHEN b.user_reference IS NULL THEN 'guest' ELSE 'user' END as booking_type
    FROM booking b
    LEFT JOIN nonaccount n ON b.booking_id = n.booking_id AND b.user_reference IS NULL
    LEFT JOIN customer c ON b.user_reference = c.id AND b.user_reference IS NOT NULL
    WHERE b.booking_id = $1 
    AND (n.email = $2 OR c.email = $2)
  `;

  const result = await connection.query(query, [bookingId, email]);
  return result.rows[0] || null;
}

private async getOrCreateAccessToken(
    connection: any, 
    bookingId: string, 
    email: string
  ): Promise<{ accessToken: string; isNewToken: boolean }> {
    // Check for existing valid token
    const existingToken = await this.getValidAccessToken(connection, bookingId, email);
    if (existingToken) {
      return { accessToken: existingToken, isNewToken: false };
    }

    // Create new token
    const accessToken = this.generateAccessToken(bookingId, email);
    await this.storeAccessToken(connection, bookingId, email, accessToken);
    return { accessToken, isNewToken: true };
  }

private async getValidAccessToken(connection: any, bookingId: string, email: string) {
  const query = `
    SELECT access_token 
    FROM guest_booking_access 
    WHERE booking_id = $1 AND email = $2 AND expires_at > NOW() AND used = FALSE
    ORDER BY created_at DESC LIMIT 1
  `;
  const result = await connection.query(query, [bookingId, email]);
  return result.rows[0]?.access_token;
}

private async storeAccessToken(
  connection: any, 
  bookingId: string, 
  email: string, 
  token: string
) {
  const query = `
    INSERT INTO guest_booking_access 
    (id, booking_id, email, access_token, expires_at)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await connection.query(query, [
    `access-${Date.now()}`, 
    bookingId, 
    email, 
    token, 
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  ]);
}

private async sendAccessEmail(bookingInfo: any, accessToken: string) {
  const accessLink = this.generateAccessLink(accessToken);
  const template = this.createBookingAccessTemplate(
    bookingInfo.booking_id,
    accessLink,
    `${bookingInfo.first_name} ${bookingInfo.last_name}`,
    bookingInfo.bookingType,
    bookingInfo.username
  );

  await this.transporter.sendMail({
    from: `"Hotel Booking System" <${ENV.SmtpFrom}>`,
    to: bookingInfo.email,
    subject: template.subject,
    text: template.textContent,
    html: template.htmlContent,
  });
}

private getErrorMessage(error: any): string {
  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection lost')) {
      return 'Database connection failed. Please try again later.';
    }
    if (error.message.includes('SMTP')) {
      return 'Failed to send email. Please try again later.';
    }
  }
  return 'Failed to process your request. Please try again later.';
}

  /**
   * Enhanced token verification that works for both guest and user bookings
   */
  async verifyGuestAccessToken(accessToken: string): Promise<{ valid: boolean; bookingId?: string; email?: string; bookingType?: 'guest' | 'user'; message: string }> {
    try {
      // 1. Verify JWT token
      const decoded = jwt.verify(accessToken, ENV.JwtSecret) as any;
      
      if (decoded.purpose !== 'guest_booking_access') {
        return { valid: false, message: 'Invalid access token purpose' };
      }
      
      // 2. Check token in database
      const tokenQuery = `
        SELECT booking_id, email, expires_at, used
        FROM guest_booking_access 
        WHERE access_token = $1
      `;
      
      const result = await db.getPool().query(tokenQuery, [accessToken]);
      
      if (result.rows.length === 0) {
        return { valid: false, message: 'Access token not found' };
      }
      
      const tokenRecord = result.rows[0];
      
      // 3. Check if token is expired
      if (new Date() > new Date(tokenRecord.expires_at)) {
        return { valid: false, message: 'Access token has expired' };
      }
      
      // 4. Determine booking type by checking if user_reference exists
      const bookingTypeQuery = `
        SELECT 
          CASE 
            WHEN user_reference IS NULL THEN 'guest'
            ELSE 'user'
          END as booking_type
        FROM booking 
        WHERE booking_id = $1
      `;
      
      const bookingTypeResult = await db.getPool().query(bookingTypeQuery, [tokenRecord.booking_id]);
      const bookingType = bookingTypeResult.rows[0]?.booking_type || 'guest';
      
      return {
        valid: true,
        bookingId: tokenRecord.booking_id,
        email: tokenRecord.email,
        bookingType: bookingType as 'guest' | 'user',
        message: 'Access token is valid'
      };
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { valid: false, message: 'Access token has expired' };
      }
      
      return { valid: false, message: 'Invalid access token' };
    }
  }

  /**
   * Mark access token as used (optional)
   */
  async markTokenAsUsed(accessToken: string): Promise<void> {
    const updateQuery = `
      UPDATE guest_booking_access 
      SET used = TRUE 
      WHERE access_token = $1
    `;
    
    await db.getPool().query(updateQuery, [accessToken]);
  }

  /**
   * Cleanup expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const deleteQuery = `
      DELETE FROM guest_booking_access 
      WHERE expires_at < NOW()
    `;
    
    const result = await db.getPool().query(deleteQuery);
    return result.rowCount || 0;
  }
}

/******************************************************************************
 Export
******************************************************************************/

export const emailService = new EmailService();
export default emailService;