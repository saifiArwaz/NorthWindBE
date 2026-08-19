import asyncHandler from "express-async-handler";
import logger from "../../utils/logger.utils.js";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import * as websiteServices from "./website.service.js";
import { successResponse } from "../../utils/responseHandler.utils.js";
import { ApiError } from "../../utils/apiError.utils.js";
import {
  getPresignedUrl,
  getFileUrl,
  getPresignedUrlForDownload,
} from "../../utils/fileHandling.utils.js";
import {
  getValidInstagramToken,
  refreshInstagramToken,
} from "../instagramReel/instagramToken.service.js";
import axios from "axios";
import { getSalesforceToken } from "../../utils/salesforce.utils.js";
import { sendEmail } from "../../utils/email.utils.js";

// new controller start here
export const getPageBySlug = asyncHandler(
  async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;

    const page = await websiteServices.getPageBySlug(slug);
    if (page) {
      if (page.files && typeof page.files === "object") {
        for (const key of Object.keys(page.files as any)) {
          const value = (page.files as any)[key];
          if (value) {
            (page.files as any)[key] = await getFileUrl(value);
          }
        }
      }
      // Sections
      if (
        page.sections &&
        typeof page.sections === "object" &&
        !Array.isArray(page.sections)
      ) {
        await Promise.all(
          Object.values(page.sections).map(async (section: any) => {
            if (section && section.files && typeof section.files === "object") {
              for (const key of Object.keys(section.files as any)) {
                const value = (section.files as any)[key];
                if (value) {
                  (section.files as any)[key] = await getFileUrl(value);
                }
              }
            }
          }),
        );
      }
    }
    successResponse(res, 200, "Page fetched successfully", page);
  },
);

export const getPageSectionsByType = asyncHandler(
  async (req: Request<{ type: string }>, res: Response) => {
    const type = req.params.type as string;

    if (!type) {
      throw new ApiError(400, "Type parameter is required");
    }

    const sections = await websiteServices.getPageSectionsByType(type);

    await Promise.all(
      sections.map(async (section: any) => {
        for (const key of Object.keys(section.files as any)) {
          const value = (section.files as any)[key];
          if (value) {
            (section.files as any)[key] = await getFileUrl(value);
          }
        }
      }),
    );

    successResponse(res, 200, "Page sections fetched successfully", sections);
  },
);

export const getHomeValue = asyncHandler(
  async (req: Request, res: Response) => {
    const homeValue = await websiteServices.getHomeValue();
    await Promise.all(
      homeValue.map(async (homeValue: any) => {
        for (const key of Object.keys(homeValue.files as any)) {
          const value = (homeValue.files as any)[key];
          if (value) {
            (homeValue.files as any)[key] = await getFileUrl(value);
          }
        }
      }),
    );
    successResponse(res, 200, "Home value fetched successfully", homeValue);
  },
);

export const getAwards = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  const year =
    typeof req.query.year === "string" && req.query.year.trim()
      ? req.query.year
          .split(",")
          .map((y) => parseInt(y.trim(), 10))
          .filter((y) => Number.isInteger(y))
      : [];
  const filter: any = {};

  if (search) {
    filter.search = search;
  }

  if (year?.length) {
    filter.year = year;
  }

  const awards = await websiteServices.getAwards(page, limit, filter);

  if (awards?.data?.length) {
    await Promise.all(
      awards.data.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          await Promise.all(
            Object.entries(item.files).map(
              async ([key, value]: [string, any]) => {
                if (value) {
                  (item.files as any)[key] = await getFileUrl(value);
                }
              },
            ),
          );
        }
      }),
    );
  }

  successResponse(res, 200, "Awards fetched successfully", awards);
});

export const getAwardsYear = asyncHandler(
  async (req: Request, res: Response) => {
    const awards = await websiteServices.getAwardsYear();
    successResponse(res, 200, "Awards Year fetched successfully", awards);
  },
);

export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const isLatest =
    req.query.isLatest !== undefined
      ? req.query.isLatest === "true" || (req.query.isLatest as unknown) === true
      : undefined;
  const isFeature =
    req.query.isFeature !== undefined
      ? req.query.isFeature === "true" || (req.query.isFeature as unknown) === true
      : undefined;
  const isHome =
    req.query.isHome !== undefined
      ? req.query.isHome === "true" || (req.query.isHome as unknown) === true
      : undefined;
  const categoryId =
    typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;

  const filter: any = {};
  if (search) {
    filter.search = search;
  }
  if (isLatest !== undefined) {
    filter.isLatest = isLatest;
  }
  if (isFeature !== undefined) {
    filter.isFeature = isFeature;
  }
  if (isHome !== undefined) {
    filter.isHome = isHome;
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  const blogs = await websiteServices.getBlogs(page, limit, filter);

  let items: unknown = blogs;
  if (
    blogs &&
    typeof blogs === "object" &&
    "data" in blogs &&
    Array.isArray((blogs as any).data)
  ) {
    items = (blogs as any).data;
  }

  if (items && Array.isArray(items)) {
    if (search) {
      const searchLower = search.toLowerCase();
      (items as any) = items.filter(
        (item: any) =>
          typeof item.title === "string" &&
          item.title.toLowerCase().includes(searchLower),
      );
    }

    await Promise.all(
      items.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
  }

  if (
    blogs &&
    typeof blogs === "object" &&
    "data" in blogs &&
    Array.isArray((blogs as any).data)
  ) {
    (blogs as any).data = items;
  }

  successResponse(res, 200, "Blogs fetched successfully", blogs);
});

