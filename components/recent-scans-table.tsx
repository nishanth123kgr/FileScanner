import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const recentScans = [
  {
    id: "VS-2023-05-12",
    type: "Vulnerability Scan",
    target: "Main Server (192.168.1.10)",
    date: "May 12, 2023 - 14:32",
    status: "Completed",
    findings: "3 Critical, 7 Medium",
  },
  {
    id: "FS-2023-05-11",
    type: "File Scan",
    target: "webapp.zip (25MB)",
    date: "May 11, 2023 - 09:15",
    status: "Completed",
    findings: "1 Malware Detected",
  },
  {
    id: "LA-2023-05-10",
    type: "Log Analysis",
    target: "Authentication Logs",
    date: "May 10, 2023 - 22:45",
    status: "Completed",
    findings: "5 Suspicious Activities",
  },
  {
    id: "PT-2023-05-09",
    type: "Penetration Test",
    target: "Web Application",
    date: "May 9, 2023 - 11:20",
    status: "Failed",
    findings: "Test Incomplete",
  },
  {
    id: "VS-2023-05-08",
    type: "Vulnerability Scan",
    target: "Database Server",
    date: "May 8, 2023 - 16:05",
    status: "Completed",
    findings: "No Issues Found",
  },
]

export default function RecentScansTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">ID</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Type</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Target</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Date</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Status</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400">Findings</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentScans.map((scan) => (
            <tr key={scan.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
              <td className="py-3 px-4 text-sm text-zinc-300">{scan.id}</td>
              <td className="py-3 px-4 text-sm text-zinc-300">{scan.type}</td>
              <td className="py-3 px-4 text-sm text-zinc-300">{scan.target}</td>
              <td className="py-3 px-4 text-sm text-zinc-400">{scan.date}</td>
              <td className="py-3 px-4">
                <Badge
                  className={`${
                    scan.status === "Completed"
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : scan.status === "Failed"
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                  }`}
                >
                  {scan.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-zinc-300">{scan.findings}</td>
              <td className="py-3 px-4 text-right">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
