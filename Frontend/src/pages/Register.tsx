// import React, { useState } from 'react'
// import { Link, Navigate } from 'react-router-dom'
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
// import { Button } from '../components/ui/button'
// import { Input } from '../components/ui/input'
// import { Label } from '../components/ui/label'
// import { useAuth } from '../context/AuthContext'
// import { validateEmail, validatePassword, validateRequired } from '../utils/validation'
// import { Zap } from 'lucide-react'
// import { BRAND } from '../utils/constants'

// export const Register: React.FC = () => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   const { register, isAuthenticated } = useAuth()

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />
//   }

//   const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({ ...prev, [field]: e.target.value }))
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }))
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setErrors({})

//     // Validation
//     const newErrors: Record<string, string> = {}
    
//     if (!validateRequired(formData.firstName)) {
//       newErrors.firstName = 'First name is required'
//     }
//     if (!validateRequired(formData.lastName)) {
//       newErrors.lastName = 'Last name is required'
//     }
//     if (!validateEmail(formData.email)) {
//       newErrors.email = 'Please enter a valid email address'
//     }
    
//     const passwordValidation = validatePassword(formData.password)
//     if (!passwordValidation.isValid) {
//       newErrors.password = passwordValidation.message || 'Password is invalid'
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match'
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors)
//       setIsLoading(false)
//       return
//     }

//     try {
//       await register(formData.email, formData.password, formData.firstName, formData.lastName)
//     } catch (error) {
//       setErrors({ general: 'Registration failed. Please try again.' })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="flex justify-center mb-8">
//           <div className="flex items-center space-x-2">
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
//               <Zap className="h-7 w-7" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">{BRAND.name}</h1>
//               <p className="text-sm text-muted-foreground">{BRAND.description}</p>
//             </div>
//           </div>
//         </div>

//         <Card>
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-semibold text-center">Create Account</CardTitle>
//             <p className="text-sm text-muted-foreground text-center">
//               Join the green hydrogen credits marketplace
//             </p>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {errors.general && (
//                 <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
//                   {errors.general}
//                 </div>
//               )}

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     placeholder="John"
//                     value={formData.firstName}
//                     onChange={handleChange('firstName')}
//                     className={errors.firstName ? 'border-destructive' : ''}
//                   />
//                   {errors.firstName && (
//                     <p className="text-sm text-destructive">{errors.firstName}</p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     placeholder="Doe"
//                     value={formData.lastName}
//                     onChange={handleChange('lastName')}
//                     className={errors.lastName ? 'border-destructive' : ''}
//                   />
//                   {errors.lastName && (
//                     <p className="text-sm text-destructive">{errors.lastName}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   value={formData.email}
//                   onChange={handleChange('email')}
//                   className={errors.email ? 'border-destructive' : ''}
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-destructive">{errors.email}</p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Create a secure password"
//                   value={formData.password}
//                   onChange={handleChange('password')}
//                   className={errors.password ? 'border-destructive' : ''}
//                 />
//                 {errors.password && (
//                   <p className="text-sm text-destructive">{errors.password}</p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   placeholder="Confirm your password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange('confirmPassword')}
//                   className={errors.confirmPassword ? 'border-destructive' : ''}
//                 />
//                 {errors.confirmPassword && (
//                   <p className="text-sm text-destructive">{errors.confirmPassword}</p>
//                 )}
//               </div>

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? 'Creating account...' : 'Create Account'}
//               </Button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-muted-foreground">
//                 Already have an account?{' '}
//                 <Link
//                   to="/login"
//                   className="font-medium text-primary hover:underline"
//                 >
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// src/pages/Register.tsx
import React, { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useAuth } from "../context/AuthContext"
import { Zap } from "lucide-react"
import { BRAND } from "../utils/constants"

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    wallet_address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // default
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { register, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    try {
      const success = await register(
        formData.name,
        formData.wallet_address,
        formData.email,
        formData.password,
        formData.role as "producer" | "buyer"
      )
      if (success) {
        alert("Signup successful! Please login.")
      }
    } catch (err) {
      setErrors({ general: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <div className="w-full max-w-md">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange("name")} />
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="wallet_address">Wallet Address</Label>
                <Input
                  id="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleChange("wallet_address")}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleChange("role")}
                  className="w-full border rounded-md p-2"
                >
                  <option value="buyer">Buyer / Consumer</option>
                  <option value="producer">Producer</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
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
