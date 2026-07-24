import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Users, UserCheck, UserX, ClipboardCheck, ArrowRight, CalendarDays } from "lucide-react"
import { getDashboardStats } from "../lib/api"
import { useToast } from "../components/Toast.jsx"
import { Spinner } from "../components/ui.jsx"

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    primary: "bg-accent text-accent-foreground",
    success: "bg-success-muted text-success",
    danger: "bg-danger-muted text-danger",
    muted: "bg-muted text-muted-foreground",
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getDashboardStats()
        if (active) setStats(data)
      } catch (err) {
        toast.error(err.message || "Failed to load dashboard")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const prettyDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {prettyDate}
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Students" value={stats.totalStudents} icon={Users} tone="primary" />
            <StatCard label="Present Today" value={stats.present} icon={UserCheck} tone="success" />
            <StatCard label="Absent Today" value={stats.absent} icon={UserX} tone="danger" />
            <StatCard label="Marked Today" value={stats.marked} icon={ClipboardCheck} tone="muted" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickAction
              to="/attendance"
              title="Mark Today's Attendance"
              description="Record present or absent for each student."
              icon={ClipboardCheck}
            />
            <QuickAction
              to="/students"
              title="Manage Students"
              description="Add, edit, or remove student records."
              icon={Users}
            />
          </div>

          {stats.totalStudents > 0 && stats.marked === 0 && (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-accent p-5">
              <p className="font-medium text-accent-foreground">Attendance not taken yet today</p>
              <p className="mt-1 text-sm text-accent-foreground/80">
                You have {stats.totalStudents} students but no attendance recorded for today.
              </p>
              <Link
                to="/attendance"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Mark attendance now <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function QuickAction({ to, title, description, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-card-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
