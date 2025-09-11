// lib/mailer.ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendMail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: process.env.MAIL_FROM || 'auth@yourdomain.com',
    to, subject, html,
  })
}
