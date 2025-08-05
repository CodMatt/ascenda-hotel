

interface CardDeclinedNotificationProps {
    errorMsg: string;
}

const CardDeclinedNotification = ({errorMsg}: CardDeclinedNotificationProps) => {;

    return <h3><strong>Card Declined</strong> - {errorMsg}</h3>
}

export default CardDeclinedNotification;