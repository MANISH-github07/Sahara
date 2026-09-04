import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const home = user?.role === 'doctor' ? '/doctor/dashboard'
             : user?.role === 'admin'  ? '/admin/dashboard'
             : '/dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-danger-100 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-danger-500" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-warm-900 mb-3">Access Restricted</h1>
        <p className="text-warm-500 leading-relaxed mb-8">
          You don't have permission to view this page. This area requires a different role or additional authorization.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go Back
          </button>
          <Link to={home} className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
