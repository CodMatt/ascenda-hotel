import { useLocation, useNavigate } from "react-router-dom";

function DummyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state;

  if (!state) {
    return <div>No booking data received.</div>;
  }

    const {
    id: dummyid,
    destId: dummyDestId,
    hotelName: dummyHotelName,
    hotelAddress: dummyHotelAddress,
    key: dummyKey,
    rates: dummyRates,
    checkin: dummyDate,
    checkout: dummyDate2,
    noAdults: dummyNoAdults,
    noChildren: dummyNoChildren,
    roomType: dummyRoomType,
    userRef: dummyUserRef
    } = state;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/bookingdetails", {
      state: {
        id: dummyid,
        destId: dummyDestId,
        hotelName: dummyHotelName,
        hotelAddress: dummyHotelAddress,
        key: dummyKey,
        rates: dummyRates,
        checkin: dummyDate,
        checkout: dummyDate2,
        noAdults: dummyNoAdults,
        noChildren: dummyNoChildren,
        roomType: dummyRoomType,
        userRef: dummyUserRef
      }
    });
  };

  return (
  <div>
    <h2>Destination ID: {dummyDestId}</h2>
    <h2>Hotel ID: {dummyid}</h2>
    <h2>Hotel Name: {dummyHotelName}</h2>
    <h2>Hotel Address: {dummyHotelAddress}</h2>
    <h2>Room Type: {dummyRoomType}</h2>
    <h2>User Reference: {dummyUserRef}</h2>
    <h2>
      From: {dummyDate ? new Date(dummyDate).toDateString() : "?"}{" "}
      To: {dummyDate2 ? new Date(dummyDate2).toDateString() : "?"}
    </h2>
    <h2>
      Number of guests: {dummyNoAdults} adults | {dummyNoChildren} children
    </h2>
    <h2>Per night: ${dummyRates}</h2>
    <h2>Key: {dummyKey}</h2>

    <form onSubmit={handleSubmit}>
      <button>Confirm</button>
    </form>
  </div>
);
}

export default DummyPage;
