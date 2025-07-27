
import React, {useState} from 'react';

interface BookingDetails{
    hotelName: string;
    hotelAddr: String;
    rates: number;
    checkin: Date;
    checkout: Date;
    noAdults: number;
    noChildren: number;

    
}


const BookingDetails = (bookingdetails: BookingDetails) => {;

    

    return (
        <table border={1}>
        <tbody>
            <tr>
            <td>Hotel Name: </td><td>{bookingdetails.hotelName}</td>
            </tr>
            <tr>
            <td>Hotel Address: </td><td>{bookingdetails.hotelAddr}</td>
            </tr>
            <tr>
            <td>Room per-night Rate: </td><td>{bookingdetails.rates}</td>
            </tr>
            <tr>
            <td>Check-in Date: </td><td>{bookingdetails.checkin.toDateString()}</td>
            </tr>
            <tr>
            <td>Check-out Date: </td><td>{bookingdetails.checkout.toDateString()}</td>
            </tr>
            <tr>
            <td>No. Adults: </td><td>{bookingdetails.noAdults}</td>
            </tr>
            <tr>
            <td>No. Children: </td><td>{bookingdetails.noChildren}</td>
            </tr>
        </tbody>
    </table>)
}

export default BookingDetails;