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
import { EventCategoryRoutes } from "./eventCategory/eventCategory.route.js";
import { eventRoutes } from "./event/event.route.js";
import { JobRoutes } from "./job/job.route.js";
import { BlogRoutes } from "./blogs/blogs.route.js";
import { TestimonialRoutes } from "./testimonial/testimonial.route.js";
import { SocialLinkRoutes } from "./socialLink/socialLink.route.js";
import { MediaCoverageRoutes } from "./mediaCoverage/mediaCoverage.route.js";
import { MediaKitRoutes } from "./mediaKit/mediaKit.route.js";
import { AwardsRoutes } from "./awards/awards.route.js";
import { UploadRoutes } from "./upload/upload.route.js";
import { investorDocumentsRoutes } from "./investorDocument/investorDocument.route.js";
import { InstagramReelRoutes } from "./instagramReel/instagramReel.route.js";
import { EnquiriesRoutes } from "./enquiry/enquiry.route.js";
import { HomeLoanRoutes } from "./homeloan/homeloan.route.js";
import { HomeLoanAssistanceRoutes } from "./homeLoanAssistance/homeLoanAssistance.route.js";

// projects
import { projectRoutes } from "./projects/project.route.js";
import { projectSectionsRoutes } from "./projectSection/projectSections.route.js";
import { ProjectBannerRoutes } from "./projectBanner/projectBanner.route.js";
import { ProjectAmenitiesRoutes } from "./projectAmenities/projectAmenities.route.js";
import { projectGalleryRoutes } from "./projectGallery/projectGallery.route.js";
import { projectFloorplanRoutes } from "./projectFloorplan/projectFloorplan.route.js";
import { projectLocationAdvRoutes } from "./projectLocationAdvantage/projectLocationAdvantage.route.js";
import { menuItemRoutes } from "./menu/menu.route.js";
import projectContentDetailsRoutes from "./projectContentDetails/projectContentDetails.route.js";
import { ProjectTowerRoutes } from "./projectTower/projectTower.route.js";
import { ProjectZoneRoutes } from "./projectZone/projectZone.route.js";

// Website Routes
import { WebsiteRoutes } from "./website/website.route.js";
// keep new routes under
import { GalleriesListRoutes } from "./galleriesByType/galleriesList.route.js";
import { ConstructionGalleryRoutes } from "./constructionGallery/constructionGallery.route.js";
import { FaqRoutes } from "./Faq/faq.route.js";
import { SeoRoutes } from "./seo/seo.routes.js";
import { SeoPageRoutes } from "./seoPage/seoPage.route.js";
import { SeoFooterLinkRoutes } from "./footerLink/seoFooterLink.route.js";
import { BrandsRoutes } from "./brands/brands.route.js";
import { ContentByTypeRoutes } from "./contentByType/contentByType.route.js";

// new routes
import {PartnersRoutes} from "./partner/partners.route.js";
import { projectFaqRoutes } from "./projectFaq/projectFaq.route.js";
import { projectMasterPlanCategoryRoutes } from "./projectMasterPlanCategory/projectMasterPlanCategory.route.js";
import { projectMasterPlanPinRoutes } from "./projectMasterPlanPin/projectMasterPlanPin.route.js";
import { projectMasterPlanPinGalleryRoutes } from "./projectMasterPlanPinGallery/projectMasterPlanPinGallery.route.js";
import { CsrCategoryRoutes } from "./csrCategory/csrCategory.route.js";
import { CsrGalleryRoutes } from "./csrGallery/csrGallery.route.js";
import { LegacyProjectRoutes } from "./legacyProjects/legacyProjects.route.js";

const router = Router();

