import { prisma } from "../../src/config/prisma.config";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting seed...");

  // ── 1. Admin User ──────────────────────────────────────────────
  const hashedPw = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ashwinsheth.com" },
    update: {},
    create: {
      email: "admin@ashwinsheth.com",
      name: "Admin User",
      password: hashedPw,
      role: "ADMIN",
    },
  });
  console.log(`✅ User: ${admin.email}`);

  // ── 2. Project Statuses ────────────────────────────────────────
  const statuses = await prisma.projectStatus.createMany({
    data: [
      { name: "Completed", slug: "completed" },
      { name: "New Launch", slug: "new-launch" },
      { name: "Ready To Move", slug: "ready-to-move" },
      { name: "Under Construction", slug: "under-construction" },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ ProjectStatus: ${statuses.count}`);

  // ── 3. Project Section Lists ───────────────────────────────────
  const psl = await prisma.projectSectionLists.createMany({
    data: [
      { name: "Banner", type: "banner" },
      { name: "Overview", type: "overview" },
      { name: "Gallery", type: "gallery" },
      { name: "Amenities", type: "amenities" },
      { name: "FloorPlan", type: "floorPlan" },
      { name: "Location Advantage", type: "locationadvantage" },
      { name: "Faq", type: "faq" },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ ProjectSectionLists: ${psl.count}`);

  // ── 4. City Section Lists ──────────────────────────────────────
  const csl = await prisma.citySectionLists.createMany({
    data: [
      { name: "Overview", slug: "overview" },
      { name: "Ecosystem", slug: "ecosystem" },
      { name: "Lifestyle", slug: "lifestyle" },
      { name: "Project", slug: "project" },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ CitySectionLists: ${csl.count}`);

  // ── 5. Country ─────────────────────────────────────────────────
  const india = await prisma.country.upsert({
    where: { name: "India" },
    update: {},
    create: { name: "India", slug: "india" },
  });
  console.log(`✅ Country: ${india.name}`);

  // ── 6. Cities ──────────────────────────────────────────────────
  const mumbai = await prisma.city.upsert({
    where: { name: "Mumbai" },
    update: {},
    create: {
      name: "Mumbai",
      slug: "mumbai",
      title: "Financial Capital of India",
      shortDescription: "Mumbai – the city of dreams.",
      countryId: india.id,
      isSection: true,
    },
  });

  const pune = await prisma.city.upsert({
    where: { name: "Pune" },
    update: {},
    create: {
      name: "Pune",
      slug: "pune",
      title: "Oxford of the East",
      shortDescription: "Pune – the cultural hub.",
      countryId: india.id,
      isSection: true,
    },
  });
  console.log(`✅ Cities: Mumbai, Pune`);

  // ── 7. Localities ──────────────────────────────────────────────
  const bandra = await prisma.locality.upsert({
    where: { slug: "bandra-mumbai" },
    update: {},
    create: { name: "Bandra", slug: "bandra-mumbai", cityId: mumbai.id },
  });

  const andheri = await prisma.locality.upsert({
    where: { slug: "andheri-mumbai" },
    update: {},
    create: { name: "Andheri", slug: "andheri-mumbai", cityId: mumbai.id },
  });

  const hinjewadi = await prisma.locality.upsert({
    where: { slug: "hinjewadi-pune" },
    update: {},
    create: { name: "Hinjewadi", slug: "hinjewadi-pune", cityId: pune.id },
  });
  console.log(`✅ Localities: Bandra, Andheri, Hinjewadi`);

  // ── 8. Typology & SubTypology ──────────────────────────────────
  const residential = await prisma.typology.upsert({
    where: { slug: "residential" },
    update: {},
    create: { name: "Residential", slug: "residential" },
  });

  const commercial = await prisma.typology.upsert({
    where: { slug: "commercial" },
    update: {},
    create: { name: "Commercial", slug: "commercial" },
  });

  const sub1bhk = await prisma.subTypology.upsert({
    where: { name: "1 BHK" },
    update: {},
    create: { name: "1 BHK", slug: "1-bhk" },
  });

  const sub2bhk = await prisma.subTypology.upsert({
    where: { name: "2 BHK" },
    update: {},
    create: { name: "2 BHK", slug: "2-bhk" },
  });

  const sub3bhk = await prisma.subTypology.upsert({
    where: { name: "3 BHK" },
    update: {},
    create: { name: "3 BHK", slug: "3-bhk" },
  });

  await prisma.typologySubTypology.createMany({
    data: [
      { typologyId: residential.id, subTypologyId: sub1bhk.id },
      { typologyId: residential.id, subTypologyId: sub2bhk.id },
      { typologyId: residential.id, subTypologyId: sub3bhk.id },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Typologies & SubTypologies seeded`);

  // ── 9. Platter ─────────────────────────────────────────────────
  const luxuryPlatter = await prisma.platter.upsert({
    where: { name: "Luxury" },
    update: {},
    create: {
      name: "Luxury",
      slug: "luxury",
      title: { en: "Luxury Homes" },
      description: { en: "Premium luxury residential projects." },
    },
  });

  const affordablePlatter = await prisma.platter.upsert({
    where: { name: "Affordable" },
    update: {},
    create: {
      name: "Affordable",
      slug: "affordable",
      title: { en: "Affordable Homes" },
      description: { en: "Budget-friendly residential projects." },
    },
  });
  console.log(`✅ Platters: Luxury, Affordable`);

  // ── 10. Projects ────────────────────────────────────────────────
  const completedStatus = await prisma.projectStatus.findFirst({ where: { slug: "completed" } });
  const underConstStatus = await prisma.projectStatus.findFirst({ where: { slug: "under-construction" } });

  const project1 = await prisma.projects.upsert({
    where: { slug: "ashwin-heights-bandra" },
    update: {},
    create: {
      slug: "ashwin-heights-bandra",
      projectName: "Ashwin Heights Bandra",
      cityId: mumbai.id,
      localityId: bandra.id,
      platterId: luxuryPlatter.id,
      typologyId: residential.id,
      projectStatusId: completedStatus!.id,
      countryId: india.id,
      location: "Bandra West, Mumbai",
      price: 25000000,
      isPage: true,
      isFeature: true,
      otherDetails: { area: "1200 sqft", possession: "Dec 2024" },
      seoTags: {
        title: "Ashwin Heights Bandra | Luxury Apartments in Mumbai",
        description: "Premium 2 & 3 BHK apartments in Bandra, Mumbai.",
      },
    },
  });

  const project2 = await prisma.projects.upsert({
    where: { slug: "ashwin-greens-hinjewadi" },
    update: {},
    create: {
      slug: "ashwin-greens-hinjewadi",
      projectName: "Ashwin Greens Hinjewadi",
      cityId: pune.id,
      localityId: hinjewadi.id,
      platterId: affordablePlatter.id,
      typologyId: residential.id,
      projectStatusId: underConstStatus!.id,
      countryId: india.id,
      location: "Hinjewadi Phase 2, Pune",
      price: 8500000,
      isPage: true,
      isFeature: false,
      otherDetails: { area: "950 sqft", possession: "Jun 2026" },
      seoTags: {
        title: "Ashwin Greens Hinjewadi | Affordable Homes in Pune",
        description: "Affordable 1 & 2 BHK apartments in Hinjewadi, Pune.",
      },
    },
  });
  console.log(`✅ Projects: ${project1.projectName}, ${project2.projectName}`);

  // ── 11. Project SubTypologies ───────────────────────────────────
  await prisma.projectSubTypology.createMany({
    data: [
      { projectId: project1.id, subTypologyId: sub2bhk.id },
      { projectId: project1.id, subTypologyId: sub3bhk.id },
      { projectId: project2.id, subTypologyId: sub1bhk.id },
      { projectId: project2.id, subTypologyId: sub2bhk.id },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ ProjectSubTypologies seeded`);

  // ── 12. Amenities ───────────────────────────────────────────────
  const amenityData = ["Swimming Pool", "Gymnasium", "Club House", "Children's Play Area", "24x7 Security"];
  for (const title of amenityData) {
    await prisma.amenities.upsert({
      where: { title },
      update: {},
      create: { title },
    });
  }
  console.log(`✅ Amenities: ${amenityData.length}`);

  // ── 13. City Sections ────────────────────────────────────────────
  await prisma.citySections.createMany({
    data: [
      {
        cityId: mumbai.id,
        sectionType: "overview",
        title: { en: "Mumbai Overview" },
        description: { en: "Mumbai is the financial capital of India." },
        seq: 1,
      },
      {
        cityId: mumbai.id,
        sectionType: "lifestyle",
        title: { en: "Mumbai Lifestyle" },
        description: { en: "Experience the vibrant lifestyle Mumbai offers." },
        seq: 2,
      },
      {
        cityId: pune.id,
        sectionType: "overview",
        title: { en: "Pune Overview" },
        description: { en: "Pune is known for its education and IT sector." },
        seq: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ CitySections seeded`);

  // ── 14. Blogs & Category ─────────────────────────────────────────
  const blogCat = await prisma.blogCategories.upsert({
    where: { slug: "real-estate" },
    update: {},
    create: { name: "Real Estate", slug: "real-estate" },
  });

  await prisma.blogs.upsert({
    where: { slug: "top-5-luxury-apartments-mumbai" },
    update: {},
    create: {
      categoryId: blogCat.id,
      title: "Top 5 Luxury Apartments in Mumbai 2025",
      slug: "top-5-luxury-apartments-mumbai",
      description: { en: "Discover the finest luxury apartments Mumbai has to offer in 2025." },
      seoTags: { title: "Top 5 Luxury Apartments Mumbai 2025", description: "Best luxury homes in Mumbai." },
      dateAt: new Date("2025-01-15"),
      publishBy: "Editorial Team",
    },
  });
  console.log(`✅ Blog & Category seeded`);

  // ── 15. Testimonials ─────────────────────────────────────────────
  await prisma.testimonials.createMany({
    data: [
      {
        type: "image",
        name: "Rajesh Mehta",
        description: "Ashwin Sheth delivered our dream home on time. Excellent quality!",
        isFeature: true,
        seq: 1,
      },
      {
        type: "image",
        name: "Priya Sharma",
        description: "Outstanding build quality and great customer support throughout.",
        isFeature: true,
        seq: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Testimonials seeded`);

  // ── 16. FAQs ─────────────────────────────────────────────────────
  await prisma.faqs.createMany({
    data: [
      { type: "faq", question: "What documents are required for booking?", answer: "PAN card, Aadhar, and bank statement.", seq: 1 },
      { type: "faq", question: "What is the payment plan?", answer: "We offer construction-linked and down payment plans.", seq: 2 },
      { type: "nri", question: "Can NRIs buy property?", answer: "Yes, NRIs can purchase residential property in India.", seq: 1 },
      { type: "about", question: "How many projects has Ashwin Sheth completed?", answer: "Ashwin Sheth has completed 50+ projects across India.", seq: 1 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ FAQs seeded`);

  // ── 17. Awards ────────────────────────────────────────────────────
  await prisma.awards.createMany({
    data: [
      { year: 2024, title: "Best Luxury Developer - Mumbai", seq: 1 },
      { year: 2023, title: "Excellence in Real Estate - CREDAI", seq: 2 },
      { year: 2022, title: "Top Affordable Housing Developer", seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Awards seeded`);

  // ── 18. Team ──────────────────────────────────────────────────────
  await prisma.team.createMany({
    data: [
      { name: "Ashwin Sheth", designation: "Chairman & Managing Director", isFounder: true, seq: 1 },
      { name: "Rahul Sheth", designation: "Director", isFounder: false, seq: 2 },
      { name: "Neha Kapoor", designation: "Chief Marketing Officer", isFounder: false, seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Team seeded`);

  // ── 19. Timeline ──────────────────────────────────────────────────
  await prisma.timeline.createMany({
    data: [
      { title: "Company Founded", year: "1986", description: { en: "Ashwin Sheth Group was established." }, seq: 1 },
      { title: "First Landmark Project", year: "1995", description: { en: "Launched our first landmark residential project." }, seq: 2 },
      { title: "Expanded to Pune", year: "2005", description: { en: "Forayed into the Pune real estate market." }, seq: 3 },
      { title: "50 Projects Milestone", year: "2020", description: { en: "Delivered 50+ projects across India." }, seq: 4 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Timeline seeded`);

  // ── 20. Social Links ──────────────────────────────────────────────
  await prisma.socialLinks.createMany({
    data: [
      { key: "facebook", socialLink: "https://facebook.com/ashwinsheth", seq: 1 },
      { key: "instagram", socialLink: "https://instagram.com/ashwinsheth", seq: 2 },
      { key: "twitter", socialLink: "https://twitter.com/ashwinsheth", seq: 3 },
      { key: "linkedin", socialLink: "https://linkedin.com/company/ashwinsheth", seq: 4 },
      { key: "youtube", socialLink: "https://youtube.com/ashwinsheth", seq: 5 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Social Links seeded`);

  // ── 21. Office Locations ──────────────────────────────────────────
  await prisma.officesLocation.createMany({
    data: [
      {
        city: "Mumbai",
        officeName: "Headquarters",
        list: [
          { label: "Address", value: "Ashwin Sheth House, Bandra West, Mumbai - 400050" },
          { label: "Phone", value: "+91 22 1234 5678" },
          { label: "Email", value: "info@ashwinsheth.com" },
        ],
        seq: 1,
      },
      {
        city: "Pune",
        officeName: "Pune Office",
        list: [
          { label: "Address", value: "Hinjewadi IT Park, Pune - 411057" },
          { label: "Phone", value: "+91 20 9876 5432" },
        ],
        seq: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Office Locations seeded`);

  // ── 22. Media Coverage ────────────────────────────────────────────
  await prisma.mediaCoverage.createMany({
    data: [
      {
        title: "Ashwin Sheth Launches Luxury Project in Bandra",
        mediaType: "press_release",
        dateAt: new Date("2025-03-10"),
        isHome: true,
        seq: 1,
      },
      {
        title: "Ashwin Sheth Wins CREDAI Award 2024",
        mediaType: "announcements",
        dateAt: new Date("2024-11-20"),
        isHome: false,
        seq: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Media Coverage seeded`);

  // ── 23. NRI Why India ─────────────────────────────────────────────
  await prisma.nriWhy.createMany({
    data: [
      { title: "High ROI", shortDescription: "Indian real estate offers excellent returns on investment.", seq: 1 },
      { title: "Safe Investment", shortDescription: "Secure your future with stable property assets.", seq: 2 },
      { title: "Emotional Connect", shortDescription: "Own a home in your homeland.", seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ NRI Why seeded`);

  // ── 24. Investor Tabs ─────────────────────────────────────────────
  const annualReports = await prisma.inverstorTabs.upsert({
    where: { slug: "annual-reports" },
    update: {},
    create: { title: "Annual Reports", slug: "annual-reports", seq: 1 },
  });

  await prisma.investorDocuments.createMany({
    data: [
      { inverstorTabId: annualReports.id, title: "Annual Report 2024", type: "pdf", seq: 1 },
      { inverstorTabId: annualReports.id, title: "Annual Report 2023", type: "pdf", seq: 2 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Investor Tabs & Documents seeded`);

  // ── 25. CSR Activity ──────────────────────────────────────────────
  await prisma.csrActivity.createMany({
    data: [
      { question: "What is Ashwin Sheth's CSR focus?", answer: "Education, healthcare and environment.", seq: 1 },
      { question: "How many lives impacted?", answer: "Over 10,000 lives impacted through various initiatives.", seq: 2 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ CSR Activity seeded`);

  // ── 26. CSR Content Details ───────────────────────────────────────
  await prisma.csrContentDetails.createMany({
    data: [
      { type: "environment", title: "Tree Plantation Drive", shortDescription: "Planted 5000+ trees in 2024.", seq: 1 },
      { type: "community", title: "Scholarship Program", shortDescription: "Provided 200+ scholarships.", seq: 2 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ CSR Content Details seeded`);

  // ── 27. Values ────────────────────────────────────────────────────
  await prisma.values.createMany({
    data: [
      { key: "integrity", title: "Integrity", shortDescription: "We operate with absolute transparency.", seq: 1 },
      { key: "innovation", title: "Innovation", shortDescription: "Pushing boundaries in design and construction.", seq: 2 },
      { key: "excellence", title: "Excellence", shortDescription: "Delivering world-class quality every time.", seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Values seeded`);

  // ── 28. Jobs ──────────────────────────────────────────────────────
  await prisma.jobs.createMany({
    data: [
      { title: "Site Engineer", department: "Construction", location: "Mumbai", seq: 1 },
      { title: "Sales Manager", department: "Sales", location: "Pune", seq: 2 },
      { title: "Architect", department: "Design", location: "Mumbai", seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Jobs seeded`);

  // ── 29. Instagram Token ───────────────────────────────────────────
  const accessToken = process.env.IG_ACCESS_TOKEN;
  if (accessToken) {
    await prisma.instagramToken.createMany({
      data: [{ accessToken, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }],
      skipDuplicates: true,
    });
    console.log(`✅ InstagramToken seeded`);
  }

  // ── 30. SEO Pages ─────────────────────────────────────────────────
  await prisma.seoPage.createMany({
    data: [
      {

      },
      {

      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ SEO Pages seeded`);

  // ── 31. SEO Footer Links ──────────────────────────────────────────
  await prisma.seoFooterLink.createMany({
    data: [
      { label: "2 BHK in Mumbai", slug: "2-bhk-apartments-mumbai", type: "TYPOLOGY", seq: 1 },
      { label: "3 BHK in Mumbai", slug: "3-bhk-apartments-mumbai", type: "TYPOLOGY", seq: 2 },
      { label: "Flats in Bandra", slug: "flats-in-bandra-mumbai", type: "LOCATION", seq: 3 },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ SEO Footer Links seeded`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
