'use client'

import React, { useState } from 'react'
import { Zap, ArrowRight, Mail } from 'lucide-react'
import { contact } from '@/data'

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10 10 0 0012 2z" />
  </svg>
)

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const Contact = () => {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('failed')

      setStatus('sent')
      setForm(initialState)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div id="contact" className="bg-surface-950 relative overflow-hidden">
      <svg
        className="pointer-events-none absolute top-0 right-0 hidden h-full w-[640px] lg:block"
        viewBox="0 0 640 520"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <g strokeLinecap="round" strokeWidth="20" fill="none" opacity="0.5">
          <line x1="420" y1="560" x2="560" y2="360" stroke="#7a6fe0" />
          <line x1="480" y1="560" x2="620" y2="360" stroke="#342c7a" />
          <line x1="540" y1="560" x2="680" y2="360" stroke="#cbeb4d" />
          <line x1="600" y1="560" x2="740" y2="360" stroke="#7a6fe0" />
        </g>
      </svg>

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-start justify-center gap-12 px-6 pt-20 pb-10 sm:px-10 sm:pt-24 sm:pb-10 lg:flex-row lg:gap-24 lg:px-20">
        <div className="flex max-w-md flex-col gap-5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 fill-lime-500 text-lime-500" />
            <span className="text-xs font-bold tracking-[0.12em] text-lime-500 uppercase">
              Ready to collaborate?
            </span>
          </div>
          <div className="text-ink-inverse-50 text-3xl leading-[1.2] font-black sm:text-[40px]">
            一緒に何か
            <br />
            つくりましょう。
          </div>
          <p className="text-ink-inverse-400 max-w-sm text-[15px] leading-[1.7]">
            お仕事のご相談・カジュアルなご連絡、お気軽にどうぞ。下記フォームまたは直接のご連絡先からお待ちしています。
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3.5">
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="cf-name"
                  className="text-ink-inverse-400 mb-1.5 block text-xs font-bold"
                >
                  Name
                </label>
                <input
                  className="field"
                  id="cf-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Hosokawa Taro"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="cf-email"
                  className="text-ink-inverse-400 mb-1.5 block text-xs font-bold"
                >
                  Email
                </label>
                <input
                  className="field"
                  id="cf-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="cf-subject"
                className="text-ink-inverse-400 mb-1.5 block text-xs font-bold"
              >
                Subject
              </label>
              <input
                className="field"
                id="cf-subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder="ご相談内容について"
              />
            </div>
            <div>
              <label
                htmlFor="cf-message"
                className="text-ink-inverse-400 mb-1.5 block text-xs font-bold"
              >
                Message
              </label>
              <textarea
                className="field resize-y"
                id="cf-message"
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="お仕事のご相談内容など"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-ink-950 mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-lime-500 px-7 py-[14px] text-[13px] font-bold tracking-[0.06em] uppercase transition-opacity disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending...' : 'Send message'}
              <ArrowRight className="h-4 w-4" />
            </button>
            {status === 'sent' && (
              <p className="text-sm font-medium text-lime-500">
                送信しました。ありがとうございます！
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-red-400">
                送信に失敗しました。時間をおいて再度お試しください。
              </p>
            )}
          </form>
        </div>

        <div className="flex min-w-[280px] flex-col gap-2.5">
          <a
            href={`mailto:${contact.email}`}
            className="text-ink-inverse-50 flex items-center gap-3.5 rounded-2xl border border-white/12 bg-white/6 px-[18px] py-[14px] text-sm"
          >
            <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-lime-500/12 text-lime-500">
              <Mail className="h-[15px] w-[15px]" />
            </span>
            {contact.email}
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-inverse-50 flex items-center gap-3.5 rounded-2xl border border-white/12 bg-white/6 px-[18px] py-[14px] text-sm"
          >
            <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-lime-500/12 text-lime-500">
              <GithubIcon />
            </span>
            {contact.github.replace('https://', '')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Contact
