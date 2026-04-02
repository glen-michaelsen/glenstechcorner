import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { getYouTubeThumbnailUrl } from '@/lib/youtube'

interface VideoCardProps {
  slug: string
  categorySlug: string
  locale: string
  youtubeId: string
  thumbnailUrl: string | null
  title: string
  subtitle: string | null
  publishedAt: Date
}

export default function VideoCard({
  slug,
  categorySlug,
  locale,
  youtubeId,
  thumbnailUrl,
  title,
  subtitle,
  publishedAt,
}: VideoCardProps) {
  const thumb = thumbnailUrl ?? getYouTubeThumbnailUrl(youtubeId)

  return (
    <Link href={`/${locale}/${categorySlug}/${slug}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
        <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <Image
            src={thumb}
            alt={title}
            width={640}
            height={360}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 transition-colors" style={{ color: '#1a1a1a' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm mt-1 line-clamp-2" style={{ color: '#666' }}>{subtitle}</p>
          )}
          <p className="text-xs mt-2" style={{ color: '#999' }}>
            {new Date(publishedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
