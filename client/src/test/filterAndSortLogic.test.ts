// Unit Testing
import { describe, it, expect } from 'vitest';
import { sortHotels } from '../../src/utils/sortHotels'; // ✅ Import real logic


const sampleHotels = [
  { name: "Hotel A", rating: 3.8, price: 300 },
  { name: "Hotel B", rating: 4.5, price: null },
  { name: "Hotel C", rating: 4.0, price: 200 },
];

describe("Sort hotels", () => {
  // sorting by price ascending
  it("sorts by price ascending with nulls at end", () => {
    const sorted = sortHotels(sampleHotels, "priceAsc");
    expect(sorted.map(h => h.name)).toEqual(["Hotel C", "Hotel A", "Hotel B"]);
  });

  // sorting by price descending
  it("sorts by price descending", () => { 
    const sorted = sortHotels(sampleHotels, "priceDesc");
    expect(sorted.map(h => h.name)).toEqual(["Hotel A", "Hotel C", "Hotel B"]);
  });

  // sorting by star ascending 
  it("sorts by star rating ascending", () => {
    const sorted = sortHotels(sampleHotels, "starAsc");
    expect(sorted.map(h => h.name)).toEqual(["Hotel A", "Hotel C", "Hotel B"]);
  });

  // sorting by star descending
  it("sorts by star rating descending", () => {
    const sorted = sortHotels(sampleHotels, "starDesc");
    expect(sorted.map(h => h.name)).toEqual(["Hotel B", "Hotel C", "Hotel A"]);
  });


  // sorting (sortBy = "none") returns original order
  it("returns original list when sortBy is 'none'", () => {
    const sorted = sortHotels(sampleHotels, "none");
    expect(sorted.map(h => h.name)).toEqual(["Hotel A", "Hotel B", "Hotel C"]);
  });

  // handles empty hotel list
  it("handles empty hotel list", () => {
    const sorted = sortHotels([], "priceAsc");
    expect(sorted).toEqual([]);
  });

  // All hotels have null prices
  it("handles all hotels with null prices", () => {
    const hotels = [
      { name: "H1", price: null },
      { name: "H2", price: null },
    ];
    const sorted = sortHotels(hotels, "priceAsc");
    expect(sorted.map(h => h.name)).toEqual(["H1", "H2"]);
  });

  // Checking if my sorting works e.g. 4-star. 
  it("filters hotels by 4-star rating", () => {
    const hotels = [
      { name: "Hotel X", rating: 4.2 },
      { name: "Hotel Y", rating: 3.7 },
      { name: "Hotel Z", rating: 4.9 }
    ];
    const filtered = hotels.filter(h => Math.floor(h.rating ?? 0) === 4);
    expect(filtered.map(h => h.name)).toEqual(["Hotel X", "Hotel Z"]);
  });

  
  
});
