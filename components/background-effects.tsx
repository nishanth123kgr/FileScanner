"use client"

import { useEffect, useState } from "react"

export default function BackgroundEffects() {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Simpler approach without relying on client-side Image constructor
  useEffect(() => {
    // Use a simple technique to check if the path is accessible
    const checkImageExists = async () => {
      try {
        const res = await fetch('/bg.png', { method: 'HEAD' })
        if (res.ok) {
          setImageLoaded(true)
          console.log('Background image exists and is accessible')
        } else {
          console.error('Background image exists but returned status:', res.status)
        }
      } catch (error) {
        console.error('Error checking for background image:', error)
      }
    }
    
    checkImageExists()
  }, [])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* SVG Background - using both techniques for maximum compatibility */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover"
        }}
      />

      {/* Fallback embedded SVG to ensure something always shows */}
      <div 
        className="absolute inset-0 opacity-40"
        dangerouslySetInnerHTML={{
          __html: `
            <svg 
              style="position: absolute; height: 200vh; width: 200vw; top: -0vh; left: -50vh; z-index: -1;"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 800 800">
              <defs>
                <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="bg-grad">
                  <stop stop-color="#e12228" stop-opacity="1" offset="0%"></stop>
                  <stop stop-color="#444444" stop-opacity="1" offset="100%"></stop>
                </linearGradient>
              </defs>
              <g stroke-width="6" stroke="url(#bg-grad)" fill="none">
                <path d="M372.0562859345773 -3.0238136378602007C389.34785619826084 -13.005308302029164 410.65214380173916 -13.005308302029164 427.9437140654227 -3.0210192664536635L735.0563091300431 174.29022959287227C752.3478793937267 184.27172425704129 763.0000231954658 202.72295865443982 763.0000231954658 222.68874235418434V577.3112400728363C763.0000231954658 597.2770237725808 752.3478793937267 615.7282581699794 735.0563091300431 625.7125472055549L427.9437140654227 803.0237960648808C410.65214380173916 813.0052907290496 389.34785619826084 813.0052907290496 372.0562859345773 803.0210016934743L64.94369086995681 625.7097528341484C47.65212060627334 615.7282581699794 36.99997680453424 597.2770237725808 36.99997680453424 577.3112400728363V222.68874235418434C36.99997680453424 202.72295865443982 47.65212060627334 184.27172425704129 64.94369086995681 174.28743522146584L372.0562859345773 -3.0238136378602007Z" transform="rotate(44, 400, 400)" opacity="0.69"></path>
              </g>
            </svg>
          `
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]"></div>
    </div>
  )
}
