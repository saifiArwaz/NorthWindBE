import { z } from "zod";
import { prisma } from "../../config/prisma.config.js";

// Job Application Enquiry Validation
export const createJobApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().optional(),
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    phoneNo: z.string().min(1, "phoneNo is required"),
    message: z.string().optional(),
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
    campaignCode: z.string().optional(),
    remarks: z.string().optional(),
    AgencyName: z.string().optional(),
    utmcampaign: z.string().optional(),
    utmcontent: z.string().optional(),
    utmmedium: z.string().optional(),
    utmsource: z.string().optional(),
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
    campaignCode: z.string().optional(),
    remarks: z.string().optional(),
    AgencyName: z.string().optional(),
    utmcampaign: z.string().optional(),
    utmcontent: z.string().optional(),
    utmmedium: z.string().optional(),
    utmsource: z.string().optional(),
  }),
});

export const createOrangeCircleEnquirySchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    mobileNo: z.string().min(10, "mobileNo is required"),
    companyName: z.string().optional(),
    role: z.string().optional(),
    affiliation: z.string().optional(),
    contactNo: z.string().optional(),
    query: z.string().optional(),
  }),
});

export const createChannelPartnerEnquirySchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "fullName is required"),
    emailAddress: z.string().email("Invalid emailAddress"),
    mobileNo: z.string().min(10, "mobileNo is required"),
    agencyName: z.string().min(1, "agencyName is required"),
    location: z.string().min(1, "location is required"),
    companyName: z.string().optional(),
    reraCertifiedNo: z.string().optional(),
    experience: z.string().optional(),
    query: z.string().optional(),
  }),
});

