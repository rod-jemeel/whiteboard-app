'use client'

import { useAppSelector } from '@/store/hooks'

export function HeroSection() {
  const { welcomeMessage } = useAppSelector((state) => state.root)
  
  return (
    <section className="py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{welcomeMessage}</h1>
      <p className="text-lg text-gray-600">Collaborate and create with our powerful whiteboard tools</p>
    </section>
  )
}