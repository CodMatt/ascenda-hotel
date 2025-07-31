type SortBy = "none" | "priceAsc" | "priceDesc" | "starAsc" | "starDesc";

export function sortHotels(hotels: any[], sortBy: SortBy): any[] {
  if (sortBy === "none") return hotels;

  return [...hotels].sort((a, b) => {
    if (sortBy === "starAsc") return (a.rating ?? 0) - (b.rating ?? 0);
    if (sortBy === "starDesc") return (b.rating ?? 0) - (a.rating ?? 0);

    const aHasPrice = a.price !== null;
    const bHasPrice = b.price !== null;

    if (!aHasPrice && !bHasPrice) return 0;
    if (!aHasPrice) return 1;
    if (!bHasPrice) return -1;

    if (sortBy === "priceAsc") return a.price - b.price;
    if (sortBy === "priceDesc") return b.price - a.price;

    return 0;
  });
}
