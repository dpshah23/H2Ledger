import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword, validateRequired } from '../utils/validation'
import { Zap } from 'lucide-react'
import { BRAND } from '../utils/constants'

// ---------- Only two roles now ----------
const ROLE_OPTIONS = [
  { value: '', label: 'Select role' },
  { value: 'producer', label: 'Producer' },
  { value: 'consumer', label: 'Consumer' },
]

export const Register: React.FC = () => {
  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    wallet_address: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ---------- Auth Context ----------
  const { register, isAuthenticated } = useAuth()

  // Redirect logged-in users
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // ---------- Handle Input Change ----------
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' })) // clear error on change
    }
  }

  // ---------- Handle Form Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // ---------- Validation ----------
    const newErrors: Record<string, string> = {}

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Name is required'
    }
    if (!validateRequired(formData.role)) {
      newErrors.role = 'Role is required'
    }
    if (!validateRequired(formData.wallet_address)) {
      newErrors.wallet_address = 'Wallet address is required'
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || 'Password is invalid'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Stop if there are validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // ---------- Call Register from Auth Context ----------
    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role as 'producer' | 'consumer',
        formData.wallet_address
      )
      // After successful registration, redirect to login page
      window.location.href = '/login?registered=true' // simple redirect
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{BRAND.name}</h1>
              <p className="text-sm text-muted-foreground">{BRAND.description}</p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Create Account</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Join the green hydrogen credits marketplace
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* General Error */}
              {errors.general && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleChange('role')}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${errors.role ? 'border-destructive' : ''}`}
                >
                  {ROLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>

              {/* Wallet Address Field */}
              <div className="space-y-2">
                <Label htmlFor="wallet_address">Wallet Address</Label>
                <Input
                  id="wallet_address"
                  placeholder="0x1234..."
                  value={formData.wallet_address}
                  onChange={handleChange('wallet_address')}
                  className={errors.wallet_address ? 'border-destructive' : ''}
                />
                {errors.wallet_address && <p className="text-sm text-destructive">{errors.wallet_address}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Link to Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
