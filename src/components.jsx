import { useState } from 'react'
import { Link, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth, useCart } from './store'

export const money = (n) => '$' + Number(n).toFixed(2)

export function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const link = ({ isActive }) => `px-2 py-1 ${isActive ? 'text-brand font-bold' : 'hover:text-brand'}`
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">Shop<span className="text-brand">wise</span></Link>
        <button className="md:hidden btn-ghost" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-1 border-b bg-white p-4 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:p-0`} onClick={() => setOpen(false)}>
          <NavLink to="/" end className={link}>Shop</NavLink>
          <NavLink to="/cart" className={link}>Cart ({count})</NavLink>
          {user && <NavLink to="/orders" className={link}>Orders</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
          {user ? (
            <button className="btn-ghost md:ml-3" onClick={logout}>Log out ({user.name})</button>
          ) : (
            <Link to="/login" className="btn md:ml-3">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(user.role))
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-slate-600">Your account ({user.role}) can't open this page.</p>
        <Link to="/" className="btn mt-4">Back to shop</Link>
      </div>
    )
  return children
}

export const Spinner = () => <div className="flex justify-center p-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" /></div>

export const SkeletonGrid = ({ n = 8 }) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: n }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />)}
  </div>
)

export const ErrorBox = ({ message, onRetry }) => (
  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
    <p className="font-medium text-red-700">{message}</p>
    {onRetry && <button className="btn mt-3" onClick={onRetry}>Try again</button>}
  </div>
)

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i)
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button className="btn-ghost" disabled={page === 1} onClick={() => onChange(page - 1)}>Prev</button>
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} className={n === page ? 'btn' : 'btn-ghost'}>{n}</button>
      ))}
      <button className="btn-ghost" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  )
}

export const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium">{label}</span>
    {children}
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)
