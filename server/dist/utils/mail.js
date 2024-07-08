"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSucessMail = exports.sendForgetPasswordLink = exports.sendVerificationMail = void 0;
const template_1 = require("./../mail/template");
const verification_model_1 = require("../models/verification.model");
const variables_1 = require("../utils/variables");
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const generateMailTranspoter = () => {
    return nodemailer_1.default.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: variables_1.MAILTRAP_USER,
            pass: variables_1.MAILTRAP_PASSWORD,
        },
    });
};
const sendVerificationMail = (token, profile) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = generateMailTranspoter();
    const { name, email, userId } = profile;
    yield verification_model_1.VerificationToken.create({
        user: userId,
        token,
    });
    const WelcomeMessage = `Hi ${name}, Welcome to Pipify! We are glad you have signed up to Pipify. Use the given OTP to verify your email.`;
    transport.sendMail({
        to: email,
        from: variables_1.VERIFICATION_EMAIL,
        subject: "Welcome to Pipify",
        html: (0, template_1.generateTemplate)({
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
                path: path_1.default.join(__dirname, "../public/images/logo.png"),
                cid: "logo",
            },
            {
                filename: "welcome.png",
                path: path_1.default.join(__dirname, "../public/images/welcome.png"),
                cid: "welcome",
            },
        ],
    });
});
exports.sendVerificationMail = sendVerificationMail;
const sendForgetPasswordLink = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = generateMailTranspoter();
    const { email, link } = options;
    const message = "We just recieved a request that you forgot your password. No problme you can use the link below and create a new password";
    transport.sendMail({
        to: email,
        from: variables_1.VERIFICATION_EMAIL,
        subject: "Reset Password - Pipify",
        html: (0, template_1.generateTemplate)({
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
                path: path_1.default.join(__dirname, "../public/images/logo.png"),
                cid: "logo",
            },
            {
                filename: "forget_password.png",
                path: path_1.default.join(__dirname, "../public/images/forget_password.png"),
                cid: "forget_password",
            },
        ],
    });
});
exports.sendForgetPasswordLink = sendForgetPasswordLink;
const ResetPasswordSucessMail = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    const transport = generateMailTranspoter();
    const message = `Dear ${name} your password has been reset successfully. You will now be able to login to your account with your email.`;
    transport.sendMail({
        to: email,
        from: variables_1.VERIFICATION_EMAIL,
        subject: "Alert Reset Password - Pipify",
        html: (0, template_1.generateTemplate)({
            title: "Password is reset successfully",
            message,
            logo: "cid:logo",
            banner: "cid:forget_password",
            link: variables_1.SIGN_IN_URL,
            btnTitle: "Login",
        }),
        attachments: [
            {
                filename: "logo.png",
                path: path_1.default.join(__dirname, "../public/images/logo.png"),
                cid: "logo",
            },
            {
                filename: "forget_password.png",
                path: path_1.default.join(__dirname, "../public/images/forget_password.png"),
                cid: "forget_password",
            },
        ],
    });
});
exports.ResetPasswordSucessMail = ResetPasswordSucessMail;
