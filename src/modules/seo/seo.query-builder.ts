export async function buildProjectQuery(parsed: any) {
  switch (parsed.type) {
    case "PRICE":
      return {
        city: {
          slug: parsed.city,
        },
        price: {
          lte: parsed.price * 10000000,
        },
      };

    case "TYPOLOGY":
      return {
        // city: {
        //      slug: parsed.city,
        // },
        projectSubTypology: {
          some: {
            subTypology: {
              slug: `${parsed.bhk}`,
            },
          },
        },
      };

    case "LOCATION":
      return {
        locality: {
          slug: parsed.location,
        },
      };
  }
}
