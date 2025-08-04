import CountryCodes from './CountryCodes';
const isPhoneNumberValid = (phoneNumber: string, country: string, countryCode: string) => {

        if (!phoneNumber || !country || !countryCode){
            return false;
        }
        const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;
        
        // check if inputs are numbers for others
        if (country == "others"){
            if (Number(phoneNumber) && Number(countryCode)){
                return true;
            } else{
                return false;
            }
        }
        

        // check length if its not custom country
        if (Number(phoneNumber) && phoneNumber[0] != '0'){
            console.log(country)
            console.log(phoneNumber)
            if (Number.isInteger(countryCodes[country][0])){
                return countryCodes[country][0] === Number(phoneNumber.length);

            } else if (Array.isArray(countryCodes[country][0])){
                return Number(phoneNumber.length) in countryCodes[country][0];
            }
            
        } 
        return false;
        
    }

export default isPhoneNumberValid;