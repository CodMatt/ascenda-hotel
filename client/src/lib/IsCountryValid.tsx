import CountryCodes from './CountryCodes';
const isCountryValid = (country: string) => {
    if (!country) {
        return false;
    } else {
        return country.toLowerCase() === 'others' || country in CountryCodes;
        
    }
}
export default isCountryValid;