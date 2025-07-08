'use client'

import { AuthForm } from '@/components/auth/AuthForm'

export function AuthSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>
        <AuthForm />
      </div>
    </section>
  )
}