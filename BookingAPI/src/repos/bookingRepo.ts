import db from '../models/db';
import { IBooking } from '@src/models/booking';

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
                FOREIGN KEY (user_reference) REFERENCES customer(id) ON DELETE SET NULL
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
    const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    
    const values = Object.values(updates);
    const sql = `UPDATE ${tableName} SET ${fields} WHERE booking_id = $${values.length + 1} RETURNING *`;
    
    const { rows } = await db.getPool().query(sql, [...values, booking_id]);
    return rows[0];
}

// DELETE
export async function deleteBooking(booking_id: string) {
    const sql = `DELETE FROM ${tableName} WHERE booking_id = $1 RETURNING *`;
    const { rows } = await db.getPool().query(sql, [booking_id]);
    return rows[0];
}

export async function deleteAllUserBooking(user_ref: string) {
    const sql = `DELETE FROM ${tableName} WHERE user_reference = $1 RETURNING *`;
    const { rows } = await db.getPool().query(sql, [user_ref]);
    return rows;
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
    deleteAllUserBooking
} as const;