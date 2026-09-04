import React from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 text-primary-500" aria-hidden="true" />
        </div>
        <h1 className="text-6xl font-bold text-warm-200 mb-4" aria-hidden="true">404</h1>
        <h2 className="text-2xl font-bold text-warm-900 mb-3">Page not found</h2>
        <p className="text-warm-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  )
}
