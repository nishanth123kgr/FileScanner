"use client"


export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* SVG Background - using both techniques for maximum compatibility */}
      

      {/* Grid blueprint background */}
      <div className="absolute inset-0 grid-blueprint"></div>

    </div>
  )
}
