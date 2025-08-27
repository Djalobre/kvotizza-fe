'use client'

import type React from 'react'
import { useState } from 'react'
import { SEOHead } from '../../components/seo-head'
import { LandingNavbar } from '@/components/landing-navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  MessageCircle,
  Clock,
  Send,
  HelpCircle,
  Shield,
  CheckCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { generateBreadcrumbSchema } from '../../lib/structured-data-generators'

interface ContactForm {
  name: string
  email: string
  subject: string
  category: string
  message: string
}

const faqItems = [
  {
    question: 'Kako funkcioniše Kvotizza?',
    answer:
      'Kvotizza prikuplja kvote od svih licenciranih kladionica u Srbiji i omogućava vam da ih uporedite na jednom mestu. Možete pronaći najbolje kvote, graditi tikete i analizirati tržište.',
  },
  {
    question: 'Da li je korišćenje Kvotizza besplatno?',
    answer:
      'Da, Kvotizza je potpuno besplatna za korišćenje. Nema skrivenih troškova ili pretplata.',
  },
  {
    question: 'Koliko često se ažuriraju kvote?',
    answer:
      'Kvote se ažuriraju u proseku na 15 minuta. Naš sistem kontinuirano prati promene kod svih operatera i prikazuje najnovije informacije.',
  },
  {
    question: 'Da li su sve prikazane kladionice licencirane?',
    answer:
      'Da, prikazujemo kvote samo od kladionica koje imaju važeće licence izdane od strane Uprave za igre na sreću Republike Srbije.',
  },
  {
    question: 'Kako mogu da prijavim grešku ili problem?',
    answer:
      'Možete nas kontaktirati putem kontakt forme, email-a ili Telegram kanala. Trudimo se da odgovorimo u roku od 24 sata.',
  },
]

