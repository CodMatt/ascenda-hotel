import CountryCodes from './CountryCodes';
const isPhoneNumberValid = (phoneNumber: string, country: string, countryCode: string) => {

        const countryCodes : { [key: string]: [number | number[], string] } = CountryCodes;
        
        
        if (!country){
            return false;

        } 

        // check if inputs are numbers for others
        if (country == "others"){
            if (Number(phoneNumber) && Number(countryCode) && countryCode.length <= 4 && phoneNumber.length >= 6){
                return true;
            } else{
                return false;
            }
        }
        

        // check length if its not custom country
        if (Number(phoneNumber) && phoneNumber[0] != '0'){
            // console.log(country)
            // console.log(phoneNumber)
            
            if (countryCodes[country][1] !== countryCode){

                return false;
            }
            if (Number.isInteger(countryCodes[country][0])){
                return countryCodes[country][0] === Number(phoneNumber.length);

            } else if (Array.isArray(countryCodes[country][0])){
                
                return countryCodes[country][0].includes(phoneNumber.length);
            }
            
        } 
        return false;
        
    }

export default isPhoneNumberValid;