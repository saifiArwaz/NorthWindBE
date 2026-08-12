export enum SeoPageType {
  PRICE = "PRICE",
  TYPOLOGY = "TYPOLOGY",
  LOCATION = "LOCATION",
}

export function parseSeoSlug(slug: string) {
  // PRICE
  const priceMatch = slug.match(/properties-under-(\d+)-crore-in-mumbai/);

  if (priceMatch) {
    return {
      type: SeoPageType.PRICE,
      price: Number(priceMatch[1]),
      city: priceMatch[2],
    };
  }

  // TYPOLOGY
  const typologyMatch = slug.match(
    // /(.+)-flats-in-(.+)/
    /(.+)-flats-in-mumbai/,
  );

  if (typologyMatch) {
    return {
      type: SeoPageType.TYPOLOGY,
      bhk: typologyMatch[1],
    };
  }

  // LOCATION
  const locationMatch = slug.match(/flats-in-(.+)/);

  if (locationMatch) {
    return {
      type: SeoPageType.LOCATION,
      location: locationMatch[1],
    };
  }

  return null;
}
