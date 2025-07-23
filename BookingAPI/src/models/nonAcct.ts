import { parseObject, TParseOnError } from 'jet-validators/utils';
import { isString } from "jet-validators";
import { parse } from 'path';


/**
 * nonAccount
 * booking_id
 * email
 * phone_num
 */

/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_NONACCT_VALS = (): INonAcct=>({
    booking_id:'',
    first_name:'',
    last_name: '',
    salutations: '',
    email:'',
    phone_num:''
});

export interface INonAcct{
    booking_id:string,
    first_name: string,
    last_name: string,
    salutations: string,
    email: string,
    phone_num: string
}

const parseNonAcct = parseObject<INonAcct>({
    booking_id: isString,
    first_name: isString,
    last_name: isString, 
    salutations: isString,
    email: isString,
    phone_num: isString
});

function __new__(nonAccount?: Partial<INonAcct>): INonAcct {
  const retVal = { ...DEFAULT_NONACCT_VALS(), ...nonAccount };
  return parseNonAcct(retVal, errors => {
    throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
  });
}


/**
 * Check is a user object. For the route validation.
 */
function test(arg: unknown, errCb?: TParseOnError): arg is INonAcct {
  return !!parseNonAcct(arg, errCb);
}

export default {
  new: __new__,
  test,
} as const;
