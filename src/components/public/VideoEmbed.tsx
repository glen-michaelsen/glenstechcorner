'use client'
import { getYouTubeEmbedUrl } from '@/lib/youtube'

export default function VideoEmbed({ youtubeId }: { youtubeId: string }) {
  const embedUrl = getYouTubeEmbedUrl(youtubeId)
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  )
}
