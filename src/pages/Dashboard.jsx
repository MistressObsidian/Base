import { useEffect, useMemo, useState } from 'react'

const SHEETDB_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u'
const NOTIF_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/notifications'
const TX_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/transactions'
const REQUESTS_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/requests'
const OWNER_EMAIL = 'support@basecrypto.help'

function SectionTitle({ children }) {
  return <div style={{fontSize:'1.17em',marginBottom:9,color:'#1a283f',fontWeight:700,letterSpacing:'.01em'}}>{children}</div>
}

function Modal({ id, title, onClose, children }) {
  return (
    <div id={id} style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:14,padding:'2.2rem 1.7rem',maxWidth:400,width:'95%',position:'relative',boxShadow:'0 8px 32px rgba(0,82,255,0.13)'}}>
        <button onClick={onClose} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
        <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [balance, setBalance] = useState(() => {
    const cached = parseFloat(localStorage.getItem('balance') || '0')
    return isNaN(cached) ? 0 : cached
  })
  const [recentTx, setRecentTx] = useState(() => {
    try {
      const raw = localStorage.getItem('recent_tx')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [tab, setTab] = useState(() => localStorage.getItem('dash_tab') || 'dashboard')
  const [notifs, setNotifs] = useState([])
  const [qaOpen, setQaOpen] = useState(() => localStorage.getItem('qa_open') === '1')
  const [qaIndex, setQaIndex] = useState(0)
  const actionItems = useMemo(() => ([
    {k:'dep',label:'Deposit'},
    {k:'wd',label:'Withdraw'},
    {k:'sd',label:'Send'},
    {k:'iv',label:'Invest'},
  ]), [])

  // Toast notifications
  const [toasts, setToasts] = useState([])
  const addToast = (message, tone='success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, tone }])
    setTimeout(() => { setToasts(t => t.filter(x => x.id !== id)) }, 3000)
  }

  // Transactions (full) state for the All Transactions tab
  const [allTx, setAllTx] = useState([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState('')
  const [txSearch, setTxSearch] = useState('')
  const [txType, setTxType] = useState('all') // all|Deposit|Withdraw|Send|Invest
  const [txFrom, setTxFrom] = useState('') // yyyy-mm-dd
  const [txTo, setTxTo] = useState('')
  const [txPage, setTxPage] = useState(1)
  const [txPerPage, setTxPerPage] = useState(10)
  // Owner-only Approvals
  const [approvalsOpen, setApprovalsOpen] = useState(false)
  const [approvals, setApprovals] = useState([])
  const [approvalsLoading, setApprovalsLoading] = useState(false)
  const [approvalsFilter, setApprovalsFilter] = useState('pending')

  const btnStyle = useMemo(()=>({
    background:'linear-gradient(90deg, #1652f0 60%, #0f3ac0 100%)',color:'#fff',border:'none',fontWeight:700,padding:'10px 23px',borderRadius:10,cursor:'pointer',boxShadow:'0 2px 10px rgba(22,82,240,0.18)'
  }),[])

  // Auth load
  useEffect(() => {
  // Restore theme preference on mount
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme)

    const email = localStorage.getItem('user_email')
    const name = localStorage.getItem('user_name') || ''
    if (!email) {
      window.location.href = '/'
      return
    }
    setUserEmail(email)
    setUserName(name)
  }, [])

  // Toggle approvals with Alt+Shift+A (owner only)
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        if (localStorage.getItem('user_email') === OWNER_EMAIL) {
          setApprovalsOpen(v => !v)
          setTimeout(loadApprovals, 0)
          addToast('Approvals toggled', 'info')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const loadApprovals = async () => {
    if (localStorage.getItem('user_email') !== OWNER_EMAIL) return
    setApprovalsLoading(true)
    try {
      const res = await fetch(`${REQUESTS_API}/search?status=${encodeURIComponent(approvalsFilter)}`)
      const data = await res.json()
      setApprovals(Array.isArray(data) ? data.sort((a,b)=> new Date(b.date)-new Date(a.date)) : [])
    } catch { setApprovals([]) }
    finally { setApprovalsLoading(false) }
  }

  const setRequestStatus = async (id, status) => {
    await fetch(`${REQUESTS_API}/id/${encodeURIComponent(id)}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { status } })
    })
  }

  const adjustBalance = async (email, delta) => {
    const found = await fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`).then(r=>r.json()).catch(()=>[])
    if (!found || !found.length) return
    const curr = parseFloat(found[0].balance||'0') || 0
    const next = curr + delta
    await fetch(`${SHEETDB_API}/email/${encodeURIComponent(email)}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { balance: String(next) } }) })
  }

  const logTx = async (tx) => {
    await fetch(TX_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [tx] }) })
  }

  const notify = async (email, title, message) => {
    try {
      await fetch(NOTIF_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [{ user_email: email, title, message, time: new Date().toLocaleString() }] }) })
    } catch {}
  }

  const approveRequest = async (r) => {
    if (localStorage.getItem('user_email') !== OWNER_EMAIL) return
    const amt = parseFloat(r.amount||'0'); if (isNaN(amt) || amt<=0) return
    try {
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
        if (r.target_email) {
          await logTx({ user_email: r.target_email, date: new Date().toLocaleString(), type: `Received from ${r.user_email}`, amount: `+$${amt.toFixed(2)}` })
          await notify(r.target_email, 'Funds received', `You received $${amt.toFixed(2)} from ${r.user_email}.`)
        }
      }
      await setRequestStatus(r.id, 'approved')
      addToast('Approved')
      await notify(r.user_email, 'Request approved', `Your ${r.type} request for $${amt.toFixed(2)} was approved.`)
      await loadApprovals()
      await loadTransactions()
    } catch { addToast('Failed to approve', 'error') }
  }

  const rejectRequest = async (r) => {
    if (localStorage.getItem('user_email') !== OWNER_EMAIL) return
    try {
      await setRequestStatus(r.id, 'rejected')
      const amt = parseFloat(r.amount||'0')
      const label = r.type === 'Send' && r.target_email ? `${r.type} to ${r.target_email}` : r.type
      await logTx({ user_email: r.user_email, date: new Date().toLocaleString(), type: `${label} (rejected)`, amount: '$0.00' })
      await notify(r.user_email, 'Request rejected', `Your ${r.type} request for $${amt.toFixed(2)} was rejected.`)
      addToast('Rejected')
      await loadApprovals()
      await loadTransactions()
    }
    catch { addToast('Failed to reject', 'error') }
  }

  // Load dashboard data
  useEffect(() => {
    if (!userEmail) return
    fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length) {
          setUserName(data[0].fullname || '')
          const bal = parseFloat(data[0].balance || '0')
          setBalance(isNaN(bal) ? 0 : bal)
        } else {
          // Seed a pleasant empty state for new profiles
          setRecentTx([
            { date: new Date().toLocaleString(), type: 'Welcome bonus', amount: '+$0.00' },
          ])
        }
      })
      .catch(() => {
        // Network failure: keep current cached values
      })
  }, [userEmail])

  // Persist balance cache
  useEffect(() => {
    try { localStorage.setItem('balance', String(balance)) } catch {}
  }, [balance])

  // Persist recent transactions
  useEffect(() => {
    try { localStorage.setItem('recent_tx', JSON.stringify(recentTx)) } catch {}
  }, [recentTx])

  // Persist selected tab
  useEffect(() => {
    try { localStorage.setItem('dash_tab', tab) } catch {}
  }, [tab])

  // Persist Quick Actions open state
  useEffect(() => {
    try { localStorage.setItem('qa_open', qaOpen ? '1' : '0') } catch {}
  }, [qaOpen])

  // Notifications
  useEffect(() => {
    if (!userEmail) return
    const load = () => {
      const url = `${NOTIF_API}?or=(user_email=${encodeURIComponent(userEmail)},user_email=all)`
      fetch(url).then(r=>r.json()).then(setNotifs).catch(()=>setNotifs([]))
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [userEmail])

  // Prices
  const [prices, setPrices] = useState(null)
  useEffect(() => {
    const load = () => {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd&include_24hr_change=true')
        .then(r=>r.json()).then(setPrices).catch(()=>{})
    }
    load()
    const id = setInterval(load, 35_000)
    return () => clearInterval(id)
  }, [])

  const pushTx = (t) => setRecentTx((prev) => [...prev, t].slice(-50))

  // Server-backed transactions: load user history
  const loadTransactions = async () => {
    if (!userEmail) return
    setTxLoading(true); setTxError('')
    try {
      const url = (userEmail === OWNER_EMAIL) ? `${TX_API}` : `${TX_API}/search?user_email=${encodeURIComponent(userEmail)}`
      const res = await fetch(url)
      const list = await res.json()
      if (Array.isArray(list)) {
        const norm = list.map(x => ({
          user_email: x.user_email || userEmail,
          date: x.date || '',
          type: x.type || 'Activity',
          amount: x.amount || '$0.00',
        }))
        norm.sort((a,b) => new Date(b.date) - new Date(a.date))
        setAllTx(norm)
        setRecentTx(norm.slice(0,50))
      }
    } catch (e) {
      setTxError('Failed to load transactions')
      addToast('Failed to load transactions', 'error')
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => { loadTransactions() }, [userEmail])

  // Derived filtered/paginated transactions
  const filteredTx = useMemo(() => {
    let list = allTx
    if (txType !== 'all') list = list.filter(t => (t.type||'').toLowerCase().startsWith(txType.toLowerCase()))
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase()
      list = list.filter(t => (t.type||'').toLowerCase().includes(q) || (t.amount||'').toLowerCase().includes(q) || (t.date||'').toLowerCase().includes(q) || (userEmail===OWNER_EMAIL && (t.user_email||'').toLowerCase().includes(q)))
    }
    if (txFrom) {
      const f = new Date(txFrom)
      list = list.filter(t => new Date(t.date) >= f)
    }
    if (txTo) {
      const t = new Date(txTo)
      // include entire day
      t.setHours(23,59,59,999)
      list = list.filter(x => new Date(x.date) <= t)
    }
    return list
  }, [allTx, txType, txSearch, txFrom, txTo])

  const totalPages = Math.max(1, Math.ceil(filteredTx.length / txPerPage))
  const pageTx = useMemo(() => {
    const start = (txPage - 1) * txPerPage
    return filteredTx.slice(start, start + txPerPage)
  }, [filteredTx, txPage, txPerPage])

  // CSV export of current filtered results
  const exportCsv = () => {
    try {
      const rows = filteredTx
      const headers = (userEmail===OWNER_EMAIL) ? ['user_email','date','type','amount'] : ['date','type','amount']
      const csv = [headers.join(',')].concat(
        rows.map(r => headers.map(h => {
          const val = (r[h] ?? '').toString().replaceAll('"','""')
          return `"${val}"`
        }).join(','))
      ).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      addToast('CSV exported')
    } catch { addToast('Export failed', 'error') }
  }

  // Copy receipt helper
  const copyReceipt = async (t) => {
    const text = `Base Transaction Receipt\nDate: ${t.date}\nType: ${t.type}\nAmount: ${t.amount}\nUser: ${t.user_email || userEmail}`
    try { await navigator.clipboard.writeText(text); addToast('Receipt copied') }
    catch { addToast('Copy failed', 'error') }
  }

  // Actions
  const patchBalance = (newBal) => fetch(`${SHEETDB_API}/email/${encodeURIComponent(userEmail)}`,{
    method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { balance: newBal.toString() } })
  }).then(r=>r.json())

  const onDeposit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(e.target.amount.value)
    if (isNaN(amt) || amt <= 0) return
    const rid = Math.random().toString(36).slice(2)
    const req = { id: rid, user_email: userEmail, type: 'Deposit', amount: amt.toFixed(2), status: 'pending', date: new Date().toLocaleString() }
    await fetch(REQUESTS_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [req] }) }).catch(()=>{})
    pushTx({ date: req.date, type: 'Deposit request (pending)', amount: `+$${amt.toFixed(2)}` })
    e.target.reset()
    const m = document.getElementById('dep'); if (m) m.style.display = 'none'
    addToast('Deposit submitted for approval')
  }

  const onWithdraw = async (e) => {
    e.preventDefault()
    const amt = parseFloat(e.target.amount.value)
    if (isNaN(amt) || amt <= 0 || amt > balance) return
    const rid = Math.random().toString(36).slice(2)
    const req = { id: rid, user_email: userEmail, type: 'Withdraw', amount: amt.toFixed(2), status: 'pending', date: new Date().toLocaleString() }
    await fetch(REQUESTS_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [req] }) }).catch(()=>{})
    pushTx({ date: req.date, type: 'Withdraw request (pending)', amount: `-$${amt.toFixed(2)}` })
    e.target.reset()
    const m = document.getElementById('wd'); if (m) m.style.display = 'none'
    addToast('Withdrawal submitted for approval')
  }

  const onSend = async (e) => {
    e.preventDefault()
    const recipient = e.target.recipient.value.trim()
    const amt = parseFloat(e.target.amount.value)
    if (!recipient || isNaN(amt) || amt <= 0 || amt > balance) return
    const rid = Math.random().toString(36).slice(2)
    const req = { id: rid, user_email: userEmail, type: 'Send', amount: amt.toFixed(2), target_email: recipient, status: 'pending', date: new Date().toLocaleString() }
    await fetch(REQUESTS_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [req] }) }).catch(()=>{})
    pushTx({ date: req.date, type: `Send request to ${recipient} (pending)`, amount: `-$${amt.toFixed(2)}` })
    e.target.reset()
    const m = document.getElementById('sd'); if (m) m.style.display = 'none'
    addToast('Send submitted for approval')
  }

  const onInvest = async (e) => {
    e.preventDefault()
    const asset = e.target.asset.value
    const amount = parseFloat(e.target.amount.value)
    const duration = e.target.duration.value
    const risk = e.target.risk.value
    if (!asset || !amount || amount < 10 || !duration || !risk || amount > balance) return
    const newBal = balance - amount
    const r = await patchBalance(newBal)
    if (r.updated === 1) {
      setBalance(newBal)
      const tx = { user_email: userEmail, date: new Date().toLocaleString(), type: `Invest ${asset} (${duration}d, ${risk})`, amount: `-$${amount.toFixed(2)}` }
      pushTx(tx)
      fetch(TX_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [tx] }) }).catch(()=>{})
      e.target.reset()
  const m = document.getElementById('iv'); if (m) m.style.display = 'none'
      addToast('Investment placed')
    }
  }

  return (
    <div>
      <header style={{background:'linear-gradient(135deg,#0f3ac0,#1652f0)',color:'#fff',padding:'1.1rem 2rem 0.9rem',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 4px 20px rgba(22,82,240,0.14)',borderBottomLeftRadius:18,borderBottomRightRadius:18}}>
        <a href="#" style={{fontSize:'1.85rem',fontWeight:800,letterSpacing:'-0.03em',textDecoration:'none',color:'#fff',display:'flex',alignItems:'center',gap:'.7rem'}}>Base</a>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:'1.1rem',background:'#fff',color:'#1652f0',padding:'.3em .9em',borderRadius:8,marginRight:'.7em',fontWeight:500,boxShadow:'0 2px 8px rgba(0,82,255,0.07)'}}>{userName}</span>
          (<span>{userEmail}</span>)
          <button onClick={()=>{const doc=document.documentElement;const next=doc.getAttribute('data-theme')==='dark'?'light':'dark';doc.setAttribute('data-theme',next);localStorage.setItem('theme',next)}} style={{marginLeft:8,background:'transparent',border:'1px solid rgba(255,255,255,.7)',color:'#fff',fontWeight:700,padding:'8px 14px',borderRadius:10,cursor:'pointer'}}>Theme</button>
          <button onClick={()=>{localStorage.removeItem('user_email');localStorage.removeItem('user_name');window.location.href='/'}} style={{marginLeft:8,...btnStyle,borderRadius:20}}>Log out</button>
        </div>
      </header>

      <div style={{maxWidth:1100,margin:'36px auto 0',padding:'0 1.2rem 2.5rem',background:'#fff',borderRadius:18,boxShadow:'0 6px 36px rgba(10,50,150,0.08)'}}>
        <div id="notifBar" style={{marginBottom:'1.3rem'}}>
          {notifs && notifs.length ? notifs.map((n,i)=> (
            <div key={i} style={{background:'#f3f7ff',color:'#1652f0',borderLeft:'5px solid #00d4ff',padding:'.9em 2em .9em 1em',marginBottom:'.6em',borderRadius:7,fontSize:'1.03em',display:'flex',alignItems:'center',gap:'.6em',position:'relative',boxShadow:'0 2px 12px rgba(0,82,255,0.06)'}}>
              <span style={{fontWeight:600,marginRight:'.6em'}}>{n.title || 'Notice'}:</span>
              <span>{n.message || ''}</span>
              <span style={{fontSize:'.95em',marginLeft:'.7em',color:'#00b3ff'}}>{n.time || ''}</span>
            </div>
          )) : null}
        </div>

        {/* Compact secondary nav with Quick Actions */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'8px 0 18px',position:'relative'}}>
          <nav aria-label="Secondary" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {['dashboard','transactions','notifications','settings','support'].map(key => (
              <button
                key={key}
                onClick={()=>setTab(key)}
                style={{
                  background: tab===key?'linear-gradient(90deg,#1652f0 60%,#0f3ac0 100%)':'#eef2ff',
                  color: tab===key?'#fff':'#1652f0',
                  border:'none',padding:'.55em 1.1em',borderRadius:999,
                  cursor:'pointer',fontWeight:700,fontSize:'.95em',letterSpacing:'.01em',
                  boxShadow:'0 2px 8px rgba(0,82,255,0.06)'
                }}
                aria-current={tab===key?'page':undefined}
              >{key[0].toUpperCase()+key.slice(1)}</button>
            ))}
            {userEmail === OWNER_EMAIL && (
              <button
                onClick={()=>{ setApprovalsOpen(true); loadApprovals() }}
                title="Review requests"
                style={{
                  background:'#eef2ff', color:'#1652f0', border:'none', padding:'.55em 1.1em', borderRadius:999,
                  cursor:'pointer', fontWeight:700, fontSize:'.95em', letterSpacing:'.01em', boxShadow:'0 2px 8px rgba(0,82,255,0.06)'
                }}
              >Approvals</button>
            )}
          </nav>
          <div style={{position:'relative'}} onKeyDown={(e)=>{
            if (!qaOpen) return
            if (e.key==='Escape'){ setQaOpen(false); return }
            if (e.key==='ArrowDown'){ e.preventDefault(); setQaIndex(i => (i+1)%actionItems.length) }
            if (e.key==='ArrowUp'){ e.preventDefault(); setQaIndex(i => (i-1+actionItems.length)%actionItems.length) }
            if (e.key==='Enter'){
              const a = actionItems[qaIndex]; if (a){ const el = document.getElementById(a.k); if (el) el.style.display='flex'; setQaOpen(false) }
            }
          }}>
            <button onClick={()=>{ setQaOpen(v=>!v); setQaIndex(0) }} aria-expanded={qaOpen} aria-haspopup="menu" style={{background:'#eef2ff',color:'#1652f0',border:'none',padding:'.55em 1.1em',borderRadius:10,cursor:'pointer',fontWeight:700}}>
              Quick Actions ▾
            </button>
            {qaOpen && (
              <div role="menu" style={{position:'absolute',right:0,marginTop:6,background:'#fff',border:'1px solid #e6eaf5',borderRadius:10,boxShadow:'0 8px 24px rgba(10,50,150,0.10)',minWidth:180,zIndex:5,overflow:'hidden'}}>
                {actionItems.map((a, idx)=> (
                  <button
                    key={a.k}
                    role="menuitem"
                    tabIndex={0}
                    onMouseEnter={()=>setQaIndex(idx)}
                    onClick={()=>{document.getElementById(a.k).style.display='flex'; setQaOpen(false)}}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'.7em 1em',background: qaIndex===idx?'#eef2ff':'#fff',color: qaIndex===idx?'#1652f0':'#1a283f',border:'none',cursor:'pointer',fontWeight:600}}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {tab==='dashboard' && (
          <div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'2em',marginBottom:'2em',justifyContent:'center'}}>
              <div style={{background:'#fafdff',borderRadius:16,boxShadow:'0 4px 24px rgba(0,82,255,0.07)',flex:'1 1 260px',padding:'2.2rem',minWidth:260,maxWidth:370,border:'1.5px solid #eaf1ff'}}>
                <div style={{color:'#666',fontSize:'1em',marginBottom:'.1em',fontWeight:500}}>Portfolio Value</div>
                <div style={{fontSize:'2.3em',fontWeight:800,background:'linear-gradient(90deg,#1652f0 10%,#00d4ff 90%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'.4em'}}>
                  ${balance.toLocaleString(undefined,{minimumFractionDigits:2})}
                </div>
                <div style={{marginTop:'1.5em',display:'flex',gap:'.7em',flexWrap:'wrap'}}>
                  <button onClick={()=>document.getElementById('dep').style.display='flex'} style={btnStyle}>＋ Deposit</button>
                  <button onClick={()=>document.getElementById('wd').style.display='flex'} style={btnStyle}>↓ Withdraw</button>
                  <button onClick={()=>document.getElementById('sd').style.display='flex'} style={btnStyle}>➡ Send</button>
                  <button onClick={()=>document.getElementById('iv').style.display='flex'} style={{...btnStyle,background:'linear-gradient(90deg,#00d4ff 60%,#1652f0 100%)'}}>📈 Invest</button>
                </div>
              </div>

              <div style={{background:'#fafdff',borderRadius:16,boxShadow:'0 4px 24px rgba(0,82,255,0.07)',flex:'1 1 260px',padding:'2.2rem',minWidth:260,maxWidth:440,border:'1.5px solid #eaf1ff'}}>
                <SectionTitle>Crypto Prices</SectionTitle>
                <div>
                  {prices ? (
                    <div>
                      {[
                        {k:'bitcoin', label:'BTC/USD'},
                        {k:'ethereum', label:'ETH/USD'},
                        {k:'solana', label:'SOL/USD'},
                        {k:'tether', label:'USDT/USD'},
                      ].map(({k,label}) => (
                        <div key={k} style={{background:'#f7faff',borderRadius:12,padding:'1em 1.5em 1em 1em',marginBottom:'.9em',boxShadow:'0 2px 8px rgba(10,100,255,.03)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <h4 style={{margin:0,fontWeight:700,color:'#1652f0',fontSize:'1.05em',letterSpacing:'.01em'}}>{label}</h4>
                          <div>
                            <span style={{fontSize:'1.2em',fontWeight:600,marginRight:'.7em'}}>${parseFloat(prices[k].usd).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
                            <span style={{color: prices[k].usd_24h_change<0?'#e11d48':'#18b200'}}>
                              ({prices[k].usd_24h_change>0?'+':''}{prices[k].usd_24h_change.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div>Loading...</div>}
                </div>
              </div>
            </div>

            <div className="dash-section">
              <SectionTitle>Recent Transactions</SectionTitle>
              <table style={{borderCollapse:'collapse',width:'100%',background:'#fafdff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,82,255,0.04)'}}>
                <thead><tr style={{background:'#f3f7ff'}}><th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .4em'}}>Date</th><th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .4em'}}>Description</th><th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .4em'}}>Amount</th></tr></thead>
                <tbody>
                  {recentTx.length ? recentTx.slice(-7).reverse().map((t,i)=> (
                    <tr key={i}><td style={{padding:'.7em .4em',borderBottom:'1px solid #f1f1f1'}}>{t.date}</td><td style={{padding:'.7em .4em',borderBottom:'1px solid #f1f1f1'}}>{t.type}</td><td style={{padding:'.7em .4em',borderBottom:'1px solid #f1f1f1'}}>{t.amount}</td></tr>
                  )) : <tr><td colSpan="3" style={{color:'#888',padding:'.7em .4em'}}>No recent transactions.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='transactions' && (
          <div>
            <SectionTitle>All Transactions</SectionTitle>
            <div style={{display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',marginBottom:12}}>
              <input value={txSearch} onChange={e=>{setTxSearch(e.target.value); setTxPage(1)}} placeholder="Search" style={{padding:'8px 10px',border:'1px solid #ccd6ee',borderRadius:8,minWidth:160}} />
              <select value={txType} onChange={e=>{setTxType(e.target.value); setTxPage(1)}} style={{padding:'8px 10px',border:'1px solid #ccd6ee',borderRadius:8}}>
                <option value="all">All types</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdraw">Withdraw</option>
                <option value="Send">Send</option>
                <option value="Invest">Invest</option>
              </select>
              <label style={{color:'#6b7280'}}>From</label>
              <input type="date" value={txFrom} onChange={e=>{setTxFrom(e.target.value); setTxPage(1)}} style={{padding:'8px 10px',border:'1px solid #ccd6ee',borderRadius:8}} />
              <label style={{color:'#6b7280'}}>To</label>
              <input type="date" value={txTo} onChange={e=>{setTxTo(e.target.value); setTxPage(1)}} style={{padding:'8px 10px',border:'1px solid #ccd6ee',borderRadius:8}} />
              <button onClick={()=>{ setTxSearch(''); setTxType('all'); setTxFrom(''); setTxTo(''); setTxPage(1) }} style={{background:'#eef2ff',color:'#1652f0',border:'none',padding:'8px 12px',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Reset</button>
              <button onClick={loadTransactions} disabled={txLoading} style={{...btnStyle, padding:'8px 14px'}}>{txLoading?'Refreshing...':'Refresh'}</button>
              <button onClick={exportCsv} style={{...btnStyle, padding:'8px 14px', background:'linear-gradient(90deg,#00d4ff 60%,#1652f0 100%)'}}>Export CSV</button>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{color:'#6b7280'}}>{filteredTx.length} result(s)</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <label style={{color:'#6b7280'}}>Per page</label>
                <select value={txPerPage} onChange={e=>{setTxPerPage(parseInt(e.target.value)||10); setTxPage(1)}} style={{padding:'6px 8px',border:'1px solid #ccd6ee',borderRadius:8}}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            {txError && <div style={{background:'#fef2f2',color:'#991b1b',border:'1px solid #fecaca',padding:'10px 12px',borderRadius:8,marginBottom:10}}>{txError}</div>}
            <table style={{borderCollapse:'collapse',width:'100%',background:'#fafdff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,82,255,0.04)'}}>
              <thead><tr style={{background:'#f3f7ff'}}>
                {userEmail===OWNER_EMAIL && <th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .6em'}}>User</th>}
                <th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .6em'}}>Date</th>
                <th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .6em'}}>Type</th>
                <th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .6em'}}>Amount</th>
                <th style={{textAlign:'left',color:'#1652f0',fontWeight:600,padding:'.7em .6em'}}>Actions</th>
              </tr></thead>
              <tbody>
                {pageTx.length ? pageTx.map((t,i)=> (
                  <tr key={i}>
                    {userEmail===OWNER_EMAIL && <td style={{padding:'.7em .6em',borderBottom:'1px solid #f1f1f1'}}>{t.user_email}</td>}
                    <td style={{padding:'.7em .6em',borderBottom:'1px solid #f1f1f1'}}>{t.date}</td>
                    <td style={{padding:'.7em .6em',borderBottom:'1px solid #f1f1f1'}}>{t.type}</td>
                    <td style={{padding:'.7em .6em',borderBottom:'1px solid #f1f1f1'}}>{t.amount}</td>
                    <td style={{padding:'.7em .6em',borderBottom:'1px solid #f1f1f1'}}>
                      <button onClick={()=>copyReceipt(t)} style={{background:'#eef2ff',color:'#1652f0',border:'none',padding:'6px 10px',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Copy receipt</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" style={{color:'#888',padding:'.7em .6em'}}>No transactions match your filters.</td></tr>}
              </tbody>
            </table>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
              <button onClick={()=>setTxPage(p=>Math.max(1,p-1))} disabled={txPage<=1} style={{background:'#eef2ff',color:'#1652f0',border:'none',padding:'8px 12px',borderRadius:8,fontWeight:700,cursor: txPage<=1?'not-allowed':'pointer'}}>Prev</button>
              <div style={{color:'#6b7280'}}>Page {txPage} / {totalPages}</div>
              <button onClick={()=>setTxPage(p=>Math.min(totalPages,p+1))} disabled={txPage>=totalPages} style={{background:'#eef2ff',color:'#1652f0',border:'none',padding:'8px 12px',borderRadius:8,fontWeight:700,cursor: txPage>=totalPages?'not-allowed':'pointer'}}>Next</button>
            </div>
          </div>
        )}

        {tab==='notifications' && (
          <div id="notificationsList">
            {(!notifs || !notifs.length) ? <div style={{color:'#888'}}>No notifications found.</div> : notifs.map((n,i)=> (
              <div key={i} style={{background:'#f3f7ff',color:'#1652f0',borderLeft:'4px solid #1652f0',padding:'.9em 2em .9em 1em',marginBottom:'.6em',borderRadius:7,fontSize:'1.03em',display:'flex',alignItems:'center',gap:'.6em',position:'relative',boxShadow:'0 2px 12px rgba(0,82,255,0.06)'}}>
                <span style={{fontWeight:600,marginRight:'.6em'}}>{n.title || 'Notice'}:</span>
                <span>{n.message || ''}</span>
                <span style={{fontSize:'.95em',marginLeft:'.7em',color:'#00b3ff'}}>{n.time || ''}</span>
              </div>
            ))}
          </div>
        )}

        {tab==='settings' && (
          <div>
            <SectionTitle>Update Account Settings</SectionTitle>
            <form onSubmit={async (e)=>{
              e.preventDefault()
              const name = e.target.name.value.trim()
              const email = e.target.email.value.trim()
              const r = await fetch(`${SHEETDB_API}/email/${encodeURIComponent(userEmail)}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { fullname:name, email } }) }).then(r=>r.json())
              if (r.updated===1) {
                localStorage.setItem('user_email', email)
                localStorage.setItem('user_name', name)
                setUserEmail(email); setUserName(name)
              }
            }} className="settings-form">
              <label>Full Name</label>
              <input name="name" type="text" defaultValue={userName} required />
              <label>Email</label>
              <input name="email" type="email" defaultValue={userEmail} required />
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Update</button>
            </form>
          </div>
        )}

        {tab==='support' && (
          <div>
            <SectionTitle>Contact Support</SectionTitle>
            <form onSubmit={async (e)=>{
              e.preventDefault()
              const mail = e.target.mail.value.trim()
              const subject = e.target.subject.value.trim()
              const message = e.target.message.value.trim()
              if (!mail || !subject || !message) return
              const res = await fetch(NOTIF_API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [{ user_email:'admin', title:`Support: ${subject}`, message:`From: ${mail}\n${message}`, time: new Date().toLocaleString() }] }) }).then(r=>r.json())
              if (res.created===1) {
                fetch('https://formspree.io/f/xwkgyyqv', { method:'POST', headers:{'Accept':'application/json','Content-Type':'application/json'}, body: JSON.stringify({ email: mail, subject, message, _replyto: mail, _cc: 'support@basecrypto.help' }) })
                e.target.reset()
              }
            }} id="supportForm">
              <label>Your Email</label>
              <input name="mail" type="email" required />
              <label>Subject</label>
              <input name="subject" type="text" required />
              <label>Message</label>
              <textarea name="message" required style={{width:'100%',height:90,borderRadius:7,padding:8,border:'1px solid #ccc',fontSize:'1em',marginBottom:'1em'}} />
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Send Ticket</button>
            </form>
          </div>
        )}

        {/* Modals */}
        <div id="dep" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'1.8rem 1.4rem',maxWidth:420,width:'94%',position:'relative',boxShadow:'0 12px 32px rgba(0,82,255,0.12)'}}>
            <button onClick={()=>document.getElementById('dep').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Deposit</h3>
            <form onSubmit={onDeposit}>
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required placeholder="$0.00" style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}} />
              <div style={{fontSize:'.9rem',color:'#6b7280',marginBottom:10}}>Funds are added to your USD balance.</div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('dep').style.display='none'} style={{flex:1,background:'#eef2ff',color:'#1652f0',border:'none',padding:'.7rem',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                <button type="submit" style={{flex:1,...btnStyle}}>Deposit</button>
              </div>
            </form>
          </div>
        </div>

        <div id="wd" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'1.8rem 1.4rem',maxWidth:420,width:'94%',position:'relative',boxShadow:'0 12px 32px rgba(0,82,255,0.12)'}}>
            <button onClick={()=>document.getElementById('wd').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Withdraw</h3>
            <form onSubmit={onWithdraw}>
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required placeholder="$0.00" style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}} />
              <div style={{fontSize:'.9rem',color:'#6b7280',marginBottom:10}}>Available: ${balance.toFixed(2)}</div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('wd').style.display='none'} style={{flex:1,background:'#eef2ff',color:'#1652f0',border:'none',padding:'.7rem',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                <button type="submit" style={{flex:1,...btnStyle}}>Withdraw</button>
              </div>
            </form>
          </div>
        </div>

        <div id="sd" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'1.8rem 1.4rem',maxWidth:420,width:'94%',position:'relative',boxShadow:'0 12px 32px rgba(0,82,255,0.12)'}}>
            <button onClick={()=>document.getElementById('sd').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Send Funds</h3>
            <form onSubmit={onSend}>
              <label>Recipient Email</label>
              <input name="recipient" type="email" required placeholder="user@example.com" style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}} />
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required placeholder="$0.00" style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}} />
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('sd').style.display='none'} style={{flex:1,background:'#eef2ff',color:'#1652f0',border:'none',padding:'.7rem',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                <button type="submit" style={{flex:1,...btnStyle}}>Send</button>
              </div>
            </form>
          </div>
        </div>

        <div id="iv" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'1.8rem 1.4rem',maxWidth:480,width:'94%',position:'relative',boxShadow:'0 12px 32px rgba(0,82,255,0.12)'}}>
            <button onClick={()=>document.getElementById('iv').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Invest in Crypto</h3>
            <form onSubmit={onInvest}>
              <label htmlFor="investAsset">Select Asset</label>
              <select name="asset" required style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}}>
                <option value="">Choose...</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
              <label htmlFor="investAmount">Amount (USD)</label>
              <input name="amount" type="number" min="10" step="0.01" required placeholder="Minimum $10" style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}} />
              <label htmlFor="investDuration">Investment Duration</label>
              <select name="duration" required style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}}>
                <option value="">Choose...</option>
                <option value="7">7 days (Short-term)</option>
                <option value="30">30 days (1 month)</option>
                <option value="90">90 days (3 months)</option>
              </select>
              <label htmlFor="investRisk">Risk Level</label>
              <select name="risk" required style={{width:'100%',padding:'0.8rem',border:'1px solid #ccd6ee',borderRadius:10,margin:'6px 0 10px',fontSize:'1rem'}}>
                <option value="">Choose...</option>
                <option value="low">Low (Stable)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Aggressive)</option>
              </select>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('iv').style.display='none'} style={{flex:1,background:'#eef2ff',color:'#1652f0',border:'none',padding:'.7rem',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Cancel</button>
                <button type="submit" style={{flex:1,...btnStyle}}>Invest</button>
              </div>
            </form>
          </div>
        </div>
        {/* Toasts */}
        {toasts.length>0 && (
          <div aria-live="polite" style={{position:'fixed',right:16,bottom:16,display:'flex',flexDirection:'column',gap:8,zIndex:1100}}>
            {toasts.map(t => (
              <div key={t.id} style={{
                background: t.tone==='success'?'#ecfdf5':(t.tone==='error'?'#fef2f2':(t.tone==='info'?'#eff6ff':'#fffbeb')),
                color: t.tone==='success'?'#065f46':(t.tone==='error'?'#991b1b':(t.tone==='info'?'#1e3a8a':'#92400e')),
                border: `1px solid ${t.tone==='success'?'#bbf7d0':(t.tone==='error'?'#fecaca':(t.tone==='info'?'#bfdbfe':'#fde68a'))}`,
                padding:'10px 12px',borderRadius:10,boxShadow:'0 6px 20px rgba(0,0,0,0.08)',minWidth:220,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12
              }}>
                <span style={{fontWeight:600}}>{t.message}</span>
                <button onClick={()=>setToasts(arr=>arr.filter(x=>x.id!==t.id))} style={{background:'transparent',border:'none',cursor:'pointer',color:'#065f46',fontWeight:700}}>×</button>
              </div>
            ))}
          </div>
        )}

        {approvalsOpen && userEmail === OWNER_EMAIL && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:14,padding:'1.4rem',maxWidth:980,width:'95%',position:'relative',boxShadow:'0 12px 32px rgba(0,82,255,0.12)'}}>
              <button onClick={()=>setApprovalsOpen(false)} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <h3 style={{margin:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700}}>Approvals</h3>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select value={approvalsFilter} onChange={(e)=>{setApprovalsFilter(e.target.value); setTimeout(loadApprovals,0)}} style={{padding:'8px 10px',border:'1px solid #ccd6ee',borderRadius:8}}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={loadApprovals} disabled={approvalsLoading} style={{background:'#1652f0',color:'#fff',border:'none',padding:'8px 12px',borderRadius:8,fontWeight:700,cursor:'pointer'}}>{approvalsLoading?'Loading...':'Refresh'}</button>
                </div>
              </div>
              <table style={{borderCollapse:'collapse',width:'100%',background:'#fafdff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,82,255,0.04)'}}>
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
                  {approvals && approvals.length ? approvals.map((r,i)=> (
                    <tr key={i}>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.date}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.user_email}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.type}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>${parseFloat(r.amount||'0').toFixed(2)}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.target_email||'-'}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>{r.status}</td>
                      <td style={{padding:10,borderBottom:'1px solid #f1f1f1'}}>
                        <button onClick={()=>approveRequest(r)} disabled={r.status!=='pending'} style={{marginRight:8,background:'linear-gradient(90deg,#1652f0 60%,#0f3ac0 100%)',color:'#fff',border:'none',fontWeight:700,padding:'8px 12px',borderRadius:10,cursor:'pointer'}}>Approve</button>
                        <button onClick={()=>rejectRequest(r)} disabled={r.status!=='pending'} style={{background:'#eef2ff',color:'#1652f0',border:'none',fontWeight:700,padding:'8px 12px',borderRadius:10,cursor:'pointer'}}>Reject</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" style={{padding:10,color:'#888'}}>No requests.</td></tr>}
                </tbody>
              </table>
              <div style={{marginTop:8,color:'#6b7280'}}>Hint: Press Alt+Shift+A to toggle this panel</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
