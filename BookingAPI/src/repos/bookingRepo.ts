import db from '../models/db';
import { IBooking } from '@src/models/booking';

const tableName = 'booking';

export async function sync() {
    try {
        await db.getPool().query(`
        CREATE TABLE IF NOT EXISTS ${tableName} ( 
            booking_id VARCHAR(50) PRIMARY KEY,
            destination_id VARCHAR(50),
            hotel_id VARCHAR(50),
            nights INT NOT NULL,
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            adults INT NOT NULL,
            children INT DEFAULT 0,
            msg_to_hotel TEXT,
            price DECIMAL(10, 2) NOT NULL,
            user_reference VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_reference) REFERENCES User(id) ON DELETE CASCADE
        )
        `);
    } catch (error) {
        console.error("database connection failed. " + error);
        throw error;
    }
}

// CREATE
export async function createBooking(booking: IBooking, connection?: any) {
    const sql = `
        INSERT INTO booking 
        (booking_id, destination_id, hotel_id, nights, start_date, end_date, adults, children, msg_to_hotel, price, user_reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
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
        booking.price ,
        booking.user_ref
    ];

    if(booking.user_ref == ''){
        booking.user_ref = null;
    }

    const conn = connection || db.getPool();
    try {
    const [result] = await conn.query(sql, params);
    console.log('✅ Query successful');
    return result;
  } catch (error) {
    console.error('❌ SQL Error:', error.message);
    console.error('Failed SQL:', sql.trim());
    console.error('Failed Params:', params);
    throw error;
}
}


// READ (by ID)
export async function getBookingById(booking_id: string) {
    const sql = `SELECT * FROM ${tableName} WHERE booking_id = ?`;
    const [rows]: [any[], any] = await db.getPool().query(sql, [booking_id]);
    return rows[0] || undefined;
}

// READ (by ID)
export async function getBookingByUser(user_ref: string) {
    const sql = `SELECT * FROM ${tableName} WHERE user_reference = ?`;
    const [rows]: [any[], any] = await db.getPool().query(sql, [user_ref]);
    return rows;
}


// READ (all)
export async function getAllBookings() {
    const sql = `SELECT * FROM ${tableName}`;
    const [rows] = await db.getPool().query(sql);
    return rows;
}

// UPDATE
export async function updateBooking(booking_id: string, updates: Partial<IBooking>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE ${tableName} SET ${fields} WHERE booking_id = ?`;
    const [result] = await db.getPool().query(sql, [...values, booking_id]);
    return result;
}

// DELETE
export async function deleteBooking(booking_id: string) {
    const sql = `DELETE FROM ${tableName} WHERE booking_id = ?`;
    const [result] = await db.getPool().query(sql, [booking_id]);
    return result;
}

export async function deleteAllUserBooking(user_ref: string) {
    const sql = `DELETE FROM ${tableName} WHERE user_reference = ?`;
    const [result] = await db.getPool().query(sql, [user_ref]);
    return result;
}

export default{
    sync,
    createBooking,
    getBookingById,
    getBookingByUser,
    getAllBookings,
    updateBooking,
    deleteBooking,
    deleteAllUserBooking
}