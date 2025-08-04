import { useParams } from "react-router-dom";

export default function HotelDetailPage() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hotel Details Page</h1>
      <p>Hotel ID: {id}</p>
      {/* You can fetch hotel + room info here using this ID */}
    </div>
  );
}
