import { prisma } from "../../src/config/prisma.config";


async function main() {

  const projectStatuses = await prisma.projectStatus.createMany({
    data: [
      { name: "OnGoing", slug: "ongoing" },
      { name: "UpComing", slug: "upcoming" },
      { name: "Completed", slug: "completed" },
    ],
    skipDuplicates: true,
  });


  console.log(`Created ${projectStatuses.count} ProjectStatus items`);

  // Seed Project Section Lists
  const projectSectionList = await prisma.projectSectionLists.createMany({
    data: [
      { name: "Overview", type: "overview" },
      { name: "Gallery", type: "gallery" },
      { name: "Tower", type: "tower" },
      { name: "Construction", type: "construction" },
      { name: "Highlights", type: "highlights" },
      { name: "Amenities", type: "amenities" },
      { name: "FloorPlan", type: "floorPlan" },
      { name: "Location Advantage", type: "locationadvantage" },
      { name: "Faq", type: "faq" },
      { name: "Sustainability", type: "sustainability" },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${projectSectionList.count} ProjectSectionLists items`);


  // const citySectionList = await prisma.citySectionLists.createMany({
  //   data: [
  //     { name: "Overview", slug: "overview" },
  //     { name: "Ecosystem", slug: "ecosystem" },
  //     { name: "Lifestyle", slug: "lifestyle" },
  //     { name: "Project", slug: "project" },
  //   ],
  //   skipDuplicates: true,
  // });

  // console.log(`Created ${citySectionList.count} CitySectionLists items`);

  const accessToken = process.env.IG_ACCESS_TOKEN;
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  if (accessToken) {
    await prisma.instagramToken.createMany({
      data: [
        {
          accessToken,
          expiresAt,
        }
      ],
      skipDuplicates: true,
    });
    console.log("Seeded InstagramToken from environment (skipDuplicates applied)");
  } else {
    console.warn("Instagram access token not set in env; skipping InstagramToken seeding.");
  }


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
