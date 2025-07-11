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
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            adults INT NOT NULL,
            children INT DEFAULT 0,
            msg_to_hotel TEXT,
            price DECIMAL(10, 2) NOT NULL,
            booking_reference VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        `);
    } catch (error) {
        console.error("database connection failed. " + error);
        throw error;
    }
}

// CREATE
export async function createBooking(booking: IBooking) {
    const sql = `
        INSERT INTO ${tableName} 
        (booking_id, destination_id, hotel_id, nights, start_date, end_date, adults, children, msg_to_hotel, price, booking_reference)
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
        booking.children,
        booking.msg_to_hotel,
        booking.price,
        booking.booking_ref
    ];
    const [result] = await db.getPool().query(sql, params);
    return result;
}

// READ (by ID)
export async function getBookingById(booking_id: string) {
    const sql = `SELECT * FROM ${tableName} WHERE booking_id = ?`;
    const [rows]: [any[], any] = await db.getPool().query(sql, [booking_id]);
    return rows[0];
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