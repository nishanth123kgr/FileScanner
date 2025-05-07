"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AlertTriangle, X } from "lucide-react"
import { motion } from "framer-motion"

export const DetectedIssues = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="rounded-lg text-card-foreground shadow-none animate-fadeIn bg-black/40 backdrop-blur-md border border-zinc-800/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          Detected Issues
        </h3>

        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-red-950/30 to-red-900/10 border border-red-500/20 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:bg-red-950/40">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-red-500/10 blur-2xl group-hover:bg-red-500/20 transition-all duration-300"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Trojan.Win32.Generic</h4>
                  <p className="text-zinc-400 mt-2">
                    Malicious code detected at offset 0x1A3F that matches known trojan signatures. This type of
                    malware can provide unauthorized access to your system.
                  </p>
                  <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-800/50">
                    <code>4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 B8 00 00 00 00 00 00 00 40 00 00 00</code>
                  </div>
                </div>
              </div>
              <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                Critical
              </Badge>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-orange-950/30 to-orange-900/10 border border-orange-500/20 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:bg-orange-950/40">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-300"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Suspicious API Calls</h4>
                  <p className="text-zinc-400 mt-2">
                    Multiple suspicious Windows API calls detected that may indicate keylogging behavior. These APIs
                    are commonly used to monitor keyboard input.
                  </p>
                  <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-800/50">
                    <code>GetAsyncKeyState, SetWindowsHookEx, GetForegroundWindow</code>
                  </div>
                </div>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30">
                High
              </Badge>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-950/30 to-yellow-900/10 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:bg-yellow-950/40">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-yellow-500/10 blur-2xl group-hover:bg-yellow-500/20 transition-all duration-300"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Obfuscated Code</h4>
                  <p className="text-zinc-400 mt-2">
                    Heavily obfuscated code detected that may be hiding malicious functionality. Obfuscation is often
                    used to evade detection.
                  </p>
                  <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-800/50">
                    <code>
                      eval(function(p,a,c,k,e,d)&#123;e=function(c)&#123;return
                      c&#125;;if(!''.replace(/^/,String))&#123;
                    </code>
                  </div>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30">
                Medium
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}