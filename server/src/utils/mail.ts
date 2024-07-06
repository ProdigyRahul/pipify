import { generateTemplate } from "./../mail/template";
import { VerificationToken } from "@/models/verification.model";
import { generateToken } from "@/utils/helper";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  VERIFICATION_EMAIL,
} from "@/utils/variables";
import nodemailer from "nodemailer";
import path from "path";

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