export const getBlogsByCategoryId = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!categoryId) {
      throw new ApiError(400, "Category ID is required");
    }

    const blogs = await websiteServices.getBlogsByCategoryId(categoryId as string, page, limit);
    successResponse(res, 200, "Blogs fetched successfully", blogs);
  },
);

export const getRelatedBlogs = asyncHandler(
  async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!slug) {
      throw new ApiError(400, "Blog slug is required");
    }
    const blogs = await websiteServices.getRelatedBlogs(slug, page, limit);

    successResponse(res, 200, "Related blogs fetched successfully", blogs);
  },
);

export const getMediaCoverage = asyncHandler(
  async (req: Request, res: Response) => {
    const { mediaType, isHome,  } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter: any = {};
    if (mediaType) {
      filter.mediaType = mediaType;
    }
    if (isHome) {
      filter.isHome = isHome;
    }

    const mediaCoverageResult = await websiteServices.getMediaCoverage?.(
      filter,
      page,
      limit,
    );

    const mediaCoverage = Array.isArray(mediaCoverageResult?.data)
      ? mediaCoverageResult.data
      : Array.isArray(mediaCoverageResult)
        ? mediaCoverageResult
        : [];

    await Promise.all(
      mediaCoverage.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    if (
      mediaCoverageResult &&
      typeof mediaCoverageResult === "object" &&
      Array.isArray(mediaCoverageResult.data)
    ) {
      mediaCoverageResult.data = mediaCoverage;
      successResponse(
        res,
        200,
        "Media coverage fetched successfully",
        mediaCoverageResult,
      );
    } else {
      successResponse(
        res,
        200,
        "Media coverage fetched successfully",
        mediaCoverage,
      );
    }
  },
);

export const getBlogBySlug = asyncHandler(
  async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;

    const blog = await websiteServices.getBlogBySlug(slug);
    if (blog) {
      for (const key of Object.keys(blog.files as any)) {
        const value = (blog.files as any)[key];
        if (value) {
          (blog.files as any)[key] = await getFileUrl(value);
        }
      }
    }
    successResponse(res, 200, "Blog fetched successfully", blog);
  },
);

