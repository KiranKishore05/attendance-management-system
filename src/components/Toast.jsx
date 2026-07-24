import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => remove(id), 3500)
    },
    [remove],
  )

  const toast = {
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
              t.type === "success"
                ? "border-success/30 bg-success-muted text-success"
                : "border-danger/30 bg-danger-muted text-danger"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium leading-relaxed text-foreground">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
