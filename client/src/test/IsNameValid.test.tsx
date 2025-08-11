import { describe, test, expect } from 'vitest'
import isNameValid from '../lib/IsNameValid'


describe ("IsNameValid isNameValid test-suite", () => {

    test ("Name containing mix of valid letters only", () => {
        const result = isNameValid("TestName");
        expect(result).toBe(true);
    });

    test ("Name containing Mix of valid letters with at most 1 space in a row", () => {
        const result = isNameValid("Test nAmE");
        expect(result).toBe(true);
    });

    test ("Name containing multiple spaces in a row in the middle", () => {
        const result = isNameValid("Test  Name");
        expect(result).toBe(false);
    });

    test ("Name containing trailing Space", () => {
        const result = isNameValid("TestName ");
        expect(result).toBe(false);
    });

    test ("Name containing leading Space", () => {
        const result = isNameValid("  TestName");
        expect(result).toBe(false);
    });

    test ("Name containing letters and space at the end", () => {
        const result = isNameValid("TestName ");
        expect(result).toBe(false);
    });

    test ("Name containing symbol", () => {
        const result = isNameValid("T$st name");
        expect(result).toBe(false);
    });

    test ("Name containing numbers", () => {
        const result = isNameValid("Te3t Name");
        expect(result).toBe(false);
    });

    test ("Name containing accented Character", () => {
        const result = isNameValid("Test Nâme");
        expect(result).toBe(false);
    });

    test ("Name containing empty String", () => {
        const result = isNameValid("");
        expect(result).toBe(false);
    });

    // Add error state where its too LONG
    test ("Name longer than 50 valid characters", () => {
        const result = isNameValid("aBcDeFgHiGjLmNoPqRsTuVwXyZaBcDeFgHiGjLmNoPqRsTuVwXyZ");
        expect(result).toBe(false);
    });


})