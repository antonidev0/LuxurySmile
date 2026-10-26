import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "../config.js";

let transporter;

const getTransporter = () => {
  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
};

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// Los datos que escribe el usuario (p. ej. su nombre) no pueden inyectar HTML en el correo
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

export const sendMail = ({ to, subject, html }) => getTransporter().sendMail({ from: EMAIL_USER, to, subject, html });
