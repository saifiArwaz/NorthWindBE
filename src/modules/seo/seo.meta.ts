function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function generateSeo(parsed: any) {
  switch (parsed.type) {
    case "PRICE":
      return {
        seoTags: {
          metaTitle: `Properties Under ${parsed.price} Crore in ${capitalize(parsed.city || "Mumbai")}`,
          metaDescription: `Explore premium properties under ${parsed.price} crore in ${capitalize(parsed.city || "Mumbai")} .`,
          metaKeywords: `properties under ${parsed.price} crore in ${parsed.city}`,
        },
      };

    case "TYPOLOGY":
      return {
        seoTags: {
          metaTitle: `${parsed.bhk} BHK Flats in ${capitalize(parsed.city || "Mumbai")}`,
          metaDescription: `Find spacious ${parsed.bhk} BHK flats in ${capitalize(parsed.city || "Mumbai")} .`,
          metaKeywords: `${parsed.bhk} bhk flats in ${parsed.city}`,
        },
      };

    case "LOCATION":
      return {
        seoTags: {
          metaTitle: `Flats in ${capitalize(parsed.location || "Mumbai")}`,
          metaDescription: `Explore flats in ${capitalize(parsed.location || "Mumbai")}.`,
          metaKeywords: `flats in ${parsed.location}`,
        },
      };
  }
}