export const getLatestBlogs = asyncHandler(
  async (req: Request, res: Response) => {
    const latestBlogs = await websiteServices.getLatestBlogs();
    if (latestBlogs && Array.isArray(latestBlogs)) {
      for (const blog of latestBlogs) {
        if (blog.files) {
          for (const key of Object.keys(blog.files as any)) {
            const value = (blog.files as any)[key];
            if (value) {
              (blog.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }
    }
    successResponse(res, 200, "Latest blog fetched successfully", latestBlogs);
  },
);

export const getBlogFaqsByBlogId = asyncHandler(
  async (req: Request<{ blogId: string }>, res: Response) => {
    const { blogId } = req.params;
    const faqs = await websiteServices.getBlogFaqsByBlogId(blogId);
    successResponse(res, 200, "Blog FAQs fetched successfully", faqs);
  },
);

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const isFounder = req.query.isFounder as string;

  const team = await websiteServices.getTeam(isFounder);
  await Promise.all(
    team.map(async (item: any) => {
      if (item.files && typeof item.files === "object") {
        for (const key of Object.keys(item.files as any)) {
          const value = (item.files as any)[key];
          if (value) {
            (item.files as any)[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );
  successResponse(res, 200, "Team fetched successfully", team);
});

export const getTimelines = asyncHandler(
  async (req: Request, res: Response) => {
    const timelines = await websiteServices.getTimelines();
    await Promise.all(
      timelines.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const key of Object.keys(item.files as any)) {
            const value = (item.files as any)[key];
            if (value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
    successResponse(res, 200, "Timelines fetched successfully", timelines);
  },
);

export const getFaqsByType = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.params.type;

    if (!type) {
      throw new ApiError(400, "Type query parameter is required");
    }

    const records = await websiteServices.getFaqsByType(type as string);

    successResponse(res, 200, "Faqs fetched successfully", records);
  },
);

export const getFaqs = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const records = await websiteServices.getFaqs(type);
    successResponse(res, 200, "Faqs fetched successfully", records);
  }
);

export const getCsrContentGalleries = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const galleries = await websiteServices.getCsrContentGalleries(type);
    await Promise.all(
      galleries.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const key of Object.keys(item.files as any)) {
            const value = (item.files as any)[key];
            if (value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
    successResponse(res, 200, "Csr content galleries fetched successfully", galleries);
  },
);

export const getCsrContent = asyncHandler(
  async (req: Request, res: Response) => {
    const records = await websiteServices.getCsrContent();

    await Promise.all(
      records.map(async (item: any) => {
        // 1. transform top-level files
        if (item.files && typeof item.files === "object") {
          for (const key of Object.keys(item.files)) {
            const value = item.files[key];
            if (value) {
              item.files[key] = await getFileUrl(value);
            }
          }
        }

        // 2. transform csrContentGalleries files
        if (Array.isArray(item.csrContentGalleries)) {
          await Promise.all(
            item.csrContentGalleries.map(async (gallery: any) => {
              if (gallery.files && typeof gallery.files === "object") {
                for (const key of Object.keys(gallery.files)) {
                  const value = gallery.files[key];
                  if (value) {
                    gallery.files[key] = await getFileUrl(value);
                  }
                }
              }
            }),
          );
        }
      }),
    );
    successResponse(res, 200, "Csr content fetched successfully", records);
  },
);

export const getGalleriesByType = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.params.type;
    const fileType = req.query.fileType as string | undefined;
    if (!type) {
      throw new ApiError(400, "Type query parameter is required");
    }

    const records = await websiteServices.getGalleriesByType(type as string, fileType);

    await Promise.all(
      records.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const key of Object.keys(item.files as any)) {
            const value = (item.files as any)[key];
            if (value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(res, 200, "Galleries fetched successfully", records);
  },
);

export const getMediakit = asyncHandler(async (req: Request, res: Response) => {
  const mediaKit = await websiteServices.getMediakit?.();
  await Promise.all(
    mediaKit.map(async (item: any) => {
      if (item.logo) {
        item.logo = await getFileUrl(item.logo);
      }
      if (item.listKit && Array.isArray(item.listKit)) {
        await Promise.all(
          item.listKit.map(async (kitItem: any) => {
            if (typeof kitItem?.file === "string" && kitItem.file) {
              kitItem.file = await getFileUrl(kitItem.file);
            }
            if (kitItem?.files && typeof kitItem.files === "object") {
              for (const [key, value] of Object.entries(kitItem.files)) {
                if (typeof value === "string" && value) {
                  (kitItem.files as any)[key] = await getFileUrl(value);
                }
              }
            }
          }),
        );
      }
    }),
  );
  successResponse(res, 200, "Media kit fetched successfully", mediaKit);
});

export const downloadMediaKitFile = asyncHandler(
  async (req: Request, res: Response) => {
    const { file } = req.query;

    if (!file || typeof file !== "string") {
      res.status(400).send("File query parameter is required");
      return;
    }

    let fileKey = file;

    if (fileKey.includes("/files/")) {
      fileKey = fileKey.split("/files/").slice(1).join("/files/");
    } else if (
      fileKey.startsWith("http://") ||
      fileKey.startsWith("https://")
    ) {
      fileKey = fileKey.split("/").at(-1) || "";
    }

    const filePath = path.join(process.cwd(), "uploads", fileKey);

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    } else {
      res.status(404).send("File not found");
    }
  },
);

export const getUnderConstruction = asyncHandler(
  async (req: Request, res: Response) => {
    const year = req.query.year as string;
    const month = req.query.month as string;
    const towerId = req.query.towerId as string;
    const projectSlug = req.query.projectSlug as string;

    const underConstruction = await websiteServices.getUnderConstruction({
      year,
      month,
      towerId,
      projectSlug,
    });
    await Promise.all(
      underConstruction.galleries.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const key of Object.keys(item.files as any)) {
            const value = (item.files as any)[key];
            if (value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
    successResponse(
      res,
      200,
      "Under construction fetched successfully",
      underConstruction,
    );
  },
);

export const getSocialLinks = asyncHandler(
  async (req: Request, res: Response) => {
    const socialLinks = await websiteServices.getSocialLinks?.();
    successResponse(res, 200, "Social links fetched successfully", socialLinks);
  },
);

export const getTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const fileType = req.query.fileType as string | undefined;
    const isFeature =
      req.query.isFeature !== undefined
        ? req.query.isFeature === "true" || (req.query.isFeature as unknown) === true
        : undefined;
    const isHome =
      req.query.isHome !== undefined
        ? req.query.isHome === "true" || (req.query.isHome as unknown) === true
        : undefined;

    const filter: any = {};
    if (type) {
      filter.type = type;
    }
   if (fileType) {
      filter.fileType = fileType;
    }
    if (isFeature !== undefined) {
      filter.isFeature = isFeature;
    }

    if (isHome !== undefined) {
      filter.isHome = isHome;
    }

    const testimonials = await websiteServices.getTestimonials(filter);

    await Promise.all(
      testimonials.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(
      res,
      200,
      "Testimonials fetched successfully",
      testimonials,
    );
  },
);

export const getBlogsCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const records = await websiteServices.getBlogsCategories();

    successResponse(res, 200, "Blogs categories fetched successfully", records);
  },
);

export const getHomeLoan = asyncHandler(async (req: Request, res: Response) => {
  const homeLoan = await websiteServices.getHomeLoan();
  await Promise.all(
    homeLoan.map(async (item: any) => {
      if (item.files && typeof item.files === "object") {
        for (const [key, value] of Object.entries(item.files)) {
          if (typeof value === "string" && value) {
            (item.files as any)[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );

  successResponse(res, 200, "Home Loan fetched successfully", homeLoan);
});


export const getPartners = asyncHandler(async (req: Request, res: Response) => {
  const partners = await websiteServices.getPartners();
  await Promise.all(
    partners.map(async (item: any) => {
      if (item.files && typeof item.files === "object") {
        for (const [key, value] of Object.entries(item.files)) {
          if (typeof value === "string" && value) {
            (item.files as any)[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );

  successResponse(res, 200, "Partners fetched successfully", partners);
});
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const eventSlug = (req.query.eventSlug as string) || undefined;

  const records = await websiteServices.getEvents(page, limit, eventSlug);

  // Helper to process files for an event array
  const processFiles = async (event: any) => {
    // 1. Process category cover images (if album)
    if (event.categories && Array.isArray(event.categories)) {
      await Promise.all(
        event.categories.map(async (category: any) => {
          if (category.files && typeof category.files === "object") {
            await Promise.all(
              Object.keys(category.files).map(async (key) => {
                if (category.files[key]) {
                  category.files[key] = await getFileUrl(category.files[key]);
                }
              })
            );
          }
        })
      );
    }

    // 2. Process direct gallery images (if gallery event)
    if (event.galleries && Array.isArray(event.galleries)) {
      await Promise.all(
        event.galleries.map(async (gallery: any) => {
          if (gallery.files && typeof gallery.files === "object") {
            await Promise.all(
              Object.keys(gallery.files).map(async (key) => {
                if (gallery.files[key]) {
                  gallery.files[key] = await getFileUrl(gallery.files[key]);
                }
              })
            );
          }
        })
      );
    }
  };

  await Promise.all(records.data.map((record: any) => processFiles(record)));

  successResponse(
    res,
    200,
    "Events fetched successfully",
    records,
  );
});

export const getCategoryGalleries = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await websiteServices.getCategoryGalleries(slug, page, limit);

  if (!result) {
    throw new ApiError(404, "Category not found");
  }

  // Process category files
  if (result.category.files && typeof result.category.files === "object") {
    const filesObj = result.category.files as Record<string, any>;
    await Promise.all(
      Object.keys(filesObj).map(async (key) => {
        if (filesObj[key]) {
          filesObj[key] = await getFileUrl(filesObj[key]);
        }
      })
    );
  }

  // Process galleries files
  if (result.galleries && Array.isArray(result.galleries)) {
    await Promise.all(
      result.galleries.map(async (gallery: any) => {
        if (gallery.files && typeof gallery.files === "object") {
          await Promise.all(
            Object.keys(gallery.files).map(async (key) => {
              if (gallery.files[key]) {
                gallery.files[key] = await getFileUrl(gallery.files[key]);
              }
            })
          );
        }
      })
    );
  }

  successResponse(
    res,
    200,
    "Category galleries fetched successfully",
    result,
  );
});

export const getFeaturedGalleries = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await websiteServices.getFeaturedGalleries(page, limit);

  // Process galleries files
  if (result.data && Array.isArray(result.data)) {
    await Promise.all(
      result.data.map(async (gallery: any) => {
        if (gallery.files && typeof gallery.files === "object") {
          await Promise.all(
            Object.keys(gallery.files).map(async (key) => {
              if (gallery.files[key]) {
                gallery.files[key] = await getFileUrl(gallery.files[key]);
              }
            })
          );
        }
      })
    );
  }

  successResponse(
    res,
    200,
    "Featured event galleries fetched successfully",
    result,
  );
});

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await websiteServices.getBrands();
  await Promise.all(
    brands.map(async (item: any) => {
      if (item.files && typeof item.files === "object") {
        for (const [key, value] of Object.entries(item.files)) {
          if (typeof value === "string" && value) {
            (item.files as any)[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );

  successResponse(res, 200, "Brands fetched successfully", brands);
});

export const getNriWhyUs = asyncHandler(async (req: Request, res: Response) => {
  const nriIndia = await websiteServices.getNriWhyUs();

  await Promise.all(
    nriIndia.map(async (item: any) => {
      if (item.files && typeof item.files === "object") {
        for (const [key, value] of Object.entries(item.files)) {
          if (typeof value === "string" && value) {
            (item.files as any)[key] = await getFileUrl(value);
          }
        }
      }
    }),
  );

  successResponse(res, 200, "NRI Why Us fetched successfully", nriIndia);
});

export const getInvestorTabs = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await websiteServices.getInvestorTabs();

    await Promise.all(
      record.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(res, 200, "NRI Why Us fetched successfully", record);
  },
);

export const getInvestorDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await websiteServices.getInvestorDocuments();

    await Promise.all(
      record.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(
      res,
      200,
      "Investor Documents fetched successfully",
      record,
    );
  },
);

// -----------------START MICROSITE ----------------------

export const getPlatter = asyncHandler(async (req: Request, res: Response) => {
  const platters = await websiteServices.getPlatters();
  await Promise.all(
    platters.map(async (item: any) => {
      for (const key of Object.keys(item.files as any)) {
        const value = (item.files as any)[key];
        if (value) {
          (item.files as any)[key] = await getFileUrl(value);
        }
      }
    }),
  );
  successResponse(res, 200, "Platters fetched successfully", platters);
});

export const getPlatterBySlug = asyncHandler(
  async (req: Request<{ platterSlug: string }>, res: Response) => {
    const { platterSlug } = req.params;

    if (!platterSlug) {
      throw new ApiError(400, "platterSlug parameter is required");
    }

    const platter = await websiteServices.getPlatterBySlug(platterSlug);
    const platterData = platter?.files;
    if (platterData) {
      for (const key of Object.keys(platterData as any)) {
        const value = (platterData as any)[key];
        if (value) {
          (platterData as any)[key] = await getFileUrl(value);
        }
      }
    }

    successResponse(res, 200, "Platter fetched successfully", platter);
  },
);

export const getCityBySlug = asyncHandler(
  async (req: Request<{ citySlug: string }>, res: Response) => {
    const { citySlug } = req.params;

    if (!citySlug) {
      throw new ApiError(400, "citySlug parameter is required");
    }

    const cities = await websiteServices.getCities(citySlug);

    if (cities) {
      // Logic removed because city files and CitySection were removed from schema
    }
    successResponse(res, 200, "Cities fetched successfully", cities);
  },
);

export const getCitiesEcosystemLifestyle = asyncHandler(
  async (
    req: Request<{ citySlug: string; type: string }>, // <-- ✅ ADD THIS LINE
    res: Response,
  ) => {
    const { type } = req.params;

    const data = await websiteServices.getCitiesEcosystemLifestyle(type);
    await Promise.all(
      data.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );
    successResponse(
      res,
      200,
      "Cities ecosystem lifestyle fetched successfully",
      data,
    );
  },
);

export const getProjectSubTypology = asyncHandler(
  async (req: Request, res: Response) => {
    const cities = await websiteServices.getProjectSubTypology();
    successResponse(res, 200, "Typology fetched successfully", cities);
  },
);

// filter - controller
export const getFilterPlatter = asyncHandler(
  async (req: Request, res: Response) => {
    const platters = await websiteServices.getFilterPlatter();
    successResponse(res, 200, "Platters fetched successfully", platters);
  },
);

export const getFilterProjectsWithGallery = asyncHandler(
  async (req: Request, res: Response) => {
    const projects = await websiteServices.getFilterProjectsWithGallery();
    successResponse(res, 200, "Projects fetched successfully", projects);
  },
);

export const getFilterLocations = asyncHandler(
  async (req: Request, res: Response) => {
    const locations = await websiteServices.getLocations();
    successResponse(res, 200, "Locations fetched successfully", locations);
  },
);

export const getFilterSubTypology = asyncHandler(
  async (req: Request, res: Response) => {
    const subTypologies = await websiteServices.getFilterSubTypology();
    successResponse(
      res,
      200,
      "Sub Typology fetched successfully",
      subTypologies,
    );
  },
);

export const getFilterProjectStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const projectstatus = await websiteServices.getFilterProjectStatus();
    successResponse(res, 200, "Project Status Successfully", projectstatus);
  },
);

export const getFilterBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const budgets = await websiteServices.getFilterBudget();
    successResponse(res, 200, "Budgets fetched successfully", budgets);
  },
);
// ------------------- project filter end---------------------

export const getFilterJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = await websiteServices.getFilterJobs();
    successResponse(res, 200, "Job filters fetched successfully", filters);
  },
);

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const {  jobType, search } = req.query;

  const filters = {
    jobType: typeof jobType === "string" ? jobType : undefined,
    search: typeof search === "string" ? search : undefined,
  };

  const jobs = await websiteServices.getJobs(page, limit, filters);
  successResponse(res, 200, "Jobs fetched successfully", jobs);
});

export const getContetByType = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.params.type as string;
    const query = req.query;
    const data = await websiteServices.getContetByType(type, query);

    await Promise.all(
      data.map(async (item: any) => {
        if (item.files && typeof item.files === "object") {
          for (const [key, value] of Object.entries(item.files)) {
            if (typeof value === "string" && value) {
              (item.files as any)[key] = await getFileUrl(value);
            }
          }
        }
      }),
    );

    successResponse(res, 200, `Content by type fetched successfully`, data);
  },
);

// --------------------------------- new controller end here -----------------------------

export const getFileHandling = asyncHandler(
  async (req: Request, res: Response) => {
    const key = req.params[0];

    if (!key) {
      throw new ApiError(400, "File key is required");
    }

    try {
      const filePath = path.join(process.cwd(), "uploads", key);
      if (!fs.existsSync(filePath)) {
        throw new ApiError(404, "File not found");
      }
      res.set("Cache-Control", "public, max-age=300");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      return res.sendFile(filePath);
    } catch (error) {
      console.error("File fetch error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Unable to fetch file");
    }
  },
);
export const getInstagramReels = asyncHandler(
  async (req: Request, res: Response) => {
    let token = await getValidInstagramToken();
    const localReels = await websiteServices.getInstagramReelsForWebsite();
    const ids = localReels.map((r: any) => r.reelId).filter(Boolean);
    if (!ids.length) {
      successResponse(res, 200, "Instagram reels fetched successfully", []);
    }
    const fetchReelsFromGraph = async (accessToken: string) => {
      const IG_USER_ID = process.env.IG_USER_ID;

      const promises = ids.map((id) =>
        axios.get(`https://graph.instagram.com/${id}`, {
          params: {
            fields:
              "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
      const responses = await Promise.allSettled(promises);
      return responses
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as any).value.data);
    };

    let reelsData = [];
    try {
      reelsData = await fetchReelsFromGraph(token);
      reelsData = reelsData.filter(
        (item: any) => item.media_product_type === "REELS",
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        token = await refreshInstagramToken();
        reelsData = await fetchReelsFromGraph(token);
        reelsData = reelsData.filter(
          (item: any) => item.media_product_type === "REELS",
        );
      } else {
        throw new ApiError(500, "Unable to fetch Instagram reels");
      }
    }
    successResponse(
      res,
      200,
      "Instagram reels fetched successfully",
      reelsData,
    );
  },
);

export const getCareerGalleries = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const galleries = await websiteServices.getCareerGalleries(page, limit);

    let items: unknown = galleries;
    if (
      galleries &&
      typeof galleries === "object" &&
      "data" in galleries &&
      Array.isArray((galleries as any).data)
    ) {
      items = (galleries as any).data;
    }

    if (items && Array.isArray(items)) {
      await Promise.all(
        items.map(async (item: any) => {
          if (item.files && typeof item.files === "object") {
            for (const [key, value] of Object.entries(item.files)) {
              if (typeof value === "string" && value) {
                (item.files as any)[key] = await getFileUrl(value);
              }
            }
          }
        }),
      );
    }

    successResponse(res, 200, "Career gallery fetched successfully", galleries);
  },
);

export const getSubTypologyByTypologySlug = asyncHandler(
  async (req: Request<{ typologySlug: string }>, res: Response) => {
    const { typologySlug } = req.params;

    if (!typologySlug) {
      throw new ApiError(400, "typologySlug parameter is required");
    }

    const subTypologies =
      await websiteServices.getSubTypologyByTypologySlug(typologySlug);
    successResponse(
      res,
      200,
      "Sub typologies fetched successfully",
      subTypologies,
    );
  },
);

export const getFeatureProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const projects = await websiteServices.getFeatureProjects(limit);

    if (projects && Array.isArray(projects)) {
      await Promise.all(
        projects.map(async (item: any) => {
          if (item.files && typeof item.files === "object") {
            for (const key of Object.keys(item.files)) {
              const value = item.files[key];
              if (value) {
                item.files[key] = await getFileUrl(value);
              }
            }
          }
          if (item.projectBanner && typeof item.projectBanner === "object") {
            item.projectBanner.map(async (banner: any) => {
              if (banner.files && typeof banner.files === "object") {
                for (const key of Object.keys(banner.files)) {
                  const value = banner.files[key];
                  if (value) {
                    banner.files[key] = await getFileUrl(value);
                  }
                }
              }
            });
          }
        }),
      );
    }
    successResponse(
      res,
      200,
      "Feature projects fetched successfully",
      projects,
    );
  },
);

