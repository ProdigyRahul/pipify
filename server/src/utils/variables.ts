import { logger } from "@/config/logger";

/**
 * Destructure environment variables from the process environment object.
 * Ensure typesafety by casting process.env to an object with string keys.
 */
const { env } = process as { env: { [key: string]: string } };

/**
 * Extract specific environment variables for use in the application.
 */
export const {
  NODE_ENV,
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

interface EnvVariable {
  key: string;
  value: string | undefined;
}

const requiredEnvVariables: EnvVariable[] = [
  { key: "NODE_ENV", value: NODE_ENV },
  { key: "MONGO_URI", value: MONGO_URI },
  { key: "MAILTRAP_USER", value: MAILTRAP_USER },
  { key: "MAILTRAP_PASSWORD", value: MAILTRAP_PASSWORD },
  { key: "VERIFICATION_EMAIL", value: VERIFICATION_EMAIL },
  { key: "PASSWORD_RESET_LINK", value: PASSWORD_RESET_LINK },
  { key: "SIGN_IN_URL", value: SIGN_IN_URL },
  { key: "JWT_SECRET", value: JWT_SECRET },
  { key: "CLOUD_NAME", value: CLOUD_NAME },
  { key: "CLOUD_KEY", value: CLOUD_KEY },
  { key: "CLOUD_SECRET", value: CLOUD_SECRET },
];

export function validateEnvVariables(): void {
  requiredEnvVariables.forEach((variable) => {
    if (!variable.value) {
      logger.error(`Environment variable ${variable.key} is missing`);
      throw new Error(`Environment variable ${variable.key} is missing`);
    }

    logger.warn(`Environment variable ${variable.key} is properly configured.`);
  });
}
