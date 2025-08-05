import { isString } from "jet-validators";
import { IModel } from "./common/types";
import { isDate } from "util/types";
import { parseObject, TParseOnError } from 'jet-validators/utils';

import { hashPassword } from '@src/common/util/auth';

/**
 * ACCOUNT
 * user_id
 * username
 * password
 * first_name
 * last_name
 * salutaions
 */

/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_USER_VALS = (): IUser =>({
    id:'',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    salutation: '',
    email:'',
    phone_num:'',
    created: new Date(),
});

/******************************************************************************
                                  Types
******************************************************************************/

export interface IUser extends IModel{
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email:string;
    phone_num:string;
    salutation: string;
    created: Date;
}

/******************************************************************************
                                  Setup
******************************************************************************/

const parseUser = parseObject<IUser>({
    id: isString,
    username: isString,
    password: isString,
    first_name: isString,
    last_name: isString,
    salutation: isString,
    email:isString,
    phone_num: isString,
    created: isDate
});

/******************************************************************************
                                 Functions
******************************************************************************/

async function __new__(user?: Partial<IUser>): Promise<IUser> {
  const retVal = { ...DEFAULT_USER_VALS(), ...user };
  
  // Hash password if provided
  if (retVal.password) {
    retVal.password = await hashPassword(retVal.password);
  }
  
  return parseUser(retVal, errors => {
    throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
  });
}

function test(arg: unknown, errCb?: TParseOnError): arg is IUser {
  return !!parseUser(arg, errCb);
}

// /******************************************************************************
//                                 Export default
// ******************************************************************************/

export default {
  new: __new__,
  test,
} as const;