export const getProjectsByPlatterSlug = asyncHandler(
  async (req: Request<{ platterSlug: string }>, res: Response) => {
    const { platterSlug } = req.params;

    if (!platterSlug) {
      throw new ApiError(400, "platterSlug parameter is required");
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Parse comma-separated slugs into arrays
    const typologySlugs = req.query.typologySlugs
      ? typeof req.query.typologySlugs === "string"
        ? req.query.typologySlugs.split(",").map((s) => s.trim())
        : Array.isArray(req.query.typologySlugs)
          ? req.query.typologySlugs.map((s) => String(s).trim())
          : []
      : undefined;

    const subTypologySlugs = req.query.subTypologySlugs
      ? typeof req.query.subTypologySlugs === "string"
        ? req.query.subTypologySlugs.split(",").map((s) => s.trim())
        : Array.isArray(req.query.subTypologySlugs)
          ? req.query.subTypologySlugs.map((s) => String(s).trim())
          : []
      : undefined;

    const citySlugs = req.query.citySlug
      ? typeof req.query.citySlug === "string"
        ? req.query.citySlug.split(",").map((s) => s.trim())
        : Array.isArray(req.query.citySlug)
          ? req.query.citySlug.map((s) => String(s).trim())
          : []
      : undefined;
    // const projectStatusSlug = req.query.projectStatusSlug as string | undefined;
    // Support multiple projectStatusSlugs (comma separated or array)
    const projectStatusSlugs = req.query.projectStatusSlug
      ? typeof req.query.projectStatusSlug === "string"
        ? req.query.projectStatusSlug.split(",").map((s) => s.trim())
        : Array.isArray(req.query.projectStatusSlug)
          ? req.query.projectStatusSlug.map((s) => String(s).trim())
          : []
      : undefined;

    const developerSlug = req.query.developerSlug as string | undefined;

    // Search text for project name or location (city)
    const search = req.query.search as string | undefined;

    const filters = {
      typologySlugs:
        typologySlugs && typologySlugs.length > 0 ? typologySlugs : undefined,
      subTypologySlugs:
        subTypologySlugs && subTypologySlugs.length > 0
          ? subTypologySlugs
          : undefined,
      citySlug: citySlugs && citySlugs.length > 0 ? citySlugs : undefined,
      projectStatusSlugs:
        projectStatusSlugs && projectStatusSlugs.length > 0
          ? projectStatusSlugs
          : undefined,
      developerSlug,
      search, // Pass search through to the service
    };

    const projects = await websiteServices.getProjectsByPlatterSlug(
      platterSlug,
      filters,
      page,
      limit,
    );

    // Handle pagination and data shape returned by getProjectsByPlatterSlug
    let items: unknown = projects;
    let result = projects;
    if (
      projects &&
      typeof projects === "object" &&
      "data" in projects &&
      Array.isArray(projects.data)
    ) {
      items = projects.data;
      result = projects;
    }

    if (items && Array.isArray(items)) {
      await Promise.all(
        items.map(async (item: any) => {
          if (
            item.files &&
            typeof item.files === "object" &&
            item.files !== null
          ) {
            for (const [key, value] of Object.entries(item.files)) {
              if (typeof value === "string" && value) {
                item.files[key] = await getFileUrl(value);
              }
            }
          }
        }),
      );
    }

    // If there are project banners in project objects, apply presignedUrl to their files
    if (items && Array.isArray(items)) {
      await Promise.all(
        items.map(async (item: any) => {
          if (Array.isArray(item.projectBanner)) {
            await Promise.all(
              item.projectBanner.map(async (banner: any) => {
                if (
                  banner.files &&
                  typeof banner.files === "object" &&
                  banner.files !== null
                ) {
                  for (const [key, value] of Object.entries(banner.files)) {
                    if (typeof value === "string" && value) {
                      banner.files[key] = await getFileUrl(value);
                    }
                  }
                }
              }),
            );
          }
        }),
      );
    }

    successResponse(res, 200, "Projects fetched successfully", projects);
  },
);

export const getProjectsNameAndSlug = asyncHandler(
  async (req: Request, res: Response) => {
    const platter = (req.query.platter as string) || undefined;
    const search = req.query.search as string;

    const projects = await websiteServices.getProjectsNameAndSlug(
      platter,
      search,
    );
    successResponse(
      res,
      200,
      "Projects name and slug fetched successfully",
      projects,
    );
  },
);

export const getOfficesLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const offices = await websiteServices.getOfficesLocation?.();
    successResponse(res, 200, "Offices location fetched successfully", offices);
  },
);

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const news = await websiteServices.getNews?.(page, limit);
  successResponse(res, 200, "News fetched successfully", news);
});

