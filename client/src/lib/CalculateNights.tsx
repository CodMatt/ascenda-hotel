const calculateNights = (checkin: Date, checkout: Date) => {
        const timeDiff = checkout.getTime() - checkin.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

export default calculateNights;