'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store in localStorage as fallback
    const contacts = JSON.parse(localStorage.getItem('contact-submissions') || '[]')
    contacts.push({ ...form, timestamp: new Date().toISOString() })
    localStorage.setItem('contact-submissions', JSON.stringify(contacts))
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <a href="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-8 inline-block">&larr; Back</a>

        {sent ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Message sent!</h1>
            <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-zinc-400 mb-8">Have a question or feedback? We'd love to hear from you.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none transition-colors resize-none"
                  placeholder="How can we help?" />
              </div>
              <button type="submit"
                className="w-full rounded-xl bg-white text-black py-3.5 font-semibold hover:bg-zinc-200 transition-colors">
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