export const getProjectByPlatter = asyncHandler(
  async (req: Request, res: Response) => {
    const { platter } = req.params;

    if (!platter) {
      throw new ApiError(400, "Platter parameter is required");
    }

    const projects = await websiteServices.getProjectsByPlatterWithGallery(
      platter as string,
    );

    successResponse(
      res,
      200,
      "Projects with gallery fetched successfully",
      projects,
    );
  },
);

export const getPlatterForEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const platters = await websiteServices.getPlatterForEnquiry();
    successResponse(
      res,
      200,
      "Platters List for enquiry fetched successfully",
      platters,
    );
  },
);

export const getProjectLocationByPlatter = asyncHandler(
  async (req: Request<{ platter: string }>, res: Response) => {
    const { platter } = req.params;

    const projectLocations =
      await websiteServices.getProjectLocationByPlatter(platter);
    successResponse(
      res,
      200,
      "Project location by platter fetched successfully",
      projectLocations,
    );
  },
);

export const getProjectsByCity = asyncHandler(
  async (req: Request<{ city: string }>, res: Response) => {
    const { city } = req.params;

    const projectLocations = await websiteServices.getProjectsByCity(city);
    successResponse(
      res,
      200,
      "Project location by platter fetched successfully",
      projectLocations,
    );
  },
);

