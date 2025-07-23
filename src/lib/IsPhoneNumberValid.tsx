import CountryCodes from './PhoneNumberCodes';
const isPhoneNumberValid = (phoneNumber: string, country: string) => {

        const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;

        //check if contains only integers
        if (!country || !(country in countryCodes)){
            return false;
        }

        // check length
        if (Number(phoneNumber) && phoneNumber[0] != '0'){
            if (Number.isInteger(countryCodes[country][0])){
                return countryCodes[country][0] === Number(phoneNumber);

            } else if (Array.isArray(countryCodes[country][0])){
                return Number(phoneNumber) in countryCodes[country][0];
            }
            
        } else {
            return false;
        }
    }

export default isPhoneNumberValid;