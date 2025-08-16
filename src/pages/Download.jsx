export default function Download() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:`'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div style={{background:'rgba(255,255,255,0.97)',padding:'2.5rem 2rem',borderRadius:24,boxShadow:'0 8px 32px rgba(0,0,0,0.14)',maxWidth:350,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'2rem',fontWeight:700,marginBottom:'1.1rem',color:'#1652f0'}}>Get the Base App</div>
        <div style={{color:'#555',fontSize:'1.15rem',marginBottom:'2rem'}}>
          Download the official Base (formerly Coinbase Wallet) app for your device:
        </div>
        <a href="https://play.google.com/store/apps/details?id=org.toshi" target="_blank" rel="noreferrer" style={{display:'block',width:'100%',marginBottom:'1.25rem',fontSize:'1.1rem',fontWeight:600,borderRadius:12,padding:'0.9rem 0',boxShadow:'0 4px 16px rgba(22,82,240,0.10)',background:'#34a853',color:'#fff',textDecoration:'none'}}>
          Get it on Google Play
        </a>
        <a href="https://apps.apple.com/us/app/base-formerly-coinbase-wallet/id1278383455" target="_blank" rel="noreferrer" style={{display:'block',width:'100%',marginBottom:'1.25rem',fontSize:'1.1rem',fontWeight:600,borderRadius:12,padding:'0.9rem 0',boxShadow:'0 4px 16px rgba(22,82,240,0.10)',background:'#1652f0',color:'#fff',textDecoration:'none'}}>
          Download on the App Store
        </a>
        <div style={{marginTop:'2rem',color:'#8a8a8a',fontSize:'.95rem'}}>
          Having trouble? <a href="mailto:support@basecrypto.help">Contact support</a>
        </div>
      </div>
    </div>
  )
}
