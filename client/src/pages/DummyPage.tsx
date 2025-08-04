import { useLocation, useNavigate } from "react-router-dom";

function DummyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state;

  if (!state) {
    return <div>No booking data received.</div>;
  }

    const {
    hotelId: dummyHotelId,
    destId: dummyDestId,
    key: dummyKey,
    rates: dummyRates,
    checkin: dummyDate,
    checkout: dummyDate2,
    noAdults: dummyNoAdults,
    noChildren: dummyNoChildren
    } = state;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/bookingdetails", {
      state: {
        hotelId: dummyHotelId,
        destId: dummyDestId,
        key: dummyKey,
        rates: dummyRates,
        checkin: dummyDate,
        checkout: dummyDate2,
        noAdults: dummyNoAdults,
        noChildren: dummyNoChildren
      }
    });
  };

  return (
    <div>
      <h2>Destination ID: {dummyDestId}</h2>
      <h2>Hotel ID: {dummyHotelId}</h2>
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
