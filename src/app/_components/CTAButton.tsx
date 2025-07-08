import Link from 'next/link'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function CTAButton({ href, children, variant = 'primary' }: CTAButtonProps) {
  const className = variant === 'primary'
    ? 'bg-blue-500 text-white hover:bg-blue-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    
  return (
    <Link
      href={href}
      className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}