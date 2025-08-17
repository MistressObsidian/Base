import { useEffect, useMemo, useState } from 'react'

const SHEETDB_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u'
const REQUESTS_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/requests'
const TX_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/transactions'

export default function Admin() {
  // Admin auth state
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState('')

  const btn = useMemo(()=>({ background:'linear-gradient(90deg,#1652f0 60%,#0f3ac0 100%)',color:'#fff',border:'none',fontWeight:700,padding:'8px 14px',borderRadius:10,cursor:'pointer'}),[])

  useEffect(() => {
    const e = localStorage.getItem('user_email')
    setEmail(e||'')
    const a = localStorage.getItem('admin_authed') === '1'
    setAdminAuthed(a)
    if (!a) {
      // Redirect away if not authed
      window.location.href = '/'
      return
    }
    load()
  }, [])

  const load = async () => {
    if (!adminAuthed) return
    setLoading(true)
    try {
      const res = await fetch(`${REQUESTS_API}/search?status=${filter}`)
      const data = await res.json()
      if (Array.isArray(data)) setRequests(data.sort((a,b)=> new Date(b.date)-new Date(a.date)))
    } finally {
      setLoading(false)
    }
  }

  const onAdminLogout = () => {
    localStorage.removeItem('admin_authed')
    setAdminAuthed(false)
    setRequests([])
  window.location.href = '/'
  }

  const approve = async (r) => {
    // Update balances and log tx, then mark request approved
    const amt = parseFloat(r.amount||'0')
    if (isNaN(amt) || amt<=0) return

    if (r.type === 'Deposit') {
      await adjustBalance(r.user_email, +amt)
      await logTx({ user_email: r.user_email, date: new Date().toLocaleString(), type: 'Deposit (approved)', amount: `+$${amt.toFixed(2)}` })
    } else if (r.type === 'Withdraw') {
      await adjustBalance(r.user_email, -amt)
      await logTx({ user_email: r.user_email, date: new Date().toLocaleString(), type: 'Withdraw (approved)', amount: `-$${amt.toFixed(2)}` })
    } else if (r.type === 'Send') {
      await adjustBalance(r.user_email, -amt)
      if (r.target_email) await adjustBalance(r.target_email, +amt)
      await logTx({ user_email: r.user_email, date: new Date().toLocaleString(), type: `Send to ${r.target_email} (approved)`, amount: `-$${amt.toFixed(2)}` })
    }
    await setRequestStatus(r.id, 'approved')
    setToast('Approved')
    await load()
  }

  const reject = async (r) => {
    await setRequestStatus(r.id, 'rejected')
    setToast('Rejected')
    await load()
  }

  const setRequestStatus = async (id, status) => {
    await fetch(`${REQUESTS_API}/id/${encodeURIComponent(id)}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { status } }) })
  }

  const adjustBalance = async (user_email, delta) => {
    const found = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(user_email)}`).then(r=>r.json())
    if (!found.length) return
    const curr = parseFloat(found[0].balance||'0') || 0
    const next = curr + delta
    await fetch(`${SHEETDB_API}/email/${encodeURIComponent(user_email)}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { balance: String(next) } }) })
  }

  const logTx = async (tx) => {
    await fetch(TX_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [tx] }) })
  }

  if (!adminAuthed) return null

  return (
    <div style={{maxWidth:1100,margin:'24px auto',padding:'1rem'}}>
      <h1 style={{fontSize:'1.8rem',fontWeight:800, color:'#1652f0'}}>Admin Console</h1>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'6px 0 12px'}}>
        <div style={{color:'#6b7280'}}>Signed in as admin</div>
        <button onClick={onAdminLogout} style={{background:'#eef2ff',color:'#1652f0',border:'none',fontWeight:700,padding:'8px 14px',borderRadius:10,cursor:'pointer'}}>Log out</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12,margin:'10px 0 18px'}}>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)} style={{padding:'8px 12px',border:'1px solid #ccd6ee',borderRadius:8}}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={load} disabled={loading} style={btn}>{loading?'Loading...':'Refresh'}</button>
      </div>
      <table style={{borderCollapse:'collapse',width:'100%',background:'#fff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,82,255,0.06)'}}>
        <thead><tr style={{background:'#f3f7ff'}}>
          <th style={{textAlign:'left',padding:10}}>Date</th>
          <th style={{textAlign:'left',padding:10}}>User</th>
          <th style={{textAlign:'left',padding:10}}>Type</th>
          <th style={{textAlign:'left',padding:10}}>Amount</th>
          <th style={{textAlign:'left',padding:10}}>Target</th>
          <th style={{textAlign:'left',padding:10}}>Status</th>
          <th style={{textAlign:'left',padding:10}}>Actions</th>
        </tr></thead>
        <tbody>
          {requests.length? requests.map((r,i)=> (
            <tr key={i}>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.date}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.user_email}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.type}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>${parseFloat(r.amount||'0').toFixed(2)}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.target_email||'-'}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.status}</td>
              <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>
                <button onClick={()=>approve(r)} disabled={r.status!=='pending'} style={{marginRight:8, ...btn}}>Approve</button>
                <button onClick={()=>reject(r)} disabled={r.status!=='pending'} style={{background:'#eef2ff',color:'#1652f0',border:'none',fontWeight:700,padding:'8px 14px',borderRadius:10,cursor:'pointer'}}>Reject</button>
              </td>
            </tr>
          )) : <tr><td colSpan="7" style={{padding:10,color:'#888'}}>No requests.</td></tr>}
        </tbody>
      </table>
      {toast && (
        <div style={{position:'fixed',right:16,bottom:16,background:'#ecfdf5',color:'#065f46',border:'1px solid #bbf7d0',padding:'10px 12px',borderRadius:10}}>{toast}</div>
      )}
    </div>
  )
}
