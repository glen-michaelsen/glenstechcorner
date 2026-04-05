'use client'
import { useEffect, useRef } from 'react'

interface Props {
  youtubeId: string
  title?: string
}

export default function VideoEmbed({ youtubeId, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load YouTube iframe API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    let player: YT.Player | null = null
    let played = false

    function initPlayer() {
      const iframeId = `yt-${youtubeId}`
      if (!document.getElementById(iframeId)) return

      player = new window.YT.Player(iframeId, {
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // Track first play only
            if (event.data === window.YT.PlayerState.PLAYING && !played) {
              played = true
              if (typeof window.gtag !== 'undefined') {
                window.gtag('event', 'video_play', {
                  event_category: 'Video',
                  event_label: title ?? youtubeId,
                  video_id: youtubeId,
                })
              }
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        initPlayer()
      }
    }

    return () => {
      try { player?.destroy() } catch {}
    }
  }, [youtubeId, title])

  return (
    <div ref={containerRef} className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
      <iframe
        id={`yt-${youtubeId}`}
        src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
        title={title ?? 'YouTube video player'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  )
}