router.use("/admin/auth", authRoutes);
router.use("/admin/pages", authenticate, pageRoutes);
router.use("/admin/page-sections", authenticate, pageSectionsRoutes);
router.use("/admin/team", authenticate, TeamRoutes);
router.use("/admin/values", authenticate, ValuesRoutes);
router.use("/admin/timeline", authenticate, TimelineRoutes);
router.use("/admin/cities", authenticate, CitiesRoutes);
router.use("/admin/social-links", authenticate, SocialLinkRoutes);
router.use("/admin/upload", authenticate, UploadRoutes);
router.use("/admin/platter", authenticate, PlatterRoutes);
router.use("/admin/typology", authenticate, TypologyRoutes);
router.use("/admin/subtypology", authenticate, SubTypologyRoutes);
router.use("/admin/typologymapping", authenticate, MappingTypologyRoutes);
router.use("/admin/blogs", authenticate, BlogRoutes);
router.use("/admin/galleries", authenticate, GalleriesListRoutes);
router.use("/admin/jobs", authenticate, JobRoutes);
router.use("/admin/event-gallery", authenticate, EventGalleryRoutes);
router.use("/admin/event-category", authenticate, EventCategoryRoutes);
router.use("/admin/events", authenticate, eventRoutes);
router.use(
  "/admin/construction-gallery",
  authenticate,
  ConstructionGalleryRoutes,
);
router.use("/admin/testimonial", authenticate, TestimonialRoutes);
router.use("/admin/homeloan", authenticate, HomeLoanRoutes);
router.use("/admin/homeloan-assistance", authenticate, HomeLoanAssistanceRoutes);
router.use("/admin/brands", authenticate, BrandsRoutes);
router.use("/admin/faq", authenticate, FaqRoutes);
router.use("/admin/media-coverage", authenticate, MediaCoverageRoutes);
router.use("/admin/media-kit", authenticate, MediaKitRoutes);
router.use("/admin/footer-links", authenticate, SeoFooterLinkRoutes);
router.use("/admin/seo-pages", authenticate, SeoPageRoutes);
router.use("/admin/content-list", authenticate, ContentByTypeRoutes);

// project routes
router.use("/admin/project", authenticate, projectRoutes);
router.use("/admin/project-sections", authenticate, projectSectionsRoutes);
router.use("/admin/project-banner", authenticate, ProjectBannerRoutes);
router.use("/admin/project-amenities", authenticate, ProjectAmenitiesRoutes);
router.use("/admin/project-gallery", authenticate, projectGalleryRoutes);
router.use("/admin/project-floorplan", authenticate, projectFloorplanRoutes);
router.use("/admin/project-location", authenticate, projectLocationAdvRoutes);
router.use("/admin/project-status", authenticate, ProjectStatusRoutes);
router.use("/admin/project-content-details", authenticate, projectContentDetailsRoutes);
router.use("/admin/project-tower", authenticate, ProjectTowerRoutes);
router.use("/admin/project-zone", authenticate, ProjectZoneRoutes);
router.use("/admin/project-faq", authenticate, projectFaqRoutes);
router.use("/admin/project-master-plan-category", authenticate, projectMasterPlanCategoryRoutes);
router.use("/admin/project-master-plan-pin", authenticate, projectMasterPlanPinRoutes);
router.use("/admin/project-master-plan-pin-gallery", authenticate, projectMasterPlanPinGalleryRoutes);
router.use("/admin/csr-category", authenticate, CsrCategoryRoutes);
router.use("/admin/csr-gallery", authenticate, CsrGalleryRoutes);

// above new routes--------------------------------
router.use("/admin/awards", authenticate, AwardsRoutes);
router.use("/admin/investor-documents", authenticate, investorDocumentsRoutes);
router.use("/admin/instagram-reel", authenticate, InstagramReelRoutes);
router.use("/admin/enquiry", authenticate, EnquiriesRoutes);
router.use("/admin/menu", authenticate, menuItemRoutes);

// new routes ---------------
router.use("/admin/partner", authenticate, PartnersRoutes);
router.use("/admin/legacy-projects", authenticate, LegacyProjectRoutes);
router.use("/admin/past-projects", authenticate, LegacyProjectRoutes);
// Website Routes
router.use("/website", WebsiteRoutes);
router.use("/seo", SeoRoutes);

export default router;
