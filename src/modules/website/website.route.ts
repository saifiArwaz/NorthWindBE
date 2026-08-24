import { Router } from "express";
import * as websiteCtrl from "./website.controller.js";
import * as projectCtrl from "./project.controller.js";
import * as streamCtrl from "../streamFile/stream.controller.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createJobApplicationSchema,
  createNewsLetterEnquirySchema,
  createContactEnquirySchema,
  createProjectEnquirySchema,
  createOrangeCircleEnquirySchema,
  createChannelPartnerEnquirySchema,
} from "./enquiry.schema.js";
import { EnquiryFlowRoutes } from "../enquiry-flow/enquiry-flow.route.js";

const router = Router();

router.use("/enquiry-flow", EnquiryFlowRoutes);

// files handling
router.get("/files/*", websiteCtrl.getFileHandling);
// instagram reels (website)
router.get("/instagram-reels", websiteCtrl.getInstagramReels);

// ----------------------new routes start here------------------
router.get("/page/:slug", websiteCtrl.getPageBySlug);
router.get("/page-section/:type", websiteCtrl.getPageSectionsByType);
router.get("/values", websiteCtrl.getHomeValue);
router.get("/awards-year", websiteCtrl.getAwardsYear);
router.get("/awards", websiteCtrl.getAwards);
router.get("/timeline", websiteCtrl.getTimelines);
router.get("/blogs/latest", websiteCtrl.getLatestBlogs);
router.get("/blogs-categories", websiteCtrl.getBlogsCategories);
router.get("/blogs", websiteCtrl.getBlogs);
router.get("/blog/:slug", websiteCtrl.getBlogBySlug);
router.get("/blog/:blogId/faqs", websiteCtrl.getBlogFaqsByBlogId);
router.get("/media-coverage", websiteCtrl.getMediaCoverage);
router.get("/blogs/:categoryId", websiteCtrl.getBlogsByCategoryId);
router.get("/blogs/:slug/related", websiteCtrl.getRelatedBlogs);
router.get("/team", websiteCtrl.getTeam);
router.get("/faq/:type", websiteCtrl.getFaqsByType);
router.get("/faq", websiteCtrl.getFaqs);
router.get("/csr-communities", websiteCtrl.getCsrContent);
router.get("/csr-galleries", websiteCtrl.getCsrContentGalleries);
// router.get("/csr-galleries/:type", websiteCtrl.getCsrContentByType);
router.get("/galleries/:type", websiteCtrl.getGalleriesByType);
router.get("/under-construction", websiteCtrl.getUnderConstruction);
router.get("/media-kit", websiteCtrl.getMediakit);
router.get("/download", websiteCtrl.downloadMediaKitFile);
router.get("/platter", websiteCtrl.getPlatter);
router.get("/platter/:platterSlug", websiteCtrl.getPlatterBySlug);
router.get("/sub-typology", websiteCtrl.getProjectSubTypology);
router.get("/social-links", websiteCtrl.getSocialLinks);
router.get("/testimonials", websiteCtrl.getTestimonials);
router.get("/home-loan", websiteCtrl.getHomeLoan);
router.get("/home-loan-assistance", websiteCtrl.getHomeLoanAssistance);
router.get("/partners", websiteCtrl.getPartners);
router.get("/events", websiteCtrl.getEvents);
router.get("/events/featured-galleries", websiteCtrl.getFeaturedGalleries);
router.get("/events/:eventSlug/category/:categorySlug", websiteCtrl.getCategoryGalleries);
router.get("/brands", websiteCtrl.getBrands);
router.get("/nri-why-us", websiteCtrl.getNriWhyUs);
router.get("/investor-tabs", websiteCtrl.getInvestorTabs);
router.get(
  "/investor-documents",
  websiteCtrl.getInvestorDocuments,
);
router.get("/city/:citySlug", websiteCtrl.getCityBySlug);
router.get(
  "/cities-ecosystem-lifestyle/:type",
  websiteCtrl.getCitiesEcosystemLifestyle,
);
router.get("/jobs", websiteCtrl.getJobs);
router.get("/content-list/:type", websiteCtrl.getContetByType);

