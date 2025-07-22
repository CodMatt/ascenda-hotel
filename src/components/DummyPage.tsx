import { useNavigate } from "react-router-dom";




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
                noChildren: dummyNoChildren}});
    }

    return (
        <div>
        <h2>Destination ID: {dummyDestId}</h2>
        <h2>Hotel ID: {dummyHotelId}</h2>
        <h2>From: {dummyDate.toDateString()} To: {dummyDate2.toDateString()}</h2>
        <h2>Number of guests: {dummyNoAdults} adults | {dummyNoChildren} children</h2>
        <h2>Per night: ${dummyRates}</h2>
        
        <form onSubmit = {handleSubmit}>
            <button>
                Confirm
            </button>
        </form>
        </div>
    );
}

export default Booking;