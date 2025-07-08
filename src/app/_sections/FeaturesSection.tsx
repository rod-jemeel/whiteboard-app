'use client'

import { useAppSelector } from '@/store/hooks'

export function FeaturesSection() {
  const { featuredContent } = useAppSelector((state) => state.root)
  
  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-semibold text-center mb-8">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {featuredContent.map((feature, index) => (
          <div key={index} className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}