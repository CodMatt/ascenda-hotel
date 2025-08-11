import { describe, test, expect } from 'vitest';
import formatDisplayDate from '../lib/FormatDisplayDate';

describe("formatDisplayDate test-suite", () => {

    test("Valid ISO date string", () => {
        const result = formatDisplayDate("2025-08-11");
        expect(result).toBe("11 Aug");
    });

    test("Valid date with single-digit day", () => {
        const result = formatDisplayDate("2025-04-03");
        expect(result).toBe("3 Apr");
    });

    test("Valid date string in December", () => {
        const result = formatDisplayDate("2025-12-25");
        expect(result).toBe("25 Dec");
    });

    test("Valid timestamp string", () => {
        const timestamp = new Date("2025-07-15 00:00:00").getTime();
        console.log(timestamp)
        const result = formatDisplayDate(timestamp);
        expect(result).toBe("15 Jul");
    });

    test("Null date string", () => {
        const result = formatDisplayDate(null);
        expect(result).toBe("");
    });

    test("Undefined date string", () => {
        const result = formatDisplayDate(undefined);
        expect(result).toBe("");
    });

    test("Empty string", () => {
        const result = formatDisplayDate("");
        expect(result).toBe("");
    });

    test("Invalid date string", () => {
        const result = formatDisplayDate("not-a-date");
        expect(result).toContain("NaN");
    });
});