export const createJobApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobId, fullName, emailAddress, phoneNo, message } =
      req.body;
    const resumeFile = req.file as any;

    const application = await websiteServices.createJobApplication({
      jobId,
      fullName,
      emailAddress,
      phoneNo,
      message,
      resume: resumeFile ? resumeFile.key : null,
    });

    await sendEmail(
      process.env.HR_EMAIL_DESTINATION || process.env.SMTP_USER as any,
      "New Job Application",
      "enquiry-lead",
      {
        title: "Job Application",
        data: {
          "Job Name": application.jobs?.title,
          "Full Name": fullName,
          "Email Address": emailAddress,
          "Phone No": phoneNo,
          "Message": message,
        },
      }
    );
    successResponse(
      res,
      201,
      "Job application submitted successfully",
      application,
    );
  },
);

export const createNewsLetterEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const { emailAddress } = req.body;

    const enquiry = await websiteServices.createNewsLetterEnquiry({
      emailAddress,
    });
    successResponse(
      res,
      201,
      "Newsletter subscription submitted successfully",
      enquiry,
    );
  },
);

export const createContactEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      fullName,
      emailAddress,
      mobileNo,
      query,
    } = req.body;

    const enquiry = await websiteServices.createContactEnquiry({
      fullName,
      emailAddress,
      mobileNo,
      query,
    });

    try {
      const toEmail = process.env.CLIENT_EMAIL_DESTINATION || process.env.SMTP_USER || "";
      if (toEmail) {
        await sendEmail(toEmail, "New Contact Us Enquiry", "enquiry-lead", {
          title: "Contact Us Enquiry",
          data: {
            "Full Name": fullName,
            "Email Address": emailAddress,
            "Mobile No": mobileNo,
            "Message": query
          }
        });
      }
    } catch (error) {
      logger.error("Failed to send contact enquiry email:", error);
    }
    successResponse(
      res,
      201,
      "Contact enquiry submitted successfully",
      enquiry,
    );
  },
);

