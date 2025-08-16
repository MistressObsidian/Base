import { useEffect, useMemo, useState } from 'react'

const SHEETDB_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u'
const NOTIF_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u/t/notifications'

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
  const [balance, setBalance] = useState(0)
  const [recentTx, setRecentTx] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [notifs, setNotifs] = useState([])

  const btnStyle = useMemo(()=>({
    background:'linear-gradient(90deg, #1652f0 60%, #0f3ac0 100%)',color:'#fff',border:'none',fontWeight:700,padding:'10px 23px',borderRadius:10,cursor:'pointer',boxShadow:'0 2px 10px rgba(22,82,240,0.18)'
  }),[])

  // Auth load
  useEffect(() => {
    const email = localStorage.getItem('user_email')
    const name = localStorage.getItem('user_name') || ''
    if (!email) {
      window.location.href = '/'
      return
    }
    setUserEmail(email)
    setUserName(name)
  }, [])

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
        }
      })
  }, [userEmail])

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

  // Actions
  const patchBalance = (newBal) => fetch(`${SHEETDB_API}/email/${encodeURIComponent(userEmail)}`,{
    method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { balance: newBal.toString() } })
  }).then(r=>r.json())

  const onDeposit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(e.target.amount.value)
    if (isNaN(amt) || amt <= 0) return
    const newBal = balance + amt
    const r = await patchBalance(newBal)
    if (r.updated === 1) {
      setBalance(newBal)
      pushTx({ date: new Date().toLocaleString(), type: 'Deposit', amount: `+$${amt.toFixed(2)}` })
      e.target.reset()
    }
  }

  const onWithdraw = async (e) => {
    e.preventDefault()
    const amt = parseFloat(e.target.amount.value)
    if (isNaN(amt) || amt <= 0 || amt > balance) return
    const newBal = balance - amt
    const r = await patchBalance(newBal)
    if (r.updated === 1) {
      setBalance(newBal)
      pushTx({ date: new Date().toLocaleString(), type: 'Withdraw', amount: `-$${amt.toFixed(2)}` })
      e.target.reset()
    }
  }

  const onSend = async (e) => {
    e.preventDefault()
    const recipient = e.target.recipient.value.trim()
    const amt = parseFloat(e.target.amount.value)
    if (!recipient || isNaN(amt) || amt <= 0 || amt > balance) return
    const newBal = balance - amt
    const r = await patchBalance(newBal)
    if (r.updated === 1) {
      // credit recipient if exists
      fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(recipient)}`)
        .then(res=>res.json()).then(data=>{
          if (data.length>0) {
            const rBal = parseFloat(data[0].balance||'0') + amt
            fetch(`${SHEETDB_API}/email/${encodeURIComponent(recipient)}`,{
              method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: { balance: rBal.toString() } })
            })
          }
        })
      setBalance(newBal)
      pushTx({ date: new Date().toLocaleString(), type: 'Send', amount: `-$${amt.toFixed(2)}` })
      e.target.reset()
    }
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
      pushTx({ date: new Date().toLocaleString(), type: `Invested in ${asset} (${duration}d, ${risk})`, amount: `-$${amount.toFixed(2)}` })
      e.target.reset()
    }
  }

  return (
    <div>
      <header style={{background:'linear-gradient(135deg,#0f3ac0,#1652f0)',color:'#fff',padding:'1.2rem 2rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 4px 20px rgba(22,82,240,0.14)',borderBottomLeftRadius:18,borderBottomRightRadius:18}}>
        <a href="#" style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',textDecoration:'none',color:'#fff',display:'flex',alignItems:'center',gap:'.7rem'}}>Base</a>
        <div>
          <span style={{fontSize:'1.1rem',background:'#fff',color:'#1652f0',padding:'.3em .9em',borderRadius:8,marginRight:'.7em',fontWeight:500,boxShadow:'0 2px 8px rgba(0,82,255,0.07)'}}>{userName}</span>
          (<span>{userEmail}</span>)
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

        <div style={{display:'flex',gap:'1em',marginBottom:'2em',justifyContent:'center'}}>
          {['dashboard','notifications','settings','support'].map(key => (
            <button key={key} onClick={()=>setTab(key)} className={tab===key?'active':''} style={{background: tab===key?'linear-gradient(90deg,#1652f0 60%,#00d4ff 100%)':'#eef2ff',color: tab===key?'#fff':'#1652f0',border:'none',padding:'.7em 2em',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:'1.07em',letterSpacing:'.01em',boxShadow:'0 2px 8px rgba(0,82,255,0.04)'}}>
              {key[0].toUpperCase()+key.slice(1)}
            </button>
          ))}
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
          <div style={{background:'#fff',borderRadius:14,padding:'2.2rem 1.7rem',maxWidth:400,width:'95%',position:'relative',boxShadow:'0 8px 32px rgba(0,82,255,0.13)'}}>
            <button onClick={()=>document.getElementById('dep').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Deposit</h3>
            <form onSubmit={onDeposit}>
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required />
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Deposit</button>
            </form>
          </div>
        </div>

        <div id="wd" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'2.2rem 1.7rem',maxWidth:400,width:'95%',position:'relative',boxShadow:'0 8px 32px rgba(0,82,255,0.13)'}}>
            <button onClick={()=>document.getElementById('wd').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Withdraw</h3>
            <form onSubmit={onWithdraw}>
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required />
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Withdraw</button>
            </form>
          </div>
        </div>

        <div id="sd" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'2.2rem 1.7rem',maxWidth:400,width:'95%',position:'relative',boxShadow:'0 8px 32px rgba(0,82,255,0.13)'}}>
            <button onClick={()=>document.getElementById('sd').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Send Funds</h3>
            <form onSubmit={onSend}>
              <label>Recipient Email</label>
              <input name="recipient" type="email" required />
              <label>Amount (USD)</label>
              <input name="amount" type="number" min="1" required />
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Send</button>
            </form>
          </div>
        </div>

        <div id="iv" style={{display:'none',position:'fixed',inset:0,background:'rgba(0,0,0,.18)',zIndex:1001,alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:'2.2rem 1.7rem',maxWidth:400,width:'95%',position:'relative',boxShadow:'0 8px 32px rgba(0,82,255,0.13)'}}>
            <button onClick={()=>document.getElementById('iv').style.display='none'} style={{position:'absolute',right:'1.1em',top:'.8em',background:'none',border:'none',fontSize:'1.3em',color:'#aaa',cursor:'pointer'}}>&times;</button>
            <h3 style={{marginTop:0,color:'#1652f0',fontSize:'1.3em',fontWeight:700,textAlign:'center'}}>Invest in Crypto</h3>
            <form onSubmit={onInvest}>
              <label htmlFor="investAsset">Select Asset</label>
              <select name="asset" required>
                <option value="">Choose...</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
              <label htmlFor="investAmount">Amount (USD)</label>
              <input name="amount" type="number" min="10" step="0.01" required placeholder="Minimum $10" />
              <label htmlFor="investDuration">Investment Duration</label>
              <select name="duration" required>
                <option value="">Choose...</option>
                <option value="7">7 days (Short-term)</option>
                <option value="30">30 days (1 month)</option>
                <option value="90">90 days (3 months)</option>
              </select>
              <label htmlFor="investRisk">Risk Level</label>
              <select name="risk" required>
                <option value="">Choose...</option>
                <option value="low">Low (Stable)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Aggressive)</option>
              </select>
              <button type="submit" style={{...btnStyle,width:'100%',marginTop:'.5em'}}>Invest</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
