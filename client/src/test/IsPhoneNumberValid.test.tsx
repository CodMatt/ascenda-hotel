import { describe, test, expect } from 'vitest'
import isPhoneNumberValid from '../lib/IsPhoneNumberValid'

describe("IsPhoneNumberValid isPhoneNumber test-suite", () => {

    const c1 = "";
    const c2 = "others";
    const c3 = "Antigua and Barbuda"; // 10
    const c4 = "Argentina"; // 6, 7, 8

    const n1 = "";
    const n2 = "1";
    const n3 = "54";
    const n4 = "12345";
    const n5 = "1!";

    const p1 = "1234567891";
    const p2 = "12!3456789";
    const p3 = "";
    const p4 = "12345678";
    const p5 = "123!5678";
    const p6 = "12345678912345" // 

    test("Test 1", () => {
        const result = isPhoneNumberValid(p1, c1, n1);
        expect(result).toBe(false);
    });

    test("Test 2", () => {
        const result = isPhoneNumberValid(p1, c2, n1);
        expect(result).toBe(false);
    });

    test("Test 3", () => {
        const result = isPhoneNumberValid(p2, c2, n1);
        expect(result).toBe(false);
    });

    test("Test 4", () => {
        const result = isPhoneNumberValid(p3, c2, n1);
        expect(result).toBe(false);
    });

    test("Test 5", () => {
        const result = isPhoneNumberValid(p1, c2, n5);
        expect(result).toBe(false);
    });

    test("Test 6", () => {
        const result = isPhoneNumberValid(p2, c2, n5);
        expect(result).toBe(false);
    });

    test("Test 7", () => {
        const result = isPhoneNumberValid(p3, c2, n5);
        expect(result).toBe(false);
    });

    test("Test 8", () => {
        const result = isPhoneNumberValid(p1, c2, n4);
        expect(result).toBe(false);
    });

    test("Test 9", () => {
        const result = isPhoneNumberValid(p4, c2, n4);
        expect(result).toBe(false);
    });

    test("Test 10", () => {
        const result = isPhoneNumberValid(p1, c2, n2);
        expect(result).toBe(true);
    });

    test("Test 11", () => {
        const result = isPhoneNumberValid(p4, c2, n2);
        expect(result).toBe(true);
    });

    test("Test 12", () => {
        const result = isPhoneNumberValid(p1, c3, n2);
        expect(result).toBe(true);
    });

    test ("Test 13", () => {
        const result = isPhoneNumberValid(p6, c2, n3); // Add test for total > max length
        expect(result).toBe(false);
    });

    test("Test 14", () => {
        const result = isPhoneNumberValid(p4, c4, n3);
        expect(result).toBe(true);
    });

    test("Test 15", () => {
        const result = isPhoneNumberValid(p1, c3, n3);
        expect(result).toBe(false);
    });

    test("Test 16", () => {
        const result = isPhoneNumberValid(p4, c3, n3);
        expect(result).toBe(false);
    });

    test("Test 17", () => {
        const result = isPhoneNumberValid(p1, c4, n2);
        expect(result).toBe(false);
    });

    test("Test 18", () => {
        const result = isPhoneNumberValid(p4, c4, n2);
        expect(result).toBe(false);
    });

    test("Test 19", () => {
        const result = isPhoneNumberValid(p2, c3, n2);
        expect(result).toBe(false);
    });

    test("Test 20", () => {
        const result = isPhoneNumberValid(p3, c3, n2);
        expect(result).toBe(false);
    });

    test("Test 21", () => {
        const result = isPhoneNumberValid(p3, c4, n3);
        expect(result).toBe(false);
    });

    test("Test 22", () => {
        const result = isPhoneNumberValid(p5, c4, n3);
        expect(result).toBe(false);
    });
});
