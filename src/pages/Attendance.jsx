import { useEffect, useMemo, useState } from "react"
import { Search, Check, X, Save, Users, CheckCheck } from "lucide-react"
import { getStudents, getAttendanceByDate, saveAttendanceBatch, todayISO } from "../lib/api"
import { useToast } from "../components/Toast.jsx"
import { Spinner, EmptyState } from "../components/ui.jsx"

export default function Attendance() {
  const toast = useToast()
  const [students, setStudents] = useState([])
  const [statuses, setStatuses] = useState({}) // { studentId: "Present" | "Absent" }
  const [date, setDate] = useState(todayISO())
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load(selectedDate) {
    try {
      setLoading(true)
      const [studentList, existing] = await Promise.all([
        getStudents(),
        getAttendanceByDate(selectedDate),
      ])
      setStudents(studentList)
      const map = {}
      existing.forEach((r) => {
        map[r.student_id] = r.status
      })
      setStatuses(map)
    } catch (err) {
      toast.error(err.message || "Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(date)
  }, [date])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q),
    )
  }, [students, query])

  function setStatus(studentId, status) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  function markAll(status) {
    const map = {}
    students.forEach((s) => {
      map[s.id] = status
    })
    setStatuses(map)
  }

  const markedCount = Object.keys(statuses).length
  const presentCount = Object.values(statuses).filter((s) => s === "Present").length
  const absentCount = Object.values(statuses).filter((s) => s === "Absent").length

  async function handleSave() {
    const records = students
      .filter((s) => statuses[s.id])
      .map((s) => ({ student_id: s.id, date, status: statuses[s.id] }))

    if (records.length === 0) {
      toast.error("Mark at least one student before saving")
      return
    }
    try {
      setSaving(true)
      await saveAttendanceBatch(records)
      toast.success(`Attendance saved for ${records.length} student(s)`)
    } catch (err) {
      toast.error(err.message || "Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-sm text-muted-foreground">
            {presentCount} present · {absentCount} absent · {markedCount}/{students.length} marked
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Date</span>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => markAll("Present")}
            disabled={students.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-muted px-3 py-2.5 text-sm font-medium text-success hover:opacity-90 disabled:opacity-50"
          >
            <CheckCheck className="size-4" /> All Present
          </button>
          <button
            onClick={() => markAll("Absent")}
            disabled={students.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2.5 text-sm font-medium text-danger hover:opacity-90 disabled:opacity-50"
          >
            <X className="size-4" /> All Absent
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? "No matching students" : "No students to mark"}
            description={query ? "Try a different search." : "Add students first from the Students page."}
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.roll_number} · {s.department} · {s.year}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setStatus(s.id, "Present")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      statuses[s.id] === "Present"
                        ? "bg-success text-success-foreground"
                        : "border border-border bg-card text-muted-foreground hover:bg-success-muted hover:text-success"
                    }`}
                  >
                    <Check className="size-4" /> Present
                  </button>
                  <button
                    onClick={() => setStatus(s.id, "Absent")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      statuses[s.id] === "Absent"
                        ? "bg-danger text-danger-foreground"
                        : "border border-border bg-card text-muted-foreground hover:bg-danger-muted hover:text-danger"
                    }`}
                  >
                    <X className="size-4" /> Absent
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {students.length > 0 && (
        <div className="sticky bottom-4 mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      )}
    </div>
  )
}
