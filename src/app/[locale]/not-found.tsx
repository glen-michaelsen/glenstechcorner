import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found</p>
      <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
        Go home &rarr;
      </Link>
    </div>
  )
}
