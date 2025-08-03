import isEmailValid from '../src/components/lib/IsEmailValid'

describe ("IsEmailValid isEmailValid test-suite", () => {

    test ("Valid email with all allowed prefix characters and valid domain", () => {
        const result = isEmailValid("user_name-1.test@do-main.come");
        expect(result).toBe(true);
    });

    test ("Valid email with all allowed prefix characters and valid domain with more than one .", () => {
        const result = isEmailValid("user_name-1.test@do-main.com.sg");
        expect(result).toBe(true);
    });

    test ("Email with space in prefix", () => {
        const result = isEmailValid("user name@domain.com");
        expect(result).toBe(false);
    });

    test ("Email with unallowed special character in prefix", () => {
        const result = isEmailValid("user!name@domain.com");
        expect(result).toBe(false);
    });

    test ("Email with space in domain", () => {
        const result = isEmailValid("username@do main.com");
        expect(result).toBe(false);
    });

    test ("Email with single letter TLD", () => {
        const result = isEmailValid("user@domain.c");
        expect(result).toBe(false);
    });

    test ("Email with missing . in domain", () => {
        const result = isEmailValid("user@domaincom");
        expect(result).toBe(false);
    });

    test ("Email with empty domain", () => {
        const result = isEmailValid("username@");
        expect(result).toBe(false);
    });

    test ("Email with empty prefix", () => {
        const result = isEmailValid("@domain.com");
        expect(result).toBe(false);
    });

    test ("Email as empty string", () => {
        const result = isEmailValid("");
        expect(result).toBe(false);
    });



})