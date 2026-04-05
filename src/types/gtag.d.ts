declare function gtag(...args: unknown[]): void

declare namespace YT {
  class Player {
    constructor(id: string, options: PlayerOptions)
    destroy(): void
  }
  interface PlayerOptions {
    events?: {
      onStateChange?: (event: OnStateChangeEvent) => void
    }
  }
  interface OnStateChangeEvent {
    data: number
  }
  const PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
}

interface Window {
  gtag: typeof gtag
  dataLayer: unknown[]
  YT: typeof YT
  onYouTubeIframeAPIReady: (() => void) | undefined
}
