import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react"
import { getStudents, addStudent, updateStudent, deleteStudent } from "../lib/api"
import { useToast } from "../components/Toast.jsx"
import { Spinner, EmptyState, Modal, ConfirmDialog } from "../components/ui.jsx"

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const emptyForm = { name: "", roll_number: "", department: "", year: "1st Year" }

export default function Students() {
  const toast = useToast()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await getStudents()
      setStudents(data)
    } catch (err) {
      toast.error(err.message || "Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q),
    )
  }, [students, query])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(student) {
    setEditing(student)
    setForm({
      name: student.name,
      roll_number: student.roll_number,
      department: student.department,
      year: student.year,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.roll_number.trim() || !form.department.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      setSaving(true)
      if (editing) {
        await updateStudent(editing.id, form)
        toast.success("Student updated successfully")
      } else {
        await addStudent(form)
        toast.success("Student added successfully")
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      if (err.code === "23505") {
        toast.error("That roll number already exists")
      } else {
        toast.error(err.message || "Failed to save student")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteStudent(deleteTarget.id)
      toast.success("Student deleted")
      setDeleteTarget(null)
      await load()
    } catch (err) {
      toast.error(err.message || "Failed to delete student")
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">{students.length} total students</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Add Student
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or roll number..."
          className="w-full rounded-lg border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? "No matching students" : "No students yet"}
            description={query ? "Try a different search term." : "Add your first student to get started."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Roll No.</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">{s.roll_number}</td>
                    <td className="px-4 py-3 text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-primary"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-danger-muted hover:text-danger"
                          aria-label={`Delete ${s.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jane Doe"
              className={inputClass}
            />
          </Field>
          <Field label="Roll Number">
            <input
              type="text"
              value={form.roll_number}
              onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
              placeholder="e.g. CS2021045"
              className={inputClass}
            />
          </Field>
          <Field label="Department">
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Computer Science"
              className={inputClass}
            />
          </Field>
          <Field label="Year">
            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className={inputClass}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : editing ? "Update Student" : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This will also remove their attendance records.`}
      />
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
