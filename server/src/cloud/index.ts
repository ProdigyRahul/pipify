/**
 * Configuration for Cloudinary integration using v2 API.
 * Sets up the Cloudinary configuration with credentials from environment variables.
 * Ensures secure API communication.
 */
import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET } from "@/utils/variables";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: CLOUD_NAME, // Cloudinary cloud name
  api_key: CLOUD_KEY, // Cloudinary API key
  api_secret: CLOUD_SECRET, // Cloudinary API secret
  secure: true, // Ensure secure API communication
});

export default cloudinary;
