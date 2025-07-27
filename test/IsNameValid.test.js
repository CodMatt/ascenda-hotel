import isNameValid from '../src/lib/IsNameValid'

describe ("IsNameValid isNameValid test-suite", () => {

    test ("Name containing uppercase and lowercase letters with no spaces", () => {
        const result = isNameValid("TestName");
        expect(result).toBe(true);
    });

    test ("Name containing letters and space in middle", () => {
        const result = isNameValid("Test Name");
        expect(result).toBe(true);
    });

    test ("Name containing letters and a double space in the middle", () => {
        const result = isNameValid("Test  Name");
        expect(result).toBe(false);
    });

    test ("Name ending with a space", () => {
        const result = isNameValid("TestName ");
        expect(result).toBe(false);
    });

    test ("Name containing letters and space at the start", () => {
        const result = isNameValid("  TestName");
        expect(result).toBe(false);
    });

    test ("Name containing letters and space at the end", () => {
        const result = isNameValid("TestName ");
        expect(result).toBe(false);
    });


    test ("No entry", () => {
        const result = isNameValid("");
        expect(result).toBe(false);
    });

    test ("Name containing only numbers", () => {
        const result = isNameValid("1234");
        expect(result).toBe(false);
    });

    test ("Name containing only special characters", () => {
        const result = isNameValid("!");
        expect(result).toBe(false);
    });

    test ("Name containing mix of letters, numbers, and special characters", () => {
        const result = isNameValid("!@ ab 12");
        expect(result).toBe(false);
    });
})