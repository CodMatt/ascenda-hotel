import db from '../models/db';
import { INonAcct } from '@src/models/nonAcct';

const tableName = 'nonaccount';

/******************************************************************************
                                Table Syncing
******************************************************************************/

export async function sync() {
    try {
        await db.getPool().query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                booking_id VARCHAR(50) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                salutation VARCHAR(255) NOT NULL,
                email VARCHAR(50) NOT NULL,
                phone_num VARCHAR(15) NOT NULL,
                PRIMARY KEY (booking_id, last_name, first_name),
                FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Database connection failed: " + error);
        throw error;
    }
}

/******************************************************************************
                                CRUD Operations
******************************************************************************/

/**
 * Add non-account booking information
 */
export async function addNoAcctInfo(noAcctInfo: INonAcct, connection?: any) {
            const sql = `
            INSERT INTO ${tableName} 
            (booking_id, last_name, first_name, salutation, email, phone_num)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const params = [
            noAcctInfo.booking_id,
            noAcctInfo.last_name,
            noAcctInfo.first_name,
            noAcctInfo.salutation,
            noAcctInfo.email,
            noAcctInfo.phone_num
        ];
    try{
        const conn = connection || db.getPool();
        const { rows } = await conn.query(sql, params);
        console.log("rows: "+rows.length)
        return rows[0]; // Return the inserted record
    }catch(error){
        console.log(error);
        throw new Error('cannot add to database');
    }

    
}

/**
 * Get bookings by hotel ID (combining account and non-account bookings)
 */
export async function getBookingsByHotel(hotel_id: string) {
    const sql = `
        SELECT 
            b.booking_id,
            b.nights,
            b.start_date,
            b.end_date,
            b.hotel_id,
            b.msg_to_hotel,
            u.email,
            u.phone_num,
            u.first_name,
            u.last_name,
            u.salutation
        FROM booking b
        JOIN customer u ON b.user_reference = u.id
        WHERE b.hotel_id = $1

        UNION ALL

        SELECT 
            b.booking_id,
            b.nights,
            b.start_date,
            b.end_date,
            b.hotel_id,
            b.msg_to_hotel,
            n.email,
            n.phone_num,
            n.first_name,
            n.last_name,
            n.salutation
        FROM booking b
        JOIN ${tableName} n ON b.booking_id = n.booking_id
        WHERE b.hotel_id = $2

        ORDER BY start_date ASC;
    `;
    
    const { rows } = await db.getPool().query(sql, [hotel_id, hotel_id]);
    return rows;
}

export async function getGuestByBookingId(bookingId: string, connection?: any): Promise<INonAcct | null> {
    const sql = `
        SELECT * FROM ${tableName} 
        WHERE booking_id = $1
        LIMIT 1
    `;
    
    try {
        const conn = connection || db.getPool();
        const { rows } = await conn.query(sql, [bookingId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching guest by booking ID:', error);
        throw error;
    }
} 



/******************************************************************************
                                Export
******************************************************************************/

export default {
    sync,
    addNoAcctInfo,
    getBookingsByHotel,
    getGuestByBookingId
} as const;