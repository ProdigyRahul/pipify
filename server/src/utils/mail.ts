import { generateTemplate } from "./../mail/template";
import { VerificationToken } from "@/models/verification.model";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_EMAIL,
} from "@/utils/variables";
import nodemailer from "nodemailer";
import path from "path";

// Define interface for email options
interface Options {
  email: string;
  link: string;
}

// Define interface for user profile details
interface Profile {
  name: string;
  email: string;
  userId: string;
}

// Function to create a nodemailer transport object for sending emails
const generateMailTranspoter = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io", // Mailtrap SMTP host
    port: 2525, // Mailtrap SMTP port
    auth: {
      user: MAILTRAP_USER, // Mailtrap username
      pass: MAILTRAP_PASSWORD, // Mailtrap password
    },
  });
};

// Function to send verification email
export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTranspoter();
  const { name, email, userId } = profile;

  // Create a verification token and save it to the database
  await VerificationToken.create({
    user: userId,
    token,
  });

  // Construct the welcome message
  const WelcomeMessage = `Hi ${name}, Welcome to Pipify! We are glad you have signed up to Pipify. Use the given OTP to verify your email.`;

  // Send the verification email
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome to Pipify", // Email subject
    html: generateTemplate({
      // HTML content generated from template
      title: "Welcome to Pipify",
      message: WelcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      // Attachments: logo and banner images
      {
        filename: "logo.png",
        path: path.join(__dirname, "../public/images/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../public/images/welcome.png"),
        cid: "welcome",
      },
    ],
  });
};

// Function to send forget password link email
export const sendForgetPasswordLink = async (options: Options) => {
  const transport = generateMailTranspoter();
  const { email, link } = options;

  // Construct the forget password message
  const message =
    "We just recieved a request that you forgot your password. No problme you can use the link below and create a new password";

  // Send the forget password email
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset Password - Pipify", // Email subject
    html: generateTemplate({
      // HTML content generated from template
      title: "Forget Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password",
    }),
    attachments: [
      // Attachments: logo and forget password images
      {
        filename: "logo.png",
        path: path.join(__dirname, "../public/images/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../public/images/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};

// Function to send reset password success email
export const ResetPasswordSucessMail = async (name: string, email: string) => {
  const transport = generateMailTranspoter();

  // Construct the reset password success message
  const message = `Dear ${name} your password has been reset successfully. You will now be able to login to your account with your email.`;

  // Send the reset password success email
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Alert Reset Password - Pipify", // Email subject
    html: generateTemplate({
      // HTML content generated from template
      title: "Password is reset successfully",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Login",
    }),
    attachments: [
      // Attachments: logo and forget password images
      {
        filename: "logo.png",
        path: path.join(__dirname, "../public/images/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../public/images/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};
