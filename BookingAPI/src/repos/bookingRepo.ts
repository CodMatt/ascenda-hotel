import { IBookingWithContact } from '@src/models/bookingWContact';
import db from '../models/db';
import { IBooking } from '@src/models/booking';
import { atomicTransaction } from '@src/common/util/misc';
import { Client } from 'pg';

const tableName = 'booking';

/******************************************************************************
                                Table Syncing
******************************************************************************/

export async function sync() {
    try {
        await db.getPool().query(`
            CREATE TABLE IF NOT EXISTS "${tableName}" ( 
                booking_id VARCHAR(50) PRIMARY KEY,
                destination_id VARCHAR(50),
                hotel_id VARCHAR(50),
                nights INT NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                adults INT NOT NULL,
                children INT DEFAULT 0,
                msg_to_hotel TEXT,
                price DECIMAL(10, 2) NOT NULL,
                user_reference VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_reference) REFERENCES customer(id) ON DELETE CASCADE
            );

            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS update_booking_updated_at ON ${tableName};
            CREATE TRIGGER update_booking_updated_at
            BEFORE UPDATE ON ${tableName}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
    } catch (error) {
        console.error("Database connection failed: ", error);
        throw error;
    }
}

/******************************************************************************
                                CRUD Operations
******************************************************************************/

// CREATE
export async function createBooking(booking: IBooking, connection?: any) {
    const sql = `
        INSERT INTO ${tableName} 
        (booking_id, destination_id, hotel_id, nights, start_date, end_date, 
         adults, children, msg_to_hotel, price, user_reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`;
    
    const params = [
        booking.id,
        booking.dest_id,
        booking.hotel_id,
        booking.nights,
        booking.start_date,
        booking.end_date,
        booking.adults,
        booking.children || 0,
        booking.msg_to_hotel || '',
        booking.price,
        booking.user_ref === '' ? null : booking.user_ref
    ];
    
    const conn = connection || db.getPool();
    try {
        const { rows } = await conn.query(sql, params);
        console.log('✅ Query successful');
        return rows[0];
    } catch (error) {
        console.error('❌ SQL Error:', error.message);
        console.error('Failed SQL:', sql.trim());
        console.error('Failed Params:', params);
        throw error;
    }
}

// READ (by ID)
export async function getBookingById(booking_id: string) {
    const sql = `SELECT * FROM ${tableName} WHERE booking_id = $1`;
    const { rows } = await db.getPool().query(sql, [booking_id]);
    return rows[0] || undefined;
}

// READ (by User)
export async function getBookingByUser(user_ref: string) {
    const sql = `SELECT * FROM ${tableName} WHERE user_reference = $1`;
    const { rows } = await db.getPool().query(sql, [user_ref]);
    return rows;
}

// READ (all)
export async function getAllBookings() {
    const sql = `SELECT * FROM ${tableName}`;
    const { rows } = await db.getPool().query(sql);
    return rows;
}

// UPDATE
export async function updateBooking(booking_id: string, updates: Partial<IBooking>) {
    return await atomicTransaction(async (client)=>{
        const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    
        const values = Object.values(updates);
        const sql = `UPDATE ${tableName} SET ${fields} WHERE booking_id = $${values.length + 1} RETURNING *`;
        
        const { rows } = await client.query(sql, [...values, booking_id]);
        return rows[0];
    });
}

// DELETE
export async function deleteBooking(booking_id: string) {
    return await atomicTransaction(async (client)=>{
        const sql = `DELETE FROM ${tableName} WHERE booking_id = $1 RETURNING *`;
        const { rows } = await client.query(sql, [booking_id]);
        return rows[0];
    });
    
}

export async function deleteAllUserBooking(user_ref: string) {
    return await atomicTransaction(async (client)=>{
        const sql = `DELETE FROM ${tableName} WHERE user_reference = $1 RETURNING *`;
        const { rows } = await client.query(sql, [user_ref]);
        return rows;
    });
    
}


/**
 * Get booking by ID with contact information
 * Joins with customer table if user_reference is not null,
 * otherwise joins with nonaccount table
 */
export async function getBookingWithContactById(booking_id: string): Promise<IBookingWithContact | undefined> {
  const sql = `
    SELECT 
      b.booking_id,
      b.destination_id,
      b.hotel_id,
      b.nights,
      b.start_date,
      b.end_date,
      b.adults,
      b.children,
      b.msg_to_hotel,
      b.price,
      b.user_reference,
      b.created_at,
      b.updated_at,
      
      -- Contact information from customer table (if user_reference is not null)
      COALESCE(c.first_name, n.first_name) as contact_first_name,
      COALESCE(c.last_name, n.last_name) as contact_last_name,
      COALESCE(c.salutation, n.salutation) as contact_salutation,
      COALESCE(c.email, n.email) as contact_email,
      COALESCE(c.phone_num, n.phone_num) as contact_phone,
      c.username as contact_username,
      
      -- Indicate source of contact information
      CASE 
        WHEN b.user_reference IS NOT NULL THEN 'customer'
        ELSE 'nonaccount'
      END as contact_source
      
    FROM ${tableName} b
    LEFT JOIN customer c ON b.user_reference = c.id
    LEFT JOIN nonaccount n ON b.booking_id = n.booking_id AND b.user_reference IS NULL
    WHERE b.booking_id = $1
  `;
  
  try {
    const { rows } = await db.getPool().query(sql, [booking_id]);
    return rows[0] || undefined;
  } catch (error) {
    console.error('❌ Error fetching booking with contact:', error);
    throw error;
  }
}

/**
 * Get all bookings with contact information
 * Useful for admin views or reporting
 */
export async function getAllBookingsWithContact(): Promise<IBookingWithContact[]> {
  const sql = `
    SELECT 
      b.booking_id,
      b.destination_id,
      b.hotel_id,
      b.nights,
      b.start_date,
      b.end_date,
      b.adults,
      b.children,
      b.msg_to_hotel,
      b.price,
      b.user_reference,
      b.created_at,
      b.updated_at,
      
      -- Contact information
      COALESCE(c.first_name, n.first_name) as contact_first_name,
      COALESCE(c.last_name, n.last_name) as contact_last_name,
      COALESCE(c.salutation, n.salutation) as contact_salutation,
      COALESCE(c.email, n.email) as contact_email,
      COALESCE(c.phone_num, n.phone_num) as contact_phone,
      c.username as contact_username,
      
      -- Source indicator
      CASE 
        WHEN b.user_reference IS NOT NULL THEN 'customer'
        ELSE 'nonaccount'
      END as contact_source
      
    FROM ${tableName} b
    LEFT JOIN customer c ON b.user_reference = c.id
    LEFT JOIN nonaccount n ON b.booking_id = n.booking_id AND b.user_reference IS NULL
    ORDER BY b.created_at DESC
  `;
  
  try {
    const { rows } = await db.getPool().query(sql);
    return rows;
  } catch (error) {
    console.error('❌ Error fetching all bookings with contact:', error);
    throw error;
  }
}

/**
 * Get bookings with contact information by hotel ID
 * Combines both customer and non-account bookings for a specific hotel
 */
export async function getBookingsWithContactByHotel(hotel_id: string): Promise<IBookingWithContact[]> {
  const sql = `
    SELECT 
      b.booking_id,
      b.destination_id,
      b.hotel_id,
      b.nights,
      b.start_date,
      b.end_date,
      b.adults,
      b.children,
      b.msg_to_hotel,
      b.price,
      b.user_reference,
      b.created_at,
      b.updated_at,
      
      -- Contact information
      COALESCE(c.first_name, n.first_name) as contact_first_name,
      COALESCE(c.last_name, n.last_name) as contact_last_name,
      COALESCE(c.salutation, n.salutation) as contact_salutation,
      COALESCE(c.email, n.email) as contact_email,
      COALESCE(c.phone_num, n.phone_num) as contact_phone,
      c.username as contact_username,
      
      -- Source indicator
      CASE 
        WHEN b.user_reference IS NOT NULL THEN 'customer'
        ELSE 'nonaccount'
      END as contact_source
      
    FROM ${tableName} b
    LEFT JOIN customer c ON b.user_reference = c.id
    LEFT JOIN nonaccount n ON b.booking_id = n.booking_id AND b.user_reference IS NULL
    WHERE b.hotel_id = $1
    ORDER BY b.start_date ASC
  `;
  
  try {
    const { rows } = await db.getPool().query(sql, [hotel_id]);
    return rows;
  } catch (error) {
    console.error('❌ Error fetching hotel bookings with contact:', error);
    throw error;
  }
}

/**
 * Get user's bookings with contact information
 * For authenticated users to see their booking history with full details
 */
export async function getUserBookingsWithContact(user_id: string): Promise<IBookingWithContact[]> {
  const sql = `
    SELECT 
      b.booking_id,
      b.destination_id,
      b.hotel_id,
      b.nights,
      b.start_date,
      b.end_date,
      b.adults,
      b.children,
      b.msg_to_hotel,
      b.price,
      b.user_reference,
      b.created_at,
      b.updated_at,
      
      -- Contact information (will always be from customer table for this query)
      c.first_name as contact_first_name,
      c.last_name as contact_last_name,
      c.salutation as contact_salutation,
      c.email as contact_email,
      c.phone_num as contact_phone,
      c.username as contact_username,
      'customer' as contact_source
      
    FROM ${tableName} b
    INNER JOIN customer c ON b.user_reference = c.id
    WHERE b.user_reference = $1
    ORDER BY b.created_at DESC
  `;
  
  try {
    const { rows } = await db.getPool().query(sql, [user_id]);
    return rows;
  } catch (error) {
    console.error('❌ Error fetching user bookings with contact:', error);
    throw error;
  }
}


/******************************************************************************
                                Export
******************************************************************************/

export default {
    sync,
    createBooking,
    getBookingById,
    getBookingByUser,
    getAllBookings,
    updateBooking,
    deleteBooking,
    deleteAllUserBooking,
    getBookingWithContactById,
    getAllBookingsWithContact,
    getBookingsWithContactByHotel,
    getUserBookingsWithContact
    
} as const;