// projects routes-------------------
router.get("/projects", projectCtrl.getProjects);
router.get(
  "/project/:projectId/galleries",
  projectCtrl.getProjectGalleriesByProjectId,
);
router.get(
  "/project/:projectId/amenities",
  projectCtrl.getProjectAmenitiesByProjectId,
);
router.get(
  "/project/:projectId/floor-plans",
  projectCtrl.getProjectFloorPlansByProjectId,
);
router.get(
  "/project/:projectId/medias",
  projectCtrl.getProjectMediasByProjectId,
);
router.get(
  "/project/:projectId/location-advantage",
  projectCtrl.getProjectLocationAdvantageByProjectId,
);
router.get("/project/:projectId/faqs", projectCtrl.getProjectFaqsByProjectId);
router.get("/project/:projectId/rera", projectCtrl.getProjectReraByProjectId);
router.get(
  "/project/:projectId/project-content-details",
  projectCtrl.getProjectContentDetailsByType,
);
router.get(
  "/project/:projectId/towers",
  projectCtrl.getProjectTowersByProjectId,
);
router.get(
  "/project/:projectId/construction-updates",
  projectCtrl.getProjectConstructionUpdates,
);
router.get("/project/:platterSlug/:slug", projectCtrl.getProjectDetailsBySlug);

// filters routers
router.get("/filter/project", websiteCtrl.getFilterProjectsWithGallery);
router.get("/filter/platter", websiteCtrl.getFilterPlatter);
router.get("/filter/location", websiteCtrl.getFilterLocations);
router.get("/filter/sub-typology", websiteCtrl.getFilterSubTypology);
router.get("/filter/project-status", websiteCtrl.getFilterProjectStatus);
router.get("/filter/budget", websiteCtrl.getFilterBudget);
router.get("/filter/job", websiteCtrl.getFilterJobs);
router.get("/filter/towers/:projectId", websiteCtrl.getFilterTowers);
router.get("/filter/construction-years/:projectId", websiteCtrl.getFilterConstructionYears);


// ---------------------------- new service end here ----------------------------

// projects routes
router.get("/platter/:platterSlug", websiteCtrl.getProjectsByPlatterSlug);
router.get("/projects/feature", websiteCtrl.getFeatureProjects);
router.get("/projects/name-slug", websiteCtrl.getProjectsNameAndSlug);
router.get("/projects/:platter", websiteCtrl.getProjectByPlatter);

router.get("/career-gallery", websiteCtrl.getCareerGalleries);

router.get("/office-location", websiteCtrl.getOfficesLocation);
router.get("/news", websiteCtrl.getNews);

router.post("/start", streamCtrl.startMultipart);
router.put("/part-url", streamCtrl.getPartUrl);
router.post("/complete", streamCtrl.completeMultipart);
router.get("/platterlist", websiteCtrl.getPlatterForEnquiry);
router.get("/sitemap-pages", websiteCtrl.getSitemap);
router.get("/sitemap-projects", websiteCtrl.getSitemapProjectsByStatus);
router.get(
  "/projectlocation/:platter",
  websiteCtrl.getProjectLocationByPlatter,
);
router.get("/projectlist/:city", websiteCtrl.getProjectsByCity);

router.get(
  "/typology/:typologySlug/subtypology",
  websiteCtrl.getSubTypologyByTypologySlug,
);

// enquiry
router.post(
  "/enquiry/job-application",
  uploadMiddleware("website").single("resume"),
  validate(createJobApplicationSchema),
  websiteCtrl.createJobApplication,
);
router.post(
  "/enquiry/newsletter",
  validate(createNewsLetterEnquirySchema),
  websiteCtrl.createNewsLetterEnquiry,
);
router.post(
  "/enquiry/contact",
  validate(createContactEnquirySchema),
  websiteCtrl.createContactEnquiry,
);

router.post(
  "/enquiry/project",
  validate(createProjectEnquirySchema),
  websiteCtrl.createProjectEnquiry,
);

router.post(
  "/enquiry/channel-partner",
  validate(createChannelPartnerEnquirySchema),
  websiteCtrl.createChannelPartnerEnquiry,
);

export { router as WebsiteRoutes };
