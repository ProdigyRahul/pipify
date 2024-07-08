import { Request, RequestHandler } from "express";
import formidable, { File } from "formidable";

// Extend Express Request interface to include files property
export interface RequestWithFiles extends Request {
  files?: { [key: string]: File };
}

// Middleware to parse incoming form-data requests and attach files to req.files
const fileParser: RequestHandler = async (req: RequestWithFiles, res, next) => {
  // Check if request content-type is multipart/form-data
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Initialize formidable form parser
  const form = formidable({ multiples: false });

  // Parse incoming form data
  const [fields, files] = await form.parse(req);

  // Attach parsed fields to req.body
  for (let key in fields) {
    const field = fields[key];
    if (field) {
      req.body[key] = field[0]; // Assuming only single values are expected
    }
  }

  // Attach parsed files to req.files
  for (let key in files) {
    const file = files[key];

    if (!req.files) {
      req.files = {};
    }

    if (file) {
      req.files[key] = file[0]; // Assuming only single files are expected
    }
  }

  // Proceed to the next middleware
  next();
};

export default fileParser;
