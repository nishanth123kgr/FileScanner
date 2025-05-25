"use client"

import { motion } from "framer-motion"
import { FeatureCardProps } from "../types"

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  accentColor, 
  delay 
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card-glassmorphism p-5 red-accent-border relative overflow-hidden group rounded-lg"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r from-${accentColor}-500/5 via-${accentColor}-500/0 to-${accentColor}-500/5 group-hover:from-${accentColor}-500/10 opacity-50 group-hover:opacity-100 transition-opacity rounded-lg`}></div>
      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
        <div className={`p-1.5 rounded-md bg-${accentColor}-500/10`}>
          {icon}
        </div>
        {title}
      </h4>
      <p className="text-sm text-zinc-400">
        {description}
      </p>
    </motion.div>
  )
}