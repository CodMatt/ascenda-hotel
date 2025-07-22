import { parseObject, TParseOnError } from 'jet-validators/utils';
import { isString } from 'jet-validators';
import { error } from 'console';

/**
 * userBooking
 * Booking_id
 * User_id
 */


/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_USERBOOKING_VALS =(): IUserBooking=>({
    booking_id: '',
    user_id:''
});

/******************************************************************************
                                  Types
******************************************************************************/

export interface IUserBooking{
    booking_id: string;
    user_id: string;
}


/******************************************************************************
                                  Setup
******************************************************************************/

const parseUserBooking = parseObject<IUserBooking>({
    booking_id: isString,
    user_id: isString
});

/******************************************************************************
                                 Functions
******************************************************************************/

function __new__(userBooking?: Partial<IUserBooking>):IUserBooking{
    const retVal = {... DEFAULT_USERBOOKING_VALS(),...userBooking};
    return parseUserBooking(retVal, errors =>{
        throw new Error('Setup new userBooking failed ' + JSON.stringify(errors, null, 2));
    });
}

// /******************************************************************************
//                                 Export default
// ******************************************************************************/

export default {
  new: __new__,
  test,
} as const;