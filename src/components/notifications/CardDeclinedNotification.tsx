import React, {useState} from 'react';

interface CardDeclinedNotificationProps {
    errorMsg: string;
}

const CardDeclinedNotification = ({errorMsg}: CardDeclinedNotificationProps) => {;

    return <h3>{errorMsg}</h3>
}

export default CardDeclinedNotification;