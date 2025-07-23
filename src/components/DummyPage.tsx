import { useNavigate } from "react-router-dom";
import React, {useState} from 'react';



function Booking(){

    const navigate = useNavigate();

    // FOR TESTING
    const dummyHotelId = "dummyHotelId"
    const dummyDestId = "dummyDestId";
    const dummyKey = "dummyKey";
    const dummyRates = 105.20;
    const dummyNoAdults = 2;
    const dummyNoChildren = 2;
    const dummyDate = new Date();
    const dummyDate2 = new Date();
    dummyDate2.setDate(dummyDate2.getDate() + 5);

    const [authToken, setAuthToken] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [salutation, setSalutation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');


    const testRegisterAccount = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthToken("abcdefghijklm123");
        setFirstName("Bugger");
        setLastName("Smith");
        setSalutation("They");
        setPhoneNumber("12341234");
        setEmailAddress("abc@gmail.com");
    }

    const unsetAccount = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthToken('');
        setFirstName('');
        setLastName('');
        setSalutation('');
        setPhoneNumber('');
        setEmailAddress('');
    }


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate("/bookingdetails", 
            {state: {
                hotelId: dummyHotelId,
                destId: dummyDestId, 
                key: dummyKey,
                rates: dummyRates,
                checkin: dummyDate,
                checkout: dummyDate2,
                noAdults: dummyNoAdults,
                noChildren: dummyNoChildren,
                firstName: firstName,
                authToken: authToken,
                lastName: lastName,
                salutation: salutation,
                phoneNumber: phoneNumber,
                emailAddress: emailAddress,
            }});
    }
    

    return (
        <div>
        <h2>Destination ID: {dummyDestId}</h2>
        <h2>Hotel ID: {dummyHotelId}</h2>
        <h2>From: {dummyDate.toDateString()} To: {dummyDate2.toDateString()}</h2>
        <h2>Number of guests: {dummyNoAdults} adults | {dummyNoChildren} children</h2>
        <h2>Per night: ${dummyRates}</h2>
        
        {authToken?(
            <table border={1}>
        <tbody>
            <tr>
            <td>Name: </td><td>{firstName} {lastName}</td>
            </tr>
            <tr>
            <td>Salutation: </td><td>{salutation}</td>
            </tr>
            <tr>
            <td>Phone Number: </td><td>{phoneNumber}</td>
            </tr>
            <tr>
            <td>Email Address: </td><td>{emailAddress}</td>
            </tr>
            
        </tbody>
        </table>
        ) : (
            <h2>No account</h2>
        )}

        
        <form onSubmit = {testRegisterAccount}>
            <button>
                Log in Account
            </button>
        </form>

        <form onSubmit = {unsetAccount}>
            <button>
                No Account
            </button>
        </form>
        

        <br/>

        <form onSubmit = {handleSubmit}>
            <button>
                Confirm
            </button>
        </form>

        

        </div>
    );
}

export default Booking;