import { describe, test, expect } from 'vitest'
import calculateNights from '../lib/CalculateNights'

describe ("CalculateNights isEmailValid test-suite", () => {

    const today = new Date();
    

    test ("Same date", () => {
        const result = calculateNights(today, today);
        expect(result).toBe(0);
    });

    test ("5 days later", () => {
        const otherDate: Date = new Date(today);
        otherDate.setDate(otherDate.getDate() + 5)
        const result = calculateNights(today, otherDate);
        expect(result).toBe(5);
    });

    test ("checkout before checkin", () => {
        const otherDate: Date = new Date(today);
        otherDate.setDate(otherDate.getDate() + -5)
        const result = calculateNights(today, otherDate);
        expect(result).toBe(-5);
    })


    



})