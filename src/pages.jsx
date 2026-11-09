import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import * as api from './api'
import { useAuth, useCart, useToast } from './store'
import { money, Spinner, SkeletonGrid, ErrorBox, Pagination, Field } from './components'

const LIMIT = 12
const useDebounce = (v, ms = 400) => {
  const [d, setD] = useState(v)
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t) }, [v, ms])
  return d
}

/* ---------- Shop ---------- */
export function Shop() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [cats, setCats] = useState([])
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const { dispatch } = useCart()
  const toast = useToast()
  const dq = useDebounce(q)

  useEffect(() => { api.getCategories().then(setCats).catch(() => {}) }, [])
  const load = useCallback(() => {
    const [sortBy, order] = sort ? sort.split(':') : ['', 'asc']
    setLoading(true); setErr('')
    api.getProducts({ limit: LIMIT, skip: (page - 1) * LIMIT, q: dq, category, sortBy, order })
      .then(setData).catch((e) => setErr(e.message)).finally(() => setLoading(false))
  }, [dq, category, sort, page])
  useEffect(load, [load])
  useEffect(() => setPage(1), [dq, category, sort])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Find what you need</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <input className="input" placeholder="Search products…" value={q} onChange={(e) => { setQ(e.target.value); setCategory('') }} aria-label="Search" />
        <select className="input" value={category} onChange={(e) => { setCategory(e.target.value); setQ('') }} aria-label="Category">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="">Sort: default</option>
          <option value="price:asc">Price: low to high</option>
          <option value="price:desc">Price: high to low</option>
          <option value="rating:desc">Top rated</option>
          <option value="title:asc">Name A–Z</option>
        </select>
      </div>
      <div className="mt-6">
        {err ? <ErrorBox message={err} onRetry={load} /> : loading ? <SkeletonGrid /> : data?.products.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No products match. Try a different search or category.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.products.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Link to={`/product/${p.id}`} className="bg-slate-100"><img src={p.thumbnail} alt={p.title} loading="lazy" className="aspect-square w-full object-contain" /></Link>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <Link to={`/product/${p.id}`} className="line-clamp-2 font-medium hover:text-brand">{p.title}</Link>
                  <p className="text-sm text-slate-500">★ {p.rating} · {p.category}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-bold">{money(p.price)}</span>
                    <button className="btn !px-3 !py-1 text-sm" onClick={() => { dispatch({ type: 'add', p }); toast('Added to cart') }}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {data && !err && <Pagination page={page} pages={Math.ceil(data.total / LIMIT)} onChange={(n) => { setPage(n); window.scrollTo(0, 0) }} />}
      </div>
    </div>
  )
}

/* ---------- Product detail ---------- */
export function ProductDetail() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [err, setErr] = useState('')
  const { dispatch } = useCart()
  const toast = useToast()
  const load = () => { setErr(''); setP(null); api.getProduct(id).then(setP).catch((e) => setErr(e.message)) }
  useEffect(load, [id])
  if (err) return <div className="mx-auto max-w-2xl p-6"><ErrorBox message={err} onRetry={load} /></div>
  if (!p) return <Spinner />
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <img src={p.images?.[0] || p.thumbnail} alt={p.title} className="w-full rounded-xl bg-white object-contain" />
      <div>
        <p className="text-sm text-slate-500">{p.brand} · {p.category}</p>
        <h1 className="mt-1 text-3xl font-extrabold">{p.title}</h1>
        <p className="mt-2 text-slate-600">{p.description}</p>
        <p className="mt-4 text-3xl font-bold">{money(p.price)}</p>
        <p className="text-sm text-slate-500">★ {p.rating} · {p.stock} in stock</p>
        <button className="btn mt-6" onClick={() => { dispatch({ type: 'add', p }); toast('Added to cart') }}>Add to cart</button>
      </div>
    </div>
  )
}

/* ---------- Cart ---------- */
export function Cart() {
  const { items, dispatch, total } = useCart()
  if (!items.length)
    return <div className="p-16 text-center"><p className="text-lg">Your cart is empty.</p><Link to="/" className="btn mt-4">Browse products</Link></div>
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Your cart</h1>
      <ul className="mt-6 divide-y rounded-xl border bg-white">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 p-3">
            <img src={i.thumbnail} alt="" className="h-16 w-16 rounded bg-slate-100 object-contain" />
            <div className="flex-1"><p className="font-medium">{i.title}</p><p className="text-sm text-slate-500">{money(i.price)}</p></div>
            <input type="number" min="1" className="input !w-16" value={i.qty} onChange={(e) => dispatch({ type: 'qty', id: i.id, qty: +e.target.value || 1 })} aria-label="Quantity" />
            <button className="text-sm text-red-600" onClick={() => dispatch({ type: 'remove', id: i.id })}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xl font-bold">Total: {money(total)}</p>
        <Link to="/checkout" className="btn">Checkout</Link>
      </div>
    </div>
  )
}

/* ---------- Checkout (form validation) ---------- */
const validate = (v) => {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Enter your full name.'
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address.'
  if (!/^\d{10}$/.test(v.phone)) e.phone = 'Phone number must be 10 digits.'
  if (v.address.trim().length < 10) e.address = 'Enter your full address (at least 10 characters).'
  return e
}
export function Checkout() {
  const { items, total, dispatch } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [v, setV] = useState({ name: '', email: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  if (!items.length) return <div className="p-16 text-center">Your cart is empty. <Link to="/" className="text-brand underline">Shop now</Link></div>
  const submit = (e) => {
    e.preventDefault()
    const er = validate(v)
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.unshift({ id: Date.now(), user: user.username, date: new Date().toLocaleString(), items, total, ship: v })
      localStorage.setItem('orders', JSON.stringify(orders))
      dispatch({ type: 'clear' }); toast('Order placed!'); nav('/orders')
    }, 900)
  }
  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-lg space-y-4 px-4 py-8">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <Field label="Full name" error={errors.name}><input className="input" value={v.name} onChange={set('name')} /></Field>
      <Field label="Email" error={errors.email}><input type="email" className="input" value={v.email} onChange={set('email')} /></Field>
      <Field label="Phone" error={errors.phone}><input inputMode="numeric" className="input" value={v.phone} onChange={set('phone')} /></Field>
      <Field label="Address" error={errors.address}><textarea rows="3" className="input" value={v.address} onChange={set('address')} /></Field>
      <button className="btn w-full" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
    </form>
  )
}

