import { generateTemplate } from "./../mail/template";
import { VerificationToken } from "@/models/verification.model";
import { generateToken } from "@/utils/helper";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_EMAIL,
} from "@/utils/variables";
import nodemailer from "nodemailer";
import path from "path";

interface Options {
  email: string;
  link: string;
}

interface Profile {
  name: string;
  email: string;
  userId: string;
}

const generateMailTranspoter = () => {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });
};

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTranspoter();
  const { name, email, userId } = profile;
  await VerificationToken.create({
    user: userId,
    token,
  });
  const WelcomeMessage = `Hi ${name}, Welcome to Pipify! We are glad you have signed up to Pipify. Use the given OTP to verify your email.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome to Pipify",
    html: generateTemplate({
      title: "Welcome to Pipify",
      message: WelcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
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

export const sendForgetPasswordLink = async (options: Options) => {
  const transport = generateMailTranspoter();
  const { email, link } = options;

  const message =
    "We just recieved a request that you forgot your password. No problme you can use the link below and create a new password";

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset Password - Pipify",
    html: generateTemplate({
      title: "Forget Password",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link,
      btnTitle: "Reset Password",
    }),
    attachments: [
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

export const ResetPasswordSucessMail = async (name: string, email: string) => {
  const transport = generateMailTranspoter();

  const message = `Dear ${name} your password has been reset successfully. You will now be able to login to your account with your email.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Alert Reset Password - Pipify",
    html: generateTemplate({
      title: "Password is reset successfully",
      message,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Login",
    }),
    attachments: [
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
