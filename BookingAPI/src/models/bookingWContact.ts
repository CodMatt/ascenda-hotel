// src/models/bookingWithContact.ts

import { isNull, isNumber, isString } from 'jet-validators';
import { parseObject, TParseOnError } from 'jet-validators/utils';
import { transIsDate } from '@src/common/util/validators';
import { IBooking } from './booking';

/******************************************************************************
 Constants
******************************************************************************/

const isStringOrNull = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

const isContactSource = (value: unknown): value is 'customer' | 'nonaccount' =>
  value === 'customer' || value === 'nonaccount';

const DEFAULT_BOOKING_WITH_CONTACT_VALS = (): IBookingWithContact => ({
  // Inherit all booking properties
  id: '',
  dest_id: '',
  hotel_id: '',
  nights: 0,
  start_date: new Date(),
  end_date: new Date(),
  adults: 0,
  children: 0,
  msg_to_hotel: '',
  user_ref: null,
  price: 0,
  created: new Date(),
  updated_at: new Date(),
  
  // Add contact information properties
  contact_first_name: '',
  contact_last_name: '',
  contact_salutation: '',
  contact_email: '',
  contact_phone: '',
  contact_username: null,
  contact_source: 'nonaccount'
});

/******************************************************************************
 Types
******************************************************************************/

export interface IBookingWithContact extends IBooking {
  // Contact information (from either customer or nonaccount table)
  contact_first_name: string;
  contact_last_name: string;
  contact_salutation: string;
  contact_email: string;
  contact_phone: string;
  contact_username?: string | null; // Only available for registered users
  contact_source: 'customer' | 'nonaccount'; // To identify source of contact info
}

/******************************************************************************
 Setup
******************************************************************************/

// Initialize the "parseBookingWithContact" function
const parseBookingWithContact = parseObject<IBookingWithContact>({
  // Existing booking validators
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
  updated_at: transIsDate,
  
  // Contact information validators
  contact_first_name: isString,
  contact_last_name: isString,
  contact_salutation: isString,
  contact_email: isString,
  contact_phone: isString,
  contact_username: isStringOrNull,
  contact_source: isContactSource
});

/******************************************************************************
 Functions
******************************************************************************/

/**
 * Create new booking with contact object.
 */
function newBookingWithContact(booking?: Partial<IBookingWithContact>): IBookingWithContact {
  const retVal = { ...DEFAULT_BOOKING_WITH_CONTACT_VALS(), ...booking };
  return parseBookingWithContact(retVal, errors => {
    throw new Error('Setup new booking with contact failed ' + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check if object is a valid IBookingWithContact. For route validation.
 */
function testBookingWithContact(arg: unknown, errCb?: TParseOnError): arg is IBookingWithContact {
  return !!parseBookingWithContact(arg, errCb);
}

/**
 * Convert a regular booking and contact info into IBookingWithContact
 */
function fromBookingAndContact(
  booking: IBooking, 
  contactInfo: {
    first_name: string;
    last_name: string;
    salutation: string;
    email: string;
    phone_num: string;
    username?: string;
  },
  source: 'customer' | 'nonaccount'
): IBookingWithContact {
  return newBookingWithContact({
    ...booking,
    contact_first_name: contactInfo.first_name,
    contact_last_name: contactInfo.last_name,
    contact_salutation: contactInfo.salutation,
    contact_email: contactInfo.email,
    contact_phone: contactInfo.phone_num,
    contact_username: contactInfo.username || null,
    contact_source: source
  });
}

/**
 * Extract just the booking part from IBookingWithContact
 */
function toBooking(bookingWithContact: IBookingWithContact): IBooking {
  const {
    contact_first_name,
    contact_last_name,
    contact_salutation,
    contact_email,
    contact_phone,
    contact_username,
    contact_source,
    ...booking
  } = bookingWithContact;
  
  return booking;
}

/******************************************************************************
 Export default
******************************************************************************/

export default {
  new: newBookingWithContact,
  test: testBookingWithContact,
  fromBookingAndContact,
  toBooking,
} as const;