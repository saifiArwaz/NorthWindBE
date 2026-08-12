import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/apiError.utils.js";

export interface S3UploadedFile extends Express.Multer.File {
  key?: string;
  location?: string;
}

const createUploadMiddleware = (subFolder: string = "") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = subFolder
        ? path.join(process.cwd(), "uploads", subFolder)
        : path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const cleanFileName = file.originalname.trim().replace(/\s+/g, "_");
      cb(null, `${Date.now()}-${cleanFileName}`);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 40 * 1024 * 1024, // 40MB max limit
    },
  });

  const processFile = (req: any, file: any) => {
    const isImage = file.mimetype.startsWith("image/");
    const sizeLimit = isImage ? 50 * 1024 * 1024 : 60 * 1024 * 1024;

    if (file.size > sizeLimit) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new ApiError(
        400,
        `${isImage ? "Image" : "Video/File"} size exceeds the limit of ${isImage ? "50MB" : "60MB"}`,
      );
    }
    file.key = subFolder ? `${subFolder}/${file.filename}` : file.filename;
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    file.location = `${baseUrl}/api/v1/website/files/${file.key}`;
  };

  return {
    single: (fieldName: string) => (req: any, res: any, next: any) => {
      upload.single(fieldName)(req, res, (err: any) => {
        if (err) return next(err);
        if (req.file) {
          try {
            processFile(req, req.file);
          } catch (error) {
            return next(error);
          }
        }
        next();
      });
    },
    array:
      (fieldName: string, maxCount?: number) =>
      (req: any, res: any, next: any) => {
        upload.array(fieldName, maxCount)(req, res, (err: any) => {
          if (err) return next(err);
          if (req.files && Array.isArray(req.files)) {
            try {
              for (const file of req.files) {
                processFile(req, file);
              }
            } catch (error) {
              for (const file of req.files) {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
              }
              return next(error);
            }
          }
          next();
        });
      },
    fields:
      (fields: { name: string; maxCount?: number }[]) =>
      (req: any, res: any, next: any) => {
        upload.fields(fields)(req, res, (err: any) => {
          if (err) return next(err);
          if (req.files && typeof req.files === "object") {
            const allFiles: any[] = [];
            try {
              for (const key of Object.keys(req.files)) {
                const files = req.files[key];
                if (Array.isArray(files)) {
                  for (const file of files) {
                    allFiles.push(file);
                    processFile(req, file);
                  }
                }
              }
            } catch (error) {
              for (const file of allFiles) {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
              }
              return next(error);
            }
          }
          next();
        });
      },
    any: () => (req: any, res: any, next: any) => {
      upload.any()(req, res, (err: any) => {
        if (err) return next(err);
        if (req.files && Array.isArray(req.files)) {
          try {
            for (const file of req.files) {
              processFile(req, file);
            }
          } catch (error) {
            for (const file of req.files) {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            }
            return next(error);
          }
        }
        next();
      });
    },
    none: () => (req: any, res: any, next: any) => {
      upload.none()(req, res, next);
    },
  };
};

export const uploadMiddleware = Object.assign(
  (subFolder: string = "") => createUploadMiddleware(subFolder),
  {
    single: (fieldName: string) => createUploadMiddleware().single(fieldName),
    array: (fieldName: string, maxCount?: number) =>
      createUploadMiddleware().array(fieldName, maxCount),
    fields: (fields: { name: string; maxCount?: number }[]) =>
      createUploadMiddleware().fields(fields),
    any: () => createUploadMiddleware().any(),
    none: () => createUploadMiddleware().none(),
  },
);
