import request from 'supertest';
import express from 'express';
import UserRoutes from '../../src/routes/UserRoutes';
import * as userRepo from '../../src/repos/UserRepo';
import bookingRepo from '../../src/repos/bookingRepo';
import * as nonAcctRepo from '../../src/repos/nonAccountRepo';
import { hashPassword } from '../../src/common/util/auth';


const app = express();
app.use(express.json());
app.use('/users', UserRoutes);

async function getAuthToken(email: string, password: string): Promise<string> {
  const loginResponse = await request(app)
    .post('/users/login')
    .send({ email, password });
  if (loginResponse.status !== 200) {
    console.error('Login failed:', loginResponse.body);
    throw new Error(`Login failed for ${email}`);
  }
  
  return loginResponse.body.token;
}

async function generateUser(){
    var testUserId = `test-user-${Date.now()}`;
    const hashedPassword = await hashPassword('correctpass');
    await userRepo.add({ // for booking with account
        id: testUserId,
        username: 'testuser',
        password: hashedPassword,
        first_name:'nabei',
        last_name:'asomth8',
        salutation:'somein',
        email: 'test@example.com',
        phone_num: '1234567890',
        created: new Date()
    })
    return testUserId;
}

async function generateBooking(account: Boolean, accountId?: string):Promise<string>{
    var testBookingId = 'test-booking-' + Date.now();
    // if the user has an accountif(accountId? === undefined){
    try{
        if(account){
        if(accountId === undefined){
            throw new Error("user needs to have an account");
        }
        await bookingRepo.createBooking({
            id: testBookingId,
            dest_id: 'dest-1',
            hotel_id: 'hotel-1',
            nights: 1,
            start_date: new Date(),
            end_date: new Date(),
            adults: 1,
            children: 0,
            user_ref: accountId,
            price: 100,
        } as any);
    }
    else{
        console.log("error is booking")
        await bookingRepo.createBooking({
            id: testBookingId,
            dest_id: 'dest-1',
            hotel_id: 'hotel-1',
            nights: 1,
            start_date: new Date(),
            end_date: new Date(),
            adults: 1,
            children: 0,
            price: 100,
        } as any);
        console.log("error is noacct")
        await generateNoAcct(testBookingId);
    }    
    return testBookingId;
    }catch(error){
        console.log("The error is: "+error);
        throw error;
    }
    
    
}

export async function generateNoAcct(testBookingId:string): Promise<void>{
    await nonAcctRepo.addNoAcctInfo({
            booking_id: testBookingId,
            first_name: 'hoie',
            last_name: 'Doe',
            salutation: 'Mr',
            email: 'john@example.com',
            phone_num: '1234567890'
        });
}

export default{
    getAuthToken,
    generateUser,
    generateBooking
}as const