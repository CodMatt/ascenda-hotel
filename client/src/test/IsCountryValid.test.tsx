import { describe, test, expect } from 'vitest'
import isCountryValid from '../lib/IsCountryValid'


describe ("IsNameValid isNameValid test-suite", () => {

    test ("Valid country that exists in CountryCodes", () => {
        const result = isCountryValid("Macedonia, the Former Yugoslav Republic of");
        expect(result).toBe(true);
    });

    test ("Valid country, Others", () => {
        const result = isCountryValid("others");
        expect(result).toBe(true);
    });

    test ("Invalid country name", () => {
        const result = isCountryValid("Does not exist");
        expect(result).toBe(false);
    });

    test ("Empty string", () => {
        const result = isCountryValid("");
        expect(result).toBe(false);
    });

    


})