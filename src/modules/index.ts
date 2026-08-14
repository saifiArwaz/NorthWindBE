import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

// admin routes
import { authRoutes } from "./auth/auth.route.js";
import { pageRoutes } from "./page/page.route.js";
import { pageSectionsRoutes } from "./pageSections/pageSections.route.js";
import { TeamRoutes } from "./team/team.route.js";
import { TimelineRoutes } from "./timeline/timeline.route.js";
import { PlatterRoutes } from "./platter/platter.route.js";
import { CitiesRoutes } from "./cities/cities.route.js";
import { TypologyRoutes } from "./typology/typology.route.js";
import { SubTypologyRoutes } from "./subTypology/SubTypology.route.js";
import { MappingTypologyRoutes } from "./mappingTypology/mappingTypology.route.js";
import { ProjectStatusRoutes } from "./projectStatus/projectStatus.route.js";
import { ValuesRoutes } from "./values/values.route.js";
import { EventGalleryRoutes } from "./eventGalleries/eventGalleries.route.js";
import { JobRoutes } from "./job/job.route.js";
import { CareerGalleryRoutes } from "./careerGallery/careerGallery.route.js";
import { BlogRoutes } from "./blogs/blogs.route.js";
import { TestimonialRoutes } from "./testimonial/testimonial.route.js";
import { OfficeLocationRoutes } from "./officeLocation/officeLocation.route.js";
import { SocialLinkRoutes } from "./socialLink/socialLink.route.js";
import { NewsRoutes } from "./news/news.route.js";
import { MediaCoverageRoutes } from "./mediaCoverage/mediaCoverage.route.js";
import { MediaKitRoutes } from "./mediaKit/mediaKit.route.js";
import { AwardsRoutes } from "./awards/awards.route.js";
import { UploadRoutes } from "./upload/upload.route.js";
import { investorTabsRoutes } from "./investorTabs/investorTabs.route.js";
import { investorDocumentsRoutes } from "./investorDocument/investorDocument.route.js";
import { InstagramReelRoutes } from "./instagramReel/instagramReel.route.js";
import { EnquiriesRoutes } from "./enquiry/enquiry.route.js";
import { HomeLoanRoutes } from "./homeloan/homeloan.route.js";

// projects
import { projectRoutes } from "./projects/project.route.js";
import { projectSectionsRoutes } from "./projectSection/projectSections.route.js";
import { ProjectBannerRoutes } from "./projectBanner/projectBanner.route.js";
import { ProjectAmenitiesRoutes } from "./projectAmenities/projectAmenities.route.js";
import { projectGalleryRoutes } from "./projectGallery/projectGallery.route.js";
import { projectFloorplanRoutes } from "./projectFloorplan/projectFloorplan.route.js";
import { projectLocationAdvRoutes } from "./projectLocationAdvantage/projectLocationAdvantage.route.js";
import { menuItemRoutes } from "./menu/menu.route.js";
import { projectReraRoutes } from "./projectRera/projectRera.route.js";
import projectContentDetailsRoutes from "./projectContentDetails/projectContentDetails.route.js";
import { ProjectTowerRoutes } from "./projectTower/projectTower.route.js";

// Website Routes
import { WebsiteRoutes } from "./website/website.route.js";
// keep new routes under
import { CountryRoutes } from "./country/country.route.js";
import { citySectionRoutes } from "./citiesSection/citiesSection.route.js";
import { CitiesContentDetailsRoutes } from "./citiesContentDetails/citiesContentDetails.route.js";
import { GalleriesListRoutes } from "./galleriesByType/galleriesList.route.js";
import { CsrContentDetailsRoutes } from "./csrContentDetails/csrContentDetails.route.js";
import { BlogCategoriesRoutes } from "./blog-categories/blog-categories.route.js";
import { blogFaqRoutes } from "./blogFaq/blogFaq.route.js";
import { ProjectMediaRoutes } from "./projectMedia/projectMedia.route.js";
import { ConstructionGalleryRoutes } from "./constructionGallery/constructionGallery.route.js";
import { projectFaqRoutes } from "./projectFaq/projectFaq.route.js";
import { FaqRoutes } from "./Faq/faq.route.js";
import { WhyIndiaRoutes } from "./whyIndia/whyIndia.route.js";
import { SeoRoutes } from "./seo/seo.routes.js";
import { SeoPageRoutes } from "./seoPage/seoPage.route.js";
import { SeoFooterLinkRoutes } from "./footerLink/seoFooterLink.route.js";
import { AmenitiesRoutes } from "./amenities/amenities.route.js";
import { LocalityRoutes } from "./locality/locality.route.js";
import { StateRoutes } from "./state/state.route.js";
import { BrandsRoutes } from "./brands/brands.route.js";
import { ContentByTypeRoutes } from "./contentByType/contentByType.route.js";
import { CsrContentGalleriesRoutes } from "./csrContentGalleries/csrContentGalleries.route.js";

