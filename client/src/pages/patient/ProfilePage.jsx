import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Save, Camera, Loader2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { profileApi } from '../../api/profileApi'
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { user, setUser }      = useAuth()
  const fileInputRef           = useRef(null)
  const [form, setForm]        = useState({ name: '', email: '' })
  const [saving, setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [success, setSuccess]  = useState('')
  const [error, setError]      = useState('')

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' })
      // Show existing avatar from backend if available
      if (user.avatar) setAvatarPreview(user.avatar)
    }
  }, [user])

  // ── Save profile name ────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await profileApi.update({ name: form.name.trim() })
      // response.data is the updated user from backend
      const updated = res.data || res
      setUser(prev => ({ ...prev, name: updated.name }))
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Open the hidden file picker when camera button is clicked ────────
  function handleCameraClick() {
    fileInputRef.current?.click()
  }

  // ── Handle file selection + upload ───────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate on the client before sending
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }

    // Show an instant local preview while uploading
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true); setError(''); setSuccess('')
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await profileApi.uploadAvatar(formData)
      const { avatarUrl } = res.data || res
      // Persist the returned server URL
      setUser(prev => ({ ...prev, avatar: avatarUrl }))
      setAvatarPreview(avatarUrl)
      setSuccess('Profile photo updated successfully.')
    } catch (err) {
      // Revert preview on failure
      setAvatarPreview(user?.avatar || null)
      setError(err.response?.data?.message || 'Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
      // Reset the input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const joinDate = user?.joinedAt || user?.createdAt
  const roleColor = ROLE_COLORS[user?.role] || ''

  return (
    <AppLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-warm-900">My Profile</h1>
          <p className="text-warm-500 text-sm mt-0.5">Manage your personal information</p>
        </div>

        {/* ── Avatar card ─────────────────────────────────────────────── */}
        <Card className="mb-5">
          <div className="flex items-center gap-5">
            <div className="relative inline-block flex-shrink-0">
              {/* Show preview/uploaded avatar, fall back to initials */}
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Your profile photo"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100"
                />
              ) : (
                <Avatar name={user?.name} size="xl" />
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload profile photo"
              />

              {/* Camera button — triggers file picker */}
              <button
                type="button"
                onClick={handleCameraClick}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white
                           flex items-center justify-center shadow-md
                           hover:bg-primary-700 active:bg-primary-800
                           transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1
                           disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Change profile photo"
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  : <Camera  className="w-3.5 h-3.5" aria-hidden="true" />
                }
              </button>
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-warm-900 truncate">{user?.name}</h2>
              <p className="text-warm-400 text-sm truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {roleColor && (
                  <Badge className={roleColor}>
                    {ROLE_LABELS[user?.role] || user?.role}
                  </Badge>
                )}
                {joinDate && (
                  <span className="text-xs text-warm-400">
                    Member since {format(new Date(joinDate), 'MMMM yyyy')}
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-400 mt-1.5">
                Click the camera icon to change your photo (JPEG, PNG or WebP · max 5 MB)
              </p>
            </div>
          </div>
        </Card>

        {/* ── Info form ────────────────────────────────────────────────── */}
        <Card>
          <CardTitle className="mb-5">Personal Information</CardTitle>

          {success && (
            <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="error" className="mb-4" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSave} noValidate aria-label="Profile update form">
            <div className="space-y-4 mb-6">
              <Input
                label="Full name"
                id="profile-name"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                icon={User}
                required
                placeholder="Your full name"
                autoComplete="name"
              />
              <Input
                label="Email address"
                id="profile-email"
                value={form.email}
                icon={Mail}
                disabled
                hint="Email cannot be changed here. Contact support if needed."
              />
            </div>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
