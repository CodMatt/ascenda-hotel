import { isNull, isNumber, isString } from 'jet-validators';
import { parseObject, TParseOnError } from 'jet-validators/utils';

import { isRelationalKey, transIsDate } from '@src/common/util/validators';
import { IModel } from './common/types';


/******************************************************************************
                                 Constants
******************************************************************************/

const isStringOrNull = (value: unknown): value is string | null => 
  typeof value === 'string' || value === null;

const DEFAULT_USER_VALS = (): IBooking => ({
  id:'',
  dest_id: '',
  hotel_id: '',
  nights: 0,
  start_date: new Date(),
  end_date: new Date(),
  adults:0,
  children: 0,
  msg_to_hotel: '',
  user_ref: null,
  price: 0,
  created: new Date(),
  updated_at: new Date()
});


/******************************************************************************
                                  Types
******************************************************************************/

export interface IBooking extends IModel {
  dest_id: string;
  hotel_id: string;
  nights: number;
  start_date: Date;
  end_date: Date;
  adults: number;
  children: number;
  msg_to_hotel: string;
  user_ref: string|null;
  price: number;
  updated_at: Date;

}


/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parsebooking" function
const parseBooking = parseObject<IBooking>({
  id: isString,
  dest_id: isString,
  hotel_id: isString,
  nights: isNumber,
  start_date: transIsDate,
  end_date: transIsDate,
  adults: isNumber,
  children: isNumber,
  msg_to_hotel: isString,
  user_ref: isStringOrNull,
  price: isNumber,
  created: transIsDate,
  updated_at: transIsDate
});


/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New user object.
 */
function __new__(booking?: Partial<IBooking>): IBooking {
  const retVal = { ...DEFAULT_USER_VALS(), ...booking };
  return parseBooking(retVal, errors => {
    throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check is a user object. For the route validation.
 */
function test(arg: unknown, errCb?: TParseOnError): arg is IBooking {
  return !!parseBooking(arg, errCb);
}


/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: __new__,
  test,
} as const;