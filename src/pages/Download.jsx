export default function Download() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:`Inter, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,background:'linear-gradient(135deg, #0f3ac0 0%, #1652f0 50%, #00c6ff 100%)'}}>
      <div style={{background:'rgba(255,255,255,0.98)',padding:'2.8rem 2.2rem',borderRadius:24,boxShadow:'0 16px 48px rgba(0,0,0,0.16)',maxWidth:420,width:'92%',textAlign:'center'}}>
        <div style={{fontSize:'2.1rem',fontWeight:800,marginBottom:'1rem',color:'#1652f0',letterSpacing:'-0.02em'}}>Get the Base App</div>
        <div style={{color:'#4a5568',fontSize:'1.05rem',marginBottom:'1.6rem'}}>
          Download the official Base (formerly Coinbase Wallet) app:
        </div>
        <a href="https://play.google.com/store/apps/details?id=org.toshi" target="_blank" rel="noreferrer" style={{display:'block',width:'100%',marginBottom:'1rem',fontSize:'1.05rem',fontWeight:700,borderRadius:12,padding:'0.95rem 0',boxShadow:'0 6px 18px rgba(52,168,83,0.22)',background:'#34a853',color:'#fff',textDecoration:'none'}}>
          Get it on Google Play
        </a>
        <a href="https://apps.apple.com/us/app/base-formerly-coinbase-wallet/id1278383455" target="_blank" rel="noreferrer" style={{display:'block',width:'100%',marginBottom:'1rem',fontSize:'1.05rem',fontWeight:700,borderRadius:12,padding:'0.95rem 0',boxShadow:'0 6px 18px rgba(22,82,240,0.22)',background:'#1652f0',color:'#fff',textDecoration:'none'}}>
          Download on the App Store
        </a>
        <div style={{marginTop:'1.6rem',color:'#8a8a8a',fontSize:'.95rem'}}>
          Need help? <a href="mailto:support@basecrypto.help">Contact support</a>
        </div>
      </div>
    </div>
  )
}
