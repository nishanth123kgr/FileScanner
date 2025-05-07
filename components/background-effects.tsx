"use client"

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80"></div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-[20%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
      
      {/* Grid blueprint background with improved opacity */}
      <div className="absolute inset-0 bg-[url('/bg.svg')] bg-repeat opacity-[0.03]"></div>

      {/* Subtle moving particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.01)_0,_transparent_8%)] bg-[length:24px_24px]"></div>
    </div>
  )
}
