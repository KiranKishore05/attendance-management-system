import { supabase } from "./supabase"

// Returns today's date as YYYY-MM-DD (local time)
export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

/* ----------------------------- Students ----------------------------- */

export async function getStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("roll_number", { ascending: true })
  if (error) throw error
  return data
}

export async function addStudent(student) {
  const { data, error } = await supabase.from("students").insert(student).select().single()
  if (error) throw error
  return data
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id)
  if (error) throw error
}

/* ---------------------------- Attendance ---------------------------- */

export async function getAttendanceByDate(date) {
  const { data, error } = await supabase.from("attendance").select("*").eq("date", date)
  if (error) throw error
  return data
}

// Upsert a single student's attendance for a given date
export async function markAttendance(studentId, date, status) {
  const { data, error } = await supabase
    .from("attendance")
    .upsert({ student_id: studentId, date, status }, { onConflict: "student_id,date" })
    .select()
    .single()
  if (error) throw error
  return data
}

// Save a full batch of records for a date
export async function saveAttendanceBatch(records) {
  const { data, error } = await supabase
    .from("attendance")
    .upsert(records, { onConflict: "student_id,date" })
    .select()
  if (error) throw error
  return data
}

// Attendance history joined with student info, newest first
export async function getAttendanceHistory() {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, students(name, roll_number, department, year)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

/* ----------------------------- Dashboard ---------------------------- */

export async function getDashboardStats() {
  const date = todayISO()

  const { count: totalStudents, error: sErr } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
  if (sErr) throw sErr

  const { data: todays, error: aErr } = await supabase
    .from("attendance")
    .select("status")
    .eq("date", date)
  if (aErr) throw aErr

  const present = todays.filter((r) => r.status === "Present").length
  const absent = todays.filter((r) => r.status === "Absent").length

  return { totalStudents: totalStudents || 0, present, absent, marked: todays.length, date }
}
