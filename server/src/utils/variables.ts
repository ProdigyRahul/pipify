/**
 * Destructure environment variables from the process environment object.
 * Ensure typesafety by casting process.env to an object with string keys.
 */
const { env } = process as { env: { [key: string]: string } };

/**
 * Extract specific environment variables for use in the application.
 */
export const {
  MONGO_URI,
  MAILTRAP_USER,
  MAILTRAP_PASSWORD,
  VERIFICATION_EMAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
  JWT_SECRET,
  CLOUD_NAME,
  CLOUD_KEY,
  CLOUD_SECRET,
} = env;
