import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  category: z.string().min(1).max(60),
  message: z.string().min(10).max(5000),
  // Honeypot field (must be empty)
  website: z.string().optional().default(''),
})

/** Simple in-memory rate limit (per IP). Replace with Redis/Upstash for production. */
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 5
const bucket = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const calls = (bucket.get(ip) ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)
  calls.push(now)
  bucket.set(ip, calls)
  return calls.length > RATE_LIMIT_MAX
}

export async function POST(req: Request) {
  try {
    // Basic size guard
    const raw = await req.text()
    if (raw.length > 200_000) {
      return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 })
    }

    const json = JSON.parse(raw || '{}')
    const parsed = contactSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid data', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, subject, category, message, website } = parsed.data

    // Honeypot check
    if (website && website.trim().length > 0) {
      // pretend success to traps
      return NextResponse.json({ ok: true })
    }

    // Rate limit per IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).ip || '0.0.0.0'
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests, try again soon.' },
        { status: 429 }
      )
    }

    // Transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const to = process.env.EMAIL_TO ?? process.env.EMAIL_USER!
    const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER!

    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.6; color:#111;">
        <h2 style="margin:0 0 12px">Nova poruka sa Kontakt forme</h2>
        <p><strong>Ime:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Kategorija:</strong> ${escapeHtml(category)}</p>
        <p><strong>Naslov:</strong> ${escapeHtml(subject)}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `

    const text = `
Nova poruka sa Kontakt forme

Ime: ${name}
Email: ${email}
Kategorija: ${category}
Naslov: ${subject}

--------------------------
${message}
`.trim()

    await transporter.sendMail({
      from, // MUST be your Gmail address (per Gmail/DMARC)
      to,
      subject: `Kontakt forma (${category}) — ${subject}`,
      text,
      html,
      replyTo: email, // so you can reply directly to the user
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Contact form error:', err)
    return NextResponse.json({ ok: false, error: 'Mail send failed' }, { status: 500 })
  }
}

function escapeHtml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
