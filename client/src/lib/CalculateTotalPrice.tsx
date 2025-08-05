import calculateNights from "./CalculateNights";

const calculateTotalPrice = (rates: number, checkin: Date, checkout: Date, type: string) => {
    if (type === "cents") {
        return rates * calculateNights(checkin, checkout) * 100;
    }   else { // default to dollars
    return rates * calculateNights(checkin, checkout);
    }
};

export default calculateTotalPrice;