export default function KontaktPage() {
  const [isDark, setIsDark] = useState(false)
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrorMsg(null)
  }

  const validate = (data: ContactForm) => {
    if (!data.name.trim()) return 'Unesite ime i prezime.'
    if (!data.email.trim()) return 'Unesite email adresu.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Unesite ispravan email.'
    if (!data.category.trim()) return 'Izaberite kategoriju.'
    if (!data.subject.trim()) return 'Unesite naslov poruke.'
    if (data.message.trim().length < 10) return 'Poruka mora imati bar 10 karaktera.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    const v = validate(formData)
    if (v) {
      setErrorMsg(v)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: '' }), // honeypot stays empty
      })

      const data = await res.json().catch(() => ({} as any))
      if (!res.ok || !data.ok) {
        const detail = (data && (data.detail || data.error)) || 'Greška pri slanju poruke.'
        throw new Error(detail)
      }

      setSubmitted(true)
      // Reset after a short delay
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ name: '', email: '', subject: '', category: '', message: '' })
      }, 3000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message || 'Došlo je do greške. Pokušajte ponovo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Structured data
  const breadcrumbs = [
    { name: 'Početna', url: 'https://kvotizza.rs' },
    { name: 'Kontakt', url: 'https://kvotizza.rs/kontakt' },
  ]

  const structuredData = [
    generateBreadcrumbSchema(breadcrumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Kontakt - Kvotizza',
      description: 'Kontaktirajte Kvotizza tim za podršku, pitanja ili predloge',
      url: 'https://kvotizza.rs/kontakt',
      mainEntity: {
        '@type': 'Organization',
        name: 'Kvotizza',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'kvotizza@gmail.com',
            availableLanguage: ['Serbian', 'English'],
            hoursAvailable: 'Mo-Su 09:00-21:00',
          },
        ],
      },
    },
  ]

  return (
    <>
      <SEOHead
        title="Kontakt - Kvotizza | Podrška i pomoć"
        description="Kontaktirajte Kvotizza tim za podršku, pitanja ili predloge. Dostupni smo 7 dana u nedelji za sve vaše potrebe vezane za poređenje kvota."
        keywords={[
          'kontakt kvotizza',
          'podrška kladionice',
          'pomoć klađenje',
          'customer support',
          'kontakt forma',
          'telegram podrška',
        ]}
        canonicalUrl="https://kvotizza.rs/kontakt"
        ogImage="https://kvotizza.rs/og-image-contact.jpg"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
        <LandingNavbar isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />

        {/* Hero Section */}
        <section className="border-b dark:bg-gradient-to-r dark:from-kvotizza-dark-bg-10 dark:to-kvotizza-dark-bg-10 bg-gradient-to-r from-sport-blue-50 to-sport-green-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
            <div className="text-center space-y-4 dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
              <Badge className="bg-sport-blue-600 hover:bg-sport-blue-700 ">
                <MessageCircle className="h-3 w-3 mr-1" />
                Kontakt i podrška
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Kako možemo da <span className="text-sport-green-500">pomognemo</span>?
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Naš tim je tu da odgovori na sva vaša pitanja o Kvotizza platformi, strategijama
                klađenja ili tehničkim problemima.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="dark:bg-kvotizza-dark-bg-20 dark:border-white/30">
                <CardHeader>
                  <CardTitle id="contact-title" className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-sport-blue-600" />
                    Pošaljite nam poruku
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-sport-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Poruka je uspešno poslata!</h3>
                      <p className="text-muted-foreground">
                        Hvala vam na poruci. Odgovorićemo u roku od 24 sata.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      {/* Error banner */}
                      {errorMsg && (
                        <div
                          role="alert"
                          className="rounded-lg border border-red-300/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-800 dark:text-red-200"
                        >
                          {errorMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block ">Ime i prezime *</label>
                          <Input
                            required
                            value={formData.name}
                            className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Vaše ime i prezime"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email adresa *</label>
                          <Input
                            type="email"
                            required
                            value={formData.email}
                            className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="vasa@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Kategorija *</label>
                          {/* shadcn Select doesn’t support native required, so we validate manually */}
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange('category', value)}
                          >
                            <SelectTrigger
                              aria-invalid={!formData.category && !!errorMsg}
                              className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                            >
                              <SelectValue placeholder="Izaberite kategoriju" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30">
                              <SelectItem value="tehnicka-podrska">Tehnička podrška</SelectItem>
                              <SelectItem value="kvote-problem">Problem sa kvotama</SelectItem>
                              <SelectItem value="predlog">Predlog za poboljšanje</SelectItem>
                              <SelectItem value="partnerstvo">Partnerstvo</SelectItem>
                              <SelectItem value="ostalo">Ostalo</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Optional hidden input if you want native validity: */}
                          {/* <input required value={formData.category} onChange={() => {}} className="sr-only" /> */}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Naslov *</label>
                          <Input
                            required
                            className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            placeholder="Kratko opišite problem"
                          />
                          {/* Honeypot */}
                          <input
                            type="text"
                            name="website"
                            autoComplete="off"
                            tabIndex={-1}
                            className="hidden"
                            aria-hidden="true"
                            onChange={() => {}}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Poruka *</label>
                        <Textarea
                          required
                          value={formData.message}
                          className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Detaljno opišite vaš problem ili pitanje..."
                          rows={6}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-sport-green-500 hover:bg-sport-green-600 text-black dark:bg-kvotizza-dark-bg-10 dark:border-white/30 dark:text-white hover:opacity-80"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Šalje se...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Pošaljite poruku
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="dark:bg-kvotizza-dark-bg-20 dark:border-white/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-sport-blue-600" />
                    Kontakt informacije
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-sport-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Email podrška</p>
                      <p className="text-sm text-muted-foreground">kvotizza@gmail.com</p>
                      <p className="text-xs text-muted-foreground">Odgovaramo u roku od 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-sport-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Telegram kanal</p>
                      <p className="text-sm text-muted-foreground">@kvotizza</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-sport-green-600"
                        onClick={() => window.open('https://t.me/+NT-ANytPG3kwOTY0', '_blank')}
                      >
                        Pridružite se <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-sport-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Radno vreme</p>
                      <p className="text-sm text-muted-foreground">Ponedeljak - Nedelja</p>
                      <p className="text-sm text-muted-foreground">09:00 - 21:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sport-yellow-200 bg-sport-yellow-50 dark:bg-sport-yellow-950/20 ">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-sport-yellow-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-sport-yellow-800 dark:text-sport-yellow-200 mb-1">
                        Odgovorno klađenje
                      </p>
                      <p className="text-sport-yellow-700 dark:text-sport-yellow-300">
                        Kvotizza ne prima tikete niti ne omogućava klađenje. Samo poredimo kvote
                        licenciranih operatera. 18+
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-12">
            <Card className="dark:bg-kvotizza-dark-bg-20 dark:border-white/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-sport-blue-600" />
                  Često postavljana pitanja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-muted pb-4 last:border-b-0 last:pb-0"
                    >
                      <h3 className="font-semibold mb-2 text-sport-blue-700 dark:text-sport-blue-300">
                        {item.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-muted text-center">
                  <p className="text-muted-foreground mb-4">
                    Niste pronašli odgovor na vaše pitanje?
                  </p>
                  <Button
                    variant="outline"
                    className="dark:bg-kvotizza-dark-bg-10 dark:border-white/30"
                    onClick={() =>
                      document.querySelector('#contact-title')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center', // or 'start', 'end', 'nearest'
                      })
                    }
                  >
                    Kontaktirajte nas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  )
}