export const createProjectEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      projectId,
      fullName,
      emailAddress,
      mobileNo,
      query,
      campaignCode,
      remarks,
      AgencyName,
      utmcampaign,
      utmcontent,
      utmmedium,
      utmsource,
    } = req.body;

    const enquiry = await websiteServices.createProjectEnquiry({
      projectId,
      fullName,
      emailAddress,
      mobileNo,
      query,
      campaignCode,
      remarks,
      AgencyName,
      utmcampaign,
      utmcontent,
      utmmedium,
      utmsource,
    });
    // Forward to Salesforce
    try {
      const salesforceToken = await getSalesforceToken();
      await axios.post(
        "https://sdplorg2023.my.salesforce.com/services/apexrest/DigitalAPI/",
        {
          req: {
            firstName: fullName,
            lastName: "",
            email: emailAddress,
            mobile: mobileNo,
            campaignCode: process.env.SALESFORCE_CAMPAIGNCODE,
            remarks: remarks || "New Digital Lead",
            AgencyName: AgencyName || "Web",
            utmcampaign: utmcampaign || "",
            utmcontent: utmcontent || "",
            utmmedium: utmmedium || "",
            utmsource: utmsource || "",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${salesforceToken}`,
          },
        },
      );
    } catch (error) {
      logger.error("Salesforce API integration failed:", error);
    }

    successResponse(
      res,
      201,
      "Project enquiry submitted successfully",
      enquiry,
    );
  },
);

export const createOrangeCircleEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      fullName,
      emailAddress,
      mobileNo,
      companyName,
      role,
      affiliation,
      contactNo,
      query,
      remarks,
      AgencyName,
      utmcampaign,
      utmcontent,
      utmmedium,
      utmsource,
    } = req.body;

    const enquiry = await websiteServices.createOrangeCircleEnquiry({
      fullName,
      emailAddress,
      mobileNo,
      companyName,
      role,
      affiliation,
      contactNo,
      query,
      utmcampaign,
      utmcontent,
      utmmedium,
      utmsource,
    });

    try {
      const salesforceToken = await getSalesforceToken();
      await axios.post(
        "https://sdplorg2023.my.salesforce.com/services/apexrest/DigitalAPI/",
        {
          req: {
            firstName: fullName,
            lastName: "",
            email: emailAddress,
            mobile: mobileNo,
            campaignCode: process.env.SALESFORCE_CAMPAIGNCODE,
            remarks: remarks || "New Digital Lead",
            AgencyName: AgencyName || "Web",
            utmcampaign: utmcampaign || "",
            utmcontent: utmcontent || "",
            utmmedium: utmmedium || "",
            utmsource: utmsource || "",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${salesforceToken}`,
          },
        },
      );
    } catch (error) {
      logger.error("Salesforce API integration failed:", error);
    }

    successResponse(
      res,
      201,
      "Orange circle enquiry submitted successfully",
      enquiry,
    );
  },
);

