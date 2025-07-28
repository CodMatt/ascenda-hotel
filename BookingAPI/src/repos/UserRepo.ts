import { IUser } from '@src/models/User';
import { getRandomInt } from '@src/common/util/misc';
import db from '../models/db';

const tableName = "User";

/******************************************************************************
                                Syncing
******************************************************************************/

export async function sync() {
    try {
        const [result] = await db.getPool().query(`
            CREATE TABLE IF NOT EXISTS ${tableName} ( 
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255),
                password VARCHAR(255) NOT NULL, 
                last_name VARCHAR(255),
                first_name VARCHAR(255),
                salutation VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                phone_num VARCHAR (15),
                created TIMESTAMP
            )
        `);
    } catch (error) {
        console.error("database connection failed. " + error);
        throw error;
    }
}

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get one user.
 */
export async function getOne(id: string): Promise<IUser | null> {
    const [rows] : [any[], any] = await db.getPool().query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}
export async function getEmailOne(email: string): Promise<IUser | null> {
    const [rows] : [any[], any] = await db.getPool().query(
        `SELECT * FROM ${tableName} WHERE email = ?`,
        [email]
    );
    return rows[0];
}

/**
 * See if a user with the given id exists.
 */
export async function exists(id: string): Promise<boolean> {
    const [rows]: [any[], any] = await db.getPool().query(
        `SELECT id FROM ${tableName} WHERE id = ?`,
        [id]
    );
    return rows.length > 0;
}

/**
 * Get all users.
 */
export async function getAll(): Promise<IUser[]> {
    const [rows]: [any[], any] = await db.getPool().query(
        `SELECT * FROM ${tableName}`
    );
    return rows;
}

/**
 * Add one user.
 */
export async function add(user: IUser): Promise<void> {
    await db.getPool().query(
        `INSERT INTO ${tableName} (id, username, password, first_name, last_name, salutation, email, phone_num, created)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?,? )`,
        [user.id, user.username, user.password, user.first_name, user.last_name, 
         user.salutation, user.email,user.phone_num, user.created]
    );
}

/**
 * Update a user.
 */
export async function update(p0: string, user: Partial<IUser>): Promise<void> {
    const fields = Object.keys(user).map(key => `${key} = ?`).join(', ');
    const values = Object.values(user);
    const sql = 
        `UPDATE ${tableName} 
         SET ${fields}
         WHERE id = ?`;
    const [result] = await db.getPool().query(sql, [...values, p0]);
}

/**
 * Delete one user.
 */
export async function deleteOne(id: string): Promise<void> {
    await db.getPool().query(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [id]
    );
}

// **** Unit-Tests Only **** //

/**
 * Delete every user record.
 */
export async function deleteAllForTest(): Promise<void> {
    await db.getPool().query(`DELETE FROM ${tableName}`);
}

/**
 * Insert multiple users.
 */
export async function insertManyForTest(users: IUser[]): Promise<void> {
    for (const user of users) {
        await add(user);
    }
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
    sync,
    getOne,
    exists,
    getAll,
    add,
    update,
    getEmailOne,
    deleteOne,
    // Test only functions
    deleteAllForTest,
    insertManyForTest
} as const;