// new routes
import {PartnerCategoriesRoutes} from "./partnerCategories/partnerCategories.route.js";
import {PartnersRoutes} from "./partner/partners.route.js";


const router = Router();

router.use("/admin/auth", authRoutes);
router.use("/admin/pages", authenticate, pageRoutes);
router.use("/admin/page-sections", authenticate, pageSectionsRoutes);
router.use("/admin/team", authenticate, TeamRoutes);
router.use("/admin/values", authenticate, ValuesRoutes);
router.use("/admin/timeline", authenticate, TimelineRoutes);
router.use("/admin/country", authenticate, CountryRoutes);
router.use("/admin/state", authenticate, StateRoutes);
router.use("/admin/cities", authenticate, CitiesRoutes);
router.use("/admin/cities-section", authenticate, citySectionRoutes);
router.use("/admin/content-values", authenticate, CitiesContentDetailsRoutes);
router.use("/admin/news", authenticate, NewsRoutes);
router.use("/admin/social-links", authenticate, SocialLinkRoutes);
router.use("/admin/upload", authenticate, UploadRoutes);
router.use("/admin/platter", authenticate, PlatterRoutes);
router.use("/admin/typology", authenticate, TypologyRoutes);
router.use("/admin/subtypology", authenticate, SubTypologyRoutes);
router.use("/admin/typologymapping", authenticate, MappingTypologyRoutes);
router.use("/admin/blog-categories", authenticate, BlogCategoriesRoutes);
router.use("/admin/blogs", authenticate, BlogRoutes);
router.use("/admin/blog-faq", authenticate, blogFaqRoutes);
router.use("/admin/galleries", authenticate, GalleriesListRoutes);
router.use("/admin/jobs", authenticate, JobRoutes);
router.use("/admin/csr-communities", authenticate, CsrContentDetailsRoutes);
router.use("/admin/csr-galleries", authenticate, CsrContentGalleriesRoutes);
router.use("/admin/event-gallery", authenticate, EventGalleryRoutes);
router.use(
  "/admin/construction-gallery",
  authenticate,
  ConstructionGalleryRoutes,
);
router.use("/admin/testimonial", authenticate, TestimonialRoutes);
router.use("/admin/homeloan", authenticate, HomeLoanRoutes);
router.use("/admin/brands", authenticate, BrandsRoutes);
router.use("/admin/faq", authenticate, FaqRoutes);
router.use("/admin/media-coverage", authenticate, MediaCoverageRoutes);
router.use("/admin/media-kit", authenticate, MediaKitRoutes);
router.use("/admin/why-india", authenticate, WhyIndiaRoutes);
router.use("/admin/footer-links", authenticate, SeoFooterLinkRoutes);
router.use("/admin/seo-pages", authenticate, SeoPageRoutes);
router.use("/admin/amenities", authenticate, AmenitiesRoutes);
router.use("/admin/locality", authenticate, LocalityRoutes);
router.use("/admin/content-list", authenticate, ContentByTypeRoutes);

// project routes
router.use("/admin/project", authenticate, projectRoutes);
router.use("/admin/project-sections", authenticate, projectSectionsRoutes);
router.use("/admin/project-banner", authenticate, ProjectBannerRoutes);
router.use("/admin/project-amenities", authenticate, ProjectAmenitiesRoutes);
router.use("/admin/project-media", authenticate, ProjectMediaRoutes);
router.use("/admin/project-gallery", authenticate, projectGalleryRoutes);
router.use("/admin/project-floorplan", authenticate, projectFloorplanRoutes);
router.use("/admin/project-faq", authenticate, projectFaqRoutes);
router.use("/admin/project-location", authenticate, projectLocationAdvRoutes);
router.use("/admin/project-status", authenticate, ProjectStatusRoutes);
router.use("/admin/project-rera", authenticate, projectReraRoutes);
router.use("/admin/project-content-details", authenticate, projectContentDetailsRoutes);
router.use("/admin/project-tower", authenticate, ProjectTowerRoutes);

// above new routes--------------------------------

router.use("/admin/career-gallery", authenticate, CareerGalleryRoutes);
router.use("/admin/office-locations", authenticate, OfficeLocationRoutes);
router.use("/admin/awards", authenticate, AwardsRoutes);
router.use("/admin/investor-tabs", authenticate, investorTabsRoutes);
router.use("/admin/investor-documents", authenticate, investorDocumentsRoutes);
router.use("/admin/instagram-reel", authenticate, InstagramReelRoutes);
router.use("/admin/enquiry", authenticate, EnquiriesRoutes);
router.use("/admin/menu", authenticate, menuItemRoutes);

// new routes ---------------
router.use("/admin/partner-categories", authenticate, PartnerCategoriesRoutes)
router.use("/admin/partner", authenticate, PartnersRoutes)
// Website Routes
router.use("/website", WebsiteRoutes);
router.use("/seo", SeoRoutes);

export default router;