export function Orders() {
  const { user } = useAuth()
  const orders = JSON.parse(localStorage.getItem('orders') || '[]').filter((o) => o.user === user.username)
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Your orders</h1>
      {!orders.length && <p className="mt-6 text-slate-500">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="mt-4 rounded-xl border bg-white p-4">
          <div className="flex justify-between font-medium"><span>Order #{o.id}</span><span>{money(o.total)}</span></div>
          <p className="text-sm text-slate-500">{o.date} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
        </div>
      ))}
    </div>
  )
}

/* ---------- Login ---------- */
export function Login() {
  const { login, user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [v, setV] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (user) nav(loc.state?.from || '/', { replace: true }) }, [user])
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!v.username.trim()) er.username = 'Enter your username.'
    if (v.password.length < 4) er.password = 'Password must be at least 4 characters.'
    setErrors(er); setErr('')
    if (Object.keys(er).length) return
    setBusy(true)
    try { await login(v.username.trim(), v.password) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} noValidate className="mx-auto mt-10 max-w-sm space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-extrabold">Log in</h1>
      {err && <ErrorBox message={err} />}
      <Field label="Username" error={errors.username}><input className="input" value={v.username} onChange={(e) => setV({ ...v, username: e.target.value })} /></Field>
      <Field label="Password" error={errors.password}><input type="password" className="input" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
      <button className="btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <div className="rounded-lg bg-slate-50 p-3 text-sm">
        <p className="mb-2 font-medium">Demo accounts</p>
        <button type="button" className="btn-ghost mr-2 !py-1" onClick={() => setV({ username: 'emilys', password: 'emilyspass' })}>Admin</button>
        <button type="button" className="btn-ghost !py-1" onClick={() => setV({ username: 'michaelw', password: 'michaelwpass' })}>Customer</button>
      </div>
    </form>
  )
}

/* ---------- Admin ---------- */
export function Admin() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const dq = useDebounce(q)
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState([])
  const [removed, setRemoved] = useState([])
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ title: '', price: '', stock: '', category: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  useEffect(() => { api.getCategories().then(setCats).catch(() => {}) }, [])
  useEffect(() => setPage(1), [dq])
  const load = useCallback(() => {
    setLoading(true); setErr('')
    api.getProducts({ limit: 10, skip: (page - 1) * 10, q: dq }).then(setData).catch((e) => setErr(e.message)).finally(() => setLoading(false))
  }, [page, dq])
  useEffect(load, [load])

  const add = async (e) => {
    e.preventDefault()
    const er = {}
    if (form.title.trim().length < 3) er.title = 'Title needs at least 3 characters.'
    if (!(+form.price > 0)) er.price = 'Price must be greater than 0.'
    if (!Number.isInteger(+form.stock) || +form.stock < 0 || form.stock === '') er.stock = 'Stock must be a whole number, 0 or more.'
    if (!form.category) er.category = 'Choose a category.'
    setErrors(er)
    if (Object.keys(er).length) return
    setSaving(true)
    try {
      const res = await api.addProduct({ title: form.title, price: +form.price, stock: +form.stock, category: form.category })
      setAdded([{ ...res, price: +form.price, stock: +form.stock, category: form.category, title: form.title }, ...added])
      setForm({ title: '', price: '', stock: '', category: '' }); toast('Product added')
    } catch (x) { toast(x.message, 'err') } finally { setSaving(false) }
  }
  const del = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return
    try { await api.deleteProduct(p.id > 1000 ? 1 : p.id); setRemoved([...removed, p.id]); setAdded(added.filter((a) => a.id !== p.id)); toast('Product deleted') }
    catch (x) { toast(x.message, 'err') }
  }
  const rows = [...(page === 1 && !dq ? added : []), ...(data?.products || [])].filter((p) => !removed.includes(p.id))
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Admin · Products</h1>
      <p className="text-sm text-slate-500">Demo API: changes show here but are not saved on the server.</p>
      <form onSubmit={add} noValidate className="mt-5 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-5">
        <Field label="Title" error={errors.title}><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Price" error={errors.price}><input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Stock" error={errors.stock}><input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
        <Field label="Category" error={errors.category}>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select…</option>{cats.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <div className="flex items-end"><button className="btn w-full" disabled={saving}>{saving ? 'Saving…' : 'Add product'}</button></div>
      </form>
      <input className="input mt-5" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        {err ? <ErrorBox message={err} onRetry={load} /> : loading ? <Spinner /> : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.title}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td>
                  <td className="pr-3 text-right"><button className="text-red-600" onClick={() => del(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data && !err && <Pagination page={page} pages={Math.ceil(data.total / 10)} onChange={setPage} />}
    </div>
  )
}

export const NotFound = () => (
  <div className="p-16 text-center"><h1 className="text-5xl font-extrabold">404</h1><p className="mt-2 text-slate-600">That page doesn't exist.</p><Link to="/" className="btn mt-4">Go to shop</Link></div>
)
