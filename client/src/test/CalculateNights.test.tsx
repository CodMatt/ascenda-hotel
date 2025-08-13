import { describe, test, expect } from 'vitest'
import calculateNights from '../lib/CalculateNights'

describe ("CalculateNights test-suite", () => {

    const today = new Date();
    

    test ("Same date", () => {
        const result = calculateNights(today, today);
        expect(result).toBe(0);
    });

    test ("Checkout after checkin", () => {
        const otherDate: Date = new Date(today);
        otherDate.setDate(otherDate.getDate() + 999)
        const result = calculateNights(today, otherDate);
        expect(result).toBe(999);
    });

    test ("Checkout before Checkin", () => {
        const otherDate: Date = new Date(today);
        otherDate.setDate(otherDate.getDate() + -5)
        const result = calculateNights(today, otherDate);
        expect(result).toBe(-5);
    })


    



})