export const getSitemap = asyncHandler(async (req: Request, res: Response) => {
  const sitemap = await websiteServices.getSiteMap();
  successResponse(res, 200, "Sitemap successfully", sitemap);
});

export const createChannelPartnerEnquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const { fullName, emailAddress, mobileNo, companyName, agencyName, location, reraCertifiedNo, experience, query } = req.body;

    const enquiry = await websiteServices.createChannelPartnerEnquiry({
      fullName,
      emailAddress,
      mobileNo,
      companyName,
      agencyName,
      location,
      reraCertifiedNo,
      experience,
      query,
    });

    try {
      const toEmail = process.env.CLIENT_EMAIL_DESTINATION || process.env.SMTP_USER || "";
      if (toEmail) {
        await sendEmail(toEmail, "New Channel Partner Enquiry", "enquiry-lead", {
          title: "Channel Partner Enquiry",
          data: {
            "Full Name": fullName,
            "Email Address": emailAddress,
            "Mobile No": mobileNo,
            "Company Name": companyName,
            "Agency Name": agencyName,
            "Location": location,
            "RERA Certified Number": reraCertifiedNo,
            "Experience": experience,
            "Message": query
          }
        });
      }
    } catch (error) {
      logger.error("Failed to send channel partner email:", error);
    }

    successResponse(
      res,
      201,
      "Channel partner enquiry submitted successfully",
      enquiry,
    );
  },
);

export const getSitemapProjectsByStatus = asyncHandler(
  async (req: Request<{ typologyId: string }>, res: Response) => {
    const subTypologies = await websiteServices.getProjectForSitemapByStatus();
    successResponse(
      res,
      200,
      "Sub typologies fetched successfully",
      subTypologies,
    );
  },
);
