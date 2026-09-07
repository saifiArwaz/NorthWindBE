import { z } from "zod";
import { prisma } from "../../config/prisma.config.js";

// Job Application Enquiry Validation
export const createJobApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().optional(),
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    phoneNo: z.string().min(1, "phoneNo is required"),
    location: z.string().optional(),
  }),
});

// Newsletter Enquiry Validation
export const createNewsLetterEnquirySchema = z.object({
  body: z.object({
    emailAddress: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Invalid email address")
      .transform((email) => email.toLowerCase()),
  }),
});

export const createContactEnquirySchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    mobileNo: z.string().min(10, "mobileNo is required"),
    query: z.string().optional(),
    location: z.string().optional(),
    pageUrl: z.string().optional(),
  }),
});

export const createProjectEnquirySchema = z.object({
  body: z.object({
    projectId: z
      .string()
      .min(1, "projectId is required")
      .refine(
        async (projectId) => {
          const project = await prisma.projects.findUnique({
            where: { id: projectId },
          });

          return !!project;
        },
        {
          message: "Invalid projectId",
        },
      ),

    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    mobileNo: z.string().min(10, "mobileNo is required"),
    query: z.string().optional(),
  }),
});

export const createFloorplanTowerEnquirySchema = z.object({
  body: z.object({
    projectId: z
      .string()
      .min(1, "projectId is required")
      .refine(
        async (projectId) => {
          const project = await prisma.projects.findUnique({
            where: { id: projectId },
          });

          return !!project;
        },
        {
          message: "Invalid projectId",
        },
      )
      .optional(),
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    mobileNo: z.string().min(10, "mobileNo is required"),
    message: z.string().optional(),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    mobileNo: z.string().min(1, "mobileNo is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobileNo: z.string().min(1, "mobileNo is required"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }),
});

export const createLandOwnerConnectSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "fullName is required"),
    mobileNo: z.string().min(1, "mobileNo is required"),
    emailAddress: z.string().email("Invalid emailAddress").min(1, "emailAddress is required"),
    landLocation: z.string().min(1, "landLocation is required"),
    landArea: z.string().min(1, "landArea is required"),
    landType: z.string().min(1, "landType is required"),
    ownershipStatus: z.string().min(1, "ownershipStatus is required"),
    additionalDetails: z.string().optional(),
    pageUrl: z.string().optional(),
  }),
});


