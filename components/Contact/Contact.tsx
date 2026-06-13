'use client'

import React, { useState } from 'react'
import SectionHeading from '../Helper/SectionHeading'
import { contact } from '@/data'

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
    <div className="bg-gray-100 py-16" id="contact">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading
          tag="// Contact"
          title="お問い合わせ"
          description="お仕事のご相談・技術的な質問など、お気軽にご連絡ください。"
        />

        <div className="grid w-full gap-10 lg:grid-cols-2">
          {/* 左: 連絡先情報 */}
          <div className="space-y-4">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-purple-200"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-lg text-purple-600">
                ✉️
              </span>
              <div>
                <div className="text-xs text-gray-400">Email</div>
                <div className="text-sm font-bold text-gray-900">{contact.email}</div>
              </div>
            </a>

            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-purple-200"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-lg text-purple-600">
                🐙
              </span>
              <div>
                <div className="text-xs text-gray-400">GitHub</div>
                <div className="text-sm font-bold text-gray-900">
                  {contact.github.replace('https://', '')}
                </div>
              </div>
            </a>

            <a
              href={contact.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-purple-200"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-lg text-purple-600">
                𝕏
              </span>
              <div>
                <div className="text-xs text-gray-400">X (Twitter)</div>
                <div className="text-sm font-bold text-gray-900">
                  {contact.twitter.replace('https://twitter.com/', '@')}
                </div>
              </div>
            </a>
          </div>

          {/* 右: フォーム */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-gray-500">
                  お名前
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-gray-500">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 block text-xs font-bold text-gray-500">
                件名
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                placeholder="ご相談内容について"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-gray-500">
                メッセージ
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                placeholder="お気軽にメッセージをお書きください。"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-lg bg-purple-600 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-60"
            >
              {status === 'sending' ? '送信中...' : 'メッセージを送る'}
            </button>

            {status === 'sent' && (
              <p className="text-sm font-medium text-green-600">
                送信しました。ありがとうございます！
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-red-600">
                送信に失敗しました。時間をおいて再度お試しください。
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact
