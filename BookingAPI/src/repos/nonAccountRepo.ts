import { table } from 'console';
import db from '../models/db';
import nonAcct, { INonAcct } from '@src/models/nonAcct';

const tableName = 'nonAccount';

export async function sync(){
    try{
        await db.getPool().query(`
            CREATE TABLE IF NOT EXISTS ${tableName}(
                    booking_id VARCHAR(50) NOT NULL,
                    last_name VARCHAR(255) NOT NULL,
                    first_name VARCHAR(255) NOT NULL,
                    salutation VARCHAR(255) NOT NULL,
                    email varchar(50) NOT NULL,
                    phone_num varchar(15) NOT NULL,
                    PRIMARY KEY (booking_id, last_name, first_name),
                    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) on DELETE CASCADE
            )
            `);
    }
    catch(error){
        console.error("database connection failed. "+ error);
        throw error;
    }
}

// Create
export async function addNoAcctInfo(noAcctInfo: INonAcct, connection?: any) {
    const sql = `
        INSERT INTO nonAccount 
        (booking_id, last_name, first_name, salutation, email, phone_num)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        noAcctInfo.booking_id,
        noAcctInfo.last_name,
        noAcctInfo.first_name,
        noAcctInfo.salutation,
        noAcctInfo.email,
        noAcctInfo.phone_num
    ];

    const conn = connection || db.getPool();
    const [result] = await conn.query(sql, params);
    return result;
}

// Get 
export async function getBookingsByHotel(hotel_id:string) {
    // redo the sql statement
    const sql = `SELECT 
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
    JOIN User u ON b.user_reference = u.id
    WHERE b.hotel_id = ?

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
    WHERE b.hotel_id = ?

    ORDER BY start_date ASC;

    `;
    const [rows]: [any[], any] = await db.getPool().query(sql, [hotel_id,hotel_id]);
    return rows
}

// Update ~ no need for now



// delete ~ no need for now