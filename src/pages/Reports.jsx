import { useEffect, useMemo, useState } from "react"
import { Download, FileBarChart, Search, UserCheck, UserX } from "lucide-react"
import { getAttendanceHistory, todayISO } from "../lib/api"
import { useToast } from "../components/Toast.jsx"
import { Spinner, EmptyState, Badge } from "../components/ui.jsx"

export default function Reports() {
  const toast = useToast()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(todayISO())
  const [query, setQuery] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getAttendanceHistory()
        setHistory(data)
      } catch (err) {
        toast.error(err.message || "Failed to load reports")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Records for the selected date + search filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return history.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false
      if (!q) return true
      const s = r.students
      return (
        s?.name?.toLowerCase().includes(q) || s?.roll_number?.toLowerCase().includes(q)
      )
    })
  }, [history, dateFilter, query])

  const dailyPresent = filtered.filter((r) => r.status === "Present").length
  const dailyAbsent = filtered.filter((r) => r.status === "Absent").length

  const availableDates = useMemo(() => {
    return [...new Set(history.map((r) => r.date))].sort((a, b) => (a < b ? 1 : -1))
  }, [history])

  function exportCSV() {
    const rows = filtered.length ? filtered : history
    if (rows.length === 0) {
      toast.error("No attendance records to export")
      return
    }
    const header = ["Date", "Roll Number", "Name", "Department", "Year", "Status"]
    const csvRows = rows.map((r) => [
      r.date,
      r.students?.roll_number ?? "",
      r.students?.name ?? "",
      r.students?.department ?? "",
      r.students?.year ?? "",
      r.status,
    ])

    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [header, ...csvRows].map((row) => row.map(escape).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const label = dateFilter || "all"
    link.download = `attendance-${label}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("CSV exported successfully")
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Daily attendance report and history</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Filter by date</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All dates</option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Search student</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or roll number..."
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </label>
      </div>

      {/* Daily summary */}
      {dateFilter && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success-muted p-4">
            <UserCheck className="size-6 text-success" />
            <div>
              <p className="text-2xl font-bold text-success">{dailyPresent}</p>
              <p className="text-sm font-medium text-success">Present</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger-muted p-4">
            <UserX className="size-6 text-danger" />
            <div>
              <p className="text-2xl font-bold text-danger">{dailyAbsent}</p>
              <p className="text-sm font-medium text-danger">Absent</p>
            </div>
          </div>
        </div>
      )}

      {/* History table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileBarChart}
            title="No attendance records"
            description="Records will appear here once attendance is saved."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Roll No.</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.students?.roll_number}</td>
                    <td className="px-4 py-3 text-foreground">{r.students?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.students?.department}</td>
                    <td className="px-4 py-3">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
