import { StrictMode, useEffect } from 'react'

function Landing() {
  // Inject the landing markup from the current root index.html (without inline <script>)
  const html = `
  <div id="mainLanding">
    <header class="header" role="banner" aria-label="Main header">
        <nav class="nav" aria-label="Main navigation">
            <a href="#" class="logo" aria-label="Base homepage">Base</a>
            <ul class="nav-links" role="menubar">
                <li role="none"><a role="menuitem" href="#prices">Prices</a></li>
                <li role="none"><a role="menuitem" href="#learn">Learn</a></li>
                <li class="mobile-auth-buttons" role="none">
                    <a href="#" id="openSignInModalMobile" class="btn btn-secondary" aria-label="Sign in">Sign in</a>
                    <a href="#" id="openSignUpModalMobile" class="btn btn-primary" aria-label="Sign up">Sign up</a>
                </li>
            </ul>
            <div class="auth-buttons">
                <a href="#" id="openSignInModal" class="btn btn-secondary" aria-label="Sign in">Sign in</a>
                <a href="#" id="openSignUpModalDesktop" class="btn btn-primary" aria-label="Sign up">Sign up</a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Open mobile menu" aria-expanded="false" aria-controls="nav-links">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </header>
    <section class="hero">
        <div class="hero-content">
            <h1>Buy & sell crypto on the<br>world's leading platform</h1>
            <p>Join 100+ million people who trust Base to buy, sell, and manage all crypto securely.</p>
            <div class="hero-buttons">
                <a href="#" id="openSignUpModalHero" class="btn btn-white btn-large">Sign up</a>
                <a href="#learn" class="btn btn-primary btn-large">Learn more</a>
            </div>
        </div>
    </section>
    <section class="features" id="learn">
        <div class="features-container">
            <h2>Why choose Base?</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Most trusted</h3>
                    <p>Base is the world's most trusted way to join the crypto revolution. We make it safe and simple for you to buy, sell, and hold cryptocurrency.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Lowest fees</h3>
                    <p>Buy and sell popular digital currencies, keep track of them in one place, and earn rewards for using Base products.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>Best security</h3>
                    <p>We store the vast majority of the digital assets in secure offline storage, and cryptocurrency stored on Base is covered by our insurance policy.</p>
                </div>
            </div>
        </div>
    </section>
    <section class="stats" id="prices">
        <div class="stats-container">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">$335B+</div>
                    <div class="stat-label">Quarterly volume traded</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">100M+</div>
                    <div class="stat-label">Verified users</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Countries supported</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">200+</div>
                    <div class="stat-label">Supported cryptocurrencies</div>
                </div>
            </div>
        </div>
    </section>
    <section class="cta">
        <div class="cta-container">
            <h2>Start your crypto journey today</h2>
            <p>Create your account and get verified in minutes. You can buy crypto with a credit card or bank transfer.</p>
            <a href="#" id="openSignUpModalCta" class="btn btn-primary btn-large">Get started now</a>
        </div>
    </section>
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Products</h4>
                    <a href="#">Buy/Sell Cryptocurrency</a>
                    <a href="#">Base Pro</a>
                    <a href="#">Base Prime</a>
                    <a href="#">Developer Platform</a>
                    <a href="#">Base Commerce</a>
                </div>
                <div class="footer-section">
                    <h4>Learn</h4>
                    <a href="#">Crypto basics</a>
                    <a href="#">Tips & tutorials</a>
                    <a href="#">Market updates</a>
                    <a href="#">What is Bitcoin?</a>
                    <a href="#">What is Ethereum?</a>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <a href="#">About</a>
                    <a href="#">Careers</a>
                    <a href="#">Press</a>
                    <a href="#">Legal & privacy</a>
                    <a href="#">Cookie policy</a>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <a href="#">Help center</a>
                    <a href="#">Contact us</a>
                    <a href="#">Create account</a>
                    <a href="#">ID verification</a>
                    <a href="#">Account information</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Base, Inc. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- SIGN IN MODAL -->
    <div class="modal-overlay" id="signInModal" aria-modal="true" role="dialog" aria-labelledby="signInTitle">
      <div class="modal" style="padding:2.5rem 2rem; box-shadow:0 8px 32px rgba(0,82,255,0.10);">
        <button type="button" class="modal-close" id="closeSignInModal" aria-label="Close sign in modal">&times;</button>
        <h2 id="signInTitle" style="font-size:2rem; font-weight:700; color:#0052ff; margin-bottom:1.5rem; text-align:center;">Sign in to Base</h2>
        <form id="signInForm" autocomplete="off" style="display:flex; flex-direction:column; gap:1.2rem;">
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signin-email" style="font-weight:500; color:#333;">Email address</label>
            <input type="email" id="signin-email" name="email" required placeholder="your@email.com" aria-required="true"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="emailError" class="error-message" aria-live="polite"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signin-password" style="font-weight:500; color:#333;">Password</label>
            <input type="password" id="signin-password" name="password" required minlength="8" placeholder="Password" aria-required="true"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="passwordError" class="error-message" aria-live="polite"></div>
          </div>
          <button type="submit" class="btn btn-primary" id="signInBtn" style="margin-top:0.5rem; font-size:1.1rem; border-radius:10px;">Sign in</button>
          <div id="signInSuccess" style="color: #10b981; text-align:center; margin-top:10px; display:none;" aria-live="polite"></div>
          <div id="signInFail" style="color: #e11d48; text-align:center; margin-top:10px; display:none;" aria-live="polite"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
            <a href="#" class="forgot-link" id="openForgotPasswordModal" style="color:#0052ff; font-size:0.98rem; text-decoration:none;">Forgot password?</a>
            <a href="#" class="signup-link" id="openSignUpModalFromSignIn" style="color:#333; font-size:0.98rem; text-decoration:underline;">Sign up</a>
          </div>
        </form>
      </div>
    </div>

    <!-- SIGN UP MODAL -->
    <div class="modal-overlay" id="signUpModal">
      <div class="modal" style="padding:2.5rem 2rem; box-shadow:0 8px 32px rgba(0,82,255,0.10);">
        <button type="button" class="modal-close" id="closeSignUpModal" aria-label="Close sign up modal">&times;</button>
        <h2 style="font-size:2rem; font-weight:700; color:#0052ff; margin-bottom:1.5rem; text-align:center;">Create your account</h2>
        <form id="signUpForm" autocomplete="off" style="display:flex; flex-direction:column; gap:1.2rem;">
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signup-fullname" style="font-weight:500; color:#333;">Full name</label>
            <input type="text" id="signup-fullname" name="fullname" required placeholder="Enter your full name"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="fullnameError" class="error-message"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signup-email" style="font-weight:500; color:#333;">Email address</label>
            <input type="email" id="signup-email" name="email" required placeholder="your@email.com"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="signupEmailError" class="error-message"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signup-password" style="font-weight:500; color:#333;">Password</label>
            <input type="password" id="signup-password" name="password" required minlength="8" placeholder="Create a password (8+ characters)"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="signupPasswordError" class="error-message"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="signup-confirm-password" style="font-weight:500; color:#333;">Confirm password</label>
            <input type="password" id="signup-confirm-password" name="confirmPassword" required minlength="8" placeholder="Confirm your password"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="confirmPasswordError" class="error-message"></div>
          </div>
          <button type="submit" class="btn btn-primary" id="signUpBtn" style="margin-top:0.5rem; font-size:1.1rem; border-radius:10px;">Create account</button>
          <div id="signUpSuccess" style="color: #10b981; text-align:center; margin-top:10px; display:none;"></div>
          <div id="signUpFail" style="color: #e11d48; text-align:center; margin-top:10px; display:none;"></div>
          <div style="text-align:center; margin-top:0.5rem;">
            <a href="#" class="signup-link" id="openSignInModalFromSignUp" style="color:#333; font-size:0.98rem; text-decoration:underline;">Already have an account? Sign in</a>
          </div>
        </form>
      </div>
    </div>

    <!-- FORGOT PASSWORD MODAL -->
    <div class="modal-overlay" id="forgotPasswordModal">
      <div class="modal" style="padding:2.5rem 2rem; box-shadow:0 8px 32px rgba(0,82,255,0.10);">
        <button type="button" class="modal-close" id="closeForgotPasswordModal" aria-label="Close reset password modal">&times;</button>
        <h2 style="font-size:2rem; font-weight:700; color:#0052ff; margin-bottom:1.5rem; text-align:center;">Reset Password</h2>
        <form id="forgotPasswordForm" autocomplete="off" style="display:flex; flex-direction:column; gap:1.2rem;">
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="forgot-email" style="font-weight:500; color:#333;">Email address</label>
            <input type="email" id="forgot-email" required placeholder="Your email"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="forgotEmailError" class="error-message"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="forgot-password" style="font-weight:500; color:#333;">New password</label>
            <input type="password" id="forgot-password" required minlength="8" placeholder="New password"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="forgotPasswordError" class="error-message"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label for="forgot-confirm-password" style="font-weight:500; color:#333;">Confirm new password</label>
            <input type="password" id="forgot-confirm-password" required minlength="8" placeholder="Confirm password"
              style="padding:0.8rem 1rem; border:1.5px solid #e5e7eb; border-radius:8px; font-size:1rem; transition:border 0.2s; outline:none;" 
              onfocus="this.style.borderColor='#0052ff'" onblur="this.style.borderColor='#e5e7eb'" />
            <div id="forgotConfirmPasswordError" class="error-message"></div>
          </div>
          <button type="submit" class="btn btn-primary" id="forgotPasswordBtn" style="margin-top:0.5rem; font-size:1.1rem; border-radius:10px;">Reset password</button>
          <div id="forgotPasswordSuccess" style="color: #10b981; text-align:center; margin-top:10px; display:none;"></div>
          <div id="forgotPasswordFail" style="color: #e11d48; text-align:center; margin-top:10px; display:none;"></div>
        </form>
      </div>
    </div>
  </div>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; overflow-x: hidden; background: #f8f9fa; }
    .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 1rem 2rem; position: fixed; top: 0; width: 100%; z-index: 1000; border-bottom: 1px solid rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
    .nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; position: relative; }
    .logo { font-size: 2rem; font-weight: bold; color: #0052ff; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .logo::before { content: ''; display: inline-block; width: 1.5rem; height: 1.5rem; background: linear-gradient(135deg, #0052ff, #1652f0); border-radius: 6px; margin-right: 0.3rem; vertical-align: middle; }
    .nav-links { display: flex; list-style: none; gap: 2rem; align-items: center; }
    .nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s ease; position: relative; }
    .nav-links a:hover { color: #0052ff; }
    .nav-links a::after { content: ''; position: absolute; width: 0; height: 2px; bottom: -5px; left: 0; background: linear-gradient(135deg, #0052ff, #1652f0); transition: width 0.3s ease; }
    .nav-links a:hover::after { width: 100%; }
    .auth-buttons { display: flex; gap: 1rem; }
    .btn { padding: 0.7rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: linear-gradient(135deg, #0052ff, #1652f0); color: white; box-shadow: 0 4px 15px rgba(0, 82, 255, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 82, 255, 0.4); }
    .btn-secondary { background: transparent; color: #333; border: 2px solid #e5e5e5; }
    .btn-secondary:hover { border-color: #0052ff; color: #0052ff; }
    .hero { background: linear-gradient(135deg, #0052ff 0%, #1652f0 50%, #00d4ff 100%); padding: 8rem 2rem 6rem; text-align: center; position: relative; overflow: hidden; }
    .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); animation: gridMove 20s linear infinite; }
    @keyframes gridMove { 0% { transform: translateX(0) translateY(0); } 100% { transform: translateX(10px) translateY(10px); } }
    .hero-content { max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }
    .hero h1 { font-size: 3.5rem; font-weight: 800; color: white; margin-bottom: 1.5rem; line-height: 1.1; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
    .hero p { font-size: 1.3rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto; }
    .hero-buttons { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
    .btn-large { padding: 1rem 2rem; font-size: 1.1rem; border-radius: 12px; }
    .btn-white { background: white; color: #0052ff; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
    .btn-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
    .features { padding: 6rem 2rem; background: #f8f9fa; }
    .features-container { max-width: 1200px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #333; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .feature-card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; border: 1px solid rgba(0, 0, 0, 0.05); animation: fadeInUp 0.6s ease forwards; }
    .feature-card:hover { transform: translateY(-5px); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
    .feature-card:nth-child(2) { animation-delay: 0.1s; }
    .feature-card:nth-child(3) { animation-delay: 0.2s; }
    .feature-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #0052ff, #1652f0); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 1.5rem; }
    .feature-card h3 { font-size: 1.4rem; margin-bottom: 1rem; color: #333; }
    .feature-card p { color: #666; line-height: 1.6; }
    .stats { background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 4rem 2rem; text-align: center; }
    .stats-container { max-width: 1200px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
    .stat-item { color: white; }
    .stat-number { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #0052ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; }
    .stat-label { font-size: 1rem; color: rgba(255, 255, 255, 0.8); }
    .cta { background: white; padding: 6rem 2rem; text-align: center; }
    .cta-container { max-width: 800px; margin: 0 auto; }
    .cta h2 { font-size: 2.5rem; margin-bottom: 1.5rem; color: #333; }
    .cta p { font-size: 1.2rem; color: #666; margin-bottom: 3rem; }
    .footer { background: #1a1a1a; color: white; padding: 3rem 2rem 1rem; }
    .footer-container { max-width: 1200px; margin: 0 auto; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    .footer-section h4 { margin-bottom: 1rem; color: #0052ff; }
    .footer-section a { color: #ccc; text-decoration: none; display: block; margin-bottom: 0.5rem; transition: color 0.3s ease; }
    .footer-section a:hover { color: #0052ff; }
    .footer-bottom { border-top: 1px solid #333; padding-top: 2rem; text-align: center; color: #666; }
    .mobile-menu-toggle { display: none; flex-direction: column; cursor: pointer; padding: 0.5rem; }
    .mobile-menu-toggle span { width: 25px; height: 3px; background: #333; margin: 2px 0; transition: 0.3s; }
    @media (max-width: 768px) {
        .nav-links { display: none; position: absolute; top: 100%; left: 0; right: 0; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); flex-direction: column; padding: 1rem 2rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border-top: 1px solid rgba(0, 0, 0, 0.1); gap: 1rem; z-index: 999; }
        .nav-links.active { display: flex; }
        .mobile-menu-toggle { display: flex; }
        .hero h1 { font-size: 2.5rem; }
        .hero p { font-size: 1.1rem; }
        .hero-buttons { flex-direction: column; align-items: center; }
        .features h2 { font-size: 2rem; }
        .auth-buttons { display: none; }
        .nav { position: relative; }
        .mobile-auth-buttons { display: flex; gap: 1rem; padding-top: 1rem; margin-top: 1rem; border-top: 1px solid rgba(0, 0, 0, 0.1); justify-content: center; }
        .mobile-auth-buttons .btn { flex: 1; text-align: center; justify-content: center; }
    }
    @media (min-width: 769px) { .mobile-auth-buttons { display: none; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .modal-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);display:none;align-items:center;justify-content:center;z-index:3000;}
    .modal-overlay.active { display:flex; }
    .modal { background: #fff; border-radius: 14px; max-width: 400px; width:95%; padding: 2rem 1.5rem; position:relative; }
    .modal-close { position:absolute;right:1rem;top:1rem;font-size:1.3rem;background:none;border:none;color:#aaa;cursor:pointer;}
    .error-message {color:#e11d48; font-size:.96rem;}
    .btn { padding:.6rem 1.2rem; border-radius:6px; border:none; cursor:pointer; font-weight:600;}
    .btn-primary {background:linear-gradient(135deg,#0052ff,#1652f0);color:#fff;}
    .btn-secondary {background:#fff; border:2px solid #0052ff; color:#0052ff;}
    .btn-primary:disabled { opacity:.65; }
  </style>
  `

  useEffect(() => {
    const SHEETDB_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u'
    const signInForm = document.getElementById('signInForm')
    const signUpForm = document.getElementById('signUpForm')
    const forgotPasswordForm = document.getElementById('forgotPasswordForm')

    // NAVIGATION
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    const navLinks = document.querySelector('.nav-links')
    if (mobileToggle && navLinks) {
      const toggleHandler = (e) => { e.stopPropagation(); navLinks.classList.toggle('active') }
      mobileToggle.addEventListener('click', toggleHandler)

      const docClick = (e) => {
        if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) navLinks.classList.remove('active')
      }
      document.addEventListener('click', docClick)
      const linkClicks = Array.from(navLinks.querySelectorAll('a')).map((link) => {
        const handler = () => navLinks.classList.remove('active')
        link.addEventListener('click', handler)
        return () => link.removeEventListener('click', handler)
      })
      const anchors = Array.from(document.querySelectorAll('a[href^="#"]')).map((anchor) => {
        const handler = (e) => {
          const target = document.querySelector(anchor.getAttribute('href'))
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
        }
        anchor.addEventListener('click', handler)
        return () => anchor.removeEventListener('click', handler)
      })
      const onScroll = () => {
        const header = document.querySelector('.header')
        if (!header) return
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.98)'
          header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)'
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)'
          header.style.boxShadow = 'none'
        }
      }
      window.addEventListener('scroll', onScroll)

      // Cleanup
      return () => {
        mobileToggle.removeEventListener('click', toggleHandler)
        document.removeEventListener('click', docClick)
        anchors.forEach((off) => off())
        linkClicks.forEach((off) => off())
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [])

  useEffect(() => {
    const SHEETDB_API = 'https://sheetdb.io/api/v1/sbath1xpp3h1u'
    const signInForm = document.getElementById('signInForm')
    const signUpForm = document.getElementById('signUpForm')
    const forgotPasswordForm = document.getElementById('forgotPasswordForm')

    function openModal(modal) { modal && modal.classList.add('active') }
    function closeModal(modal) { modal && modal.classList.remove('active') }
    const navLinks = document.querySelector('.nav-links')
    const addClick = (id, handler) => {
      const el = document.getElementById(id)
      if (el) el.onclick = handler
      return () => { if (el) el.onclick = null }
    }
    const cleanups = []
    cleanups.push(addClick('openSignInModal', e => { e.preventDefault(); openModal(document.getElementById('signInModal')) }))
    cleanups.push(addClick('openSignInModalMobile', e => { e.preventDefault(); navLinks && navLinks.classList.remove('active'); openModal(document.getElementById('signInModal')) }))
    cleanups.push(addClick('closeSignInModal', () => { closeModal(document.getElementById('signInModal')); signInForm && signInForm.reset() }))
    cleanups.push(addClick('openSignUpModalDesktop', e => { e.preventDefault(); openModal(document.getElementById('signUpModal')) }))
    cleanups.push(addClick('openSignUpModalMobile', e => { e.preventDefault(); navLinks && navLinks.classList.remove('active'); openModal(document.getElementById('signUpModal')) }))
    cleanups.push(addClick('openSignUpModalHero', e => { e.preventDefault(); openModal(document.getElementById('signUpModal')) }))
    cleanups.push(addClick('openSignUpModalCta', e => { e.preventDefault(); openModal(document.getElementById('signUpModal')) }))
    cleanups.push(addClick('openSignUpModalFromSignIn', e => { e.preventDefault(); closeModal(document.getElementById('signInModal')); openModal(document.getElementById('signUpModal')) }))
    cleanups.push(addClick('closeSignUpModal', () => { closeModal(document.getElementById('signUpModal')); signUpForm && signUpForm.reset() }))
    cleanups.push(addClick('openSignInModalFromSignUp', e => { e.preventDefault(); closeModal(document.getElementById('signUpModal')); openModal(document.getElementById('signInModal')) }))
    cleanups.push(addClick('openForgotPasswordModal', e => { e.preventDefault(); closeModal(document.getElementById('signInModal')); openModal(document.getElementById('forgotPasswordModal')) }))
    cleanups.push(addClick('closeForgotPasswordModal', () => { closeModal(document.getElementById('forgotPasswordModal')); forgotPasswordForm && forgotPasswordForm.reset() }))

    const forgotOverlay = document.getElementById('forgotPasswordModal')
    const signInOverlay = document.getElementById('signInModal')
    const signUpOverlay = document.getElementById('signUpModal')
    const overlayClick = (el, form) => (e) => { if (e.target === el) { closeModal(el); form && form.reset() } }
    if (forgotOverlay) forgotOverlay.onclick = overlayClick(forgotOverlay, forgotPasswordForm)
    if (signInOverlay) signInOverlay.onclick = overlayClick(signInOverlay, signInForm)
    if (signUpOverlay) signUpOverlay.onclick = overlayClick(signUpOverlay, signUpForm)

    const onEsc = (e) => {
      if (e.key === 'Escape') {
        ;['signInModal','signUpModal','forgotPasswordModal'].forEach(id => {
          const modal = document.getElementById(id)
          if (modal && modal.classList.contains('active')) closeModal(modal)
        })
      }
    }
    window.addEventListener('keydown', onEsc)

    // SIGN UP
    const onSignUp = (e) => {
      e.preventDefault()
      const fullname = document.getElementById('signup-fullname').value.trim()
      const email = document.getElementById('signup-email').value.trim()
      const password = document.getElementById('signup-password').value
      const confirmPassword = document.getElementById('signup-confirm-password').value
      const failMsg = document.getElementById('signUpFail')
      const successMsg = document.getElementById('signUpSuccess')
      if (failMsg) failMsg.style.display = 'none'
      if (successMsg) successMsg.style.display = 'none'
      if (password !== confirmPassword) {
        const el = document.getElementById('confirmPasswordError')
        if (el) el.textContent = 'Passwords do not match'
        return
      }
      const btn = document.getElementById('signUpBtn')
      if (btn) { btn.textContent = 'Creating...'; btn.disabled = true }
      fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            if (failMsg) { failMsg.textContent = 'Account already exists.'; failMsg.style.display = 'block' }
            if (btn) { btn.disabled = false; btn.textContent = 'Create account' }
            return
          }
          return fetch(SHEETDB_API, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [{ fullname, email, password, balance: '0' }] })
          }).then(res => res.json()).then(result => {
            if (result.created === 1) {
              if (successMsg) { successMsg.textContent = 'Account created!'; successMsg.style.display = 'block' }
              localStorage.setItem('user_email', email)
              localStorage.setItem('user_name', fullname)
              setTimeout(() => { window.location.href = 'download.html' }, 2000)
            } else { throw new Error('Signup failed') }
            if (btn) { btn.disabled = false; btn.textContent = 'Create account' }
          })
        })
        .catch(() => {
          if (failMsg) { failMsg.textContent = 'Sign up failed. Try again.'; failMsg.style.display = 'block' }
          if (btn) { btn.disabled = false; btn.textContent = 'Create account' }
        })
    }
    if (signUpForm) signUpForm.addEventListener('submit', onSignUp)

    // SIGN IN
    const onSignIn = (e) => {
      e.preventDefault()
      const email = document.getElementById('signin-email').value.trim()
      const password = document.getElementById('signin-password').value
      const failMsg = document.getElementById('signInFail')
      const successMsg = document.getElementById('signInSuccess')
      if (failMsg) failMsg.style.display = 'none'
      if (successMsg) successMsg.style.display = 'none'
      const btn = document.getElementById('signInBtn')
      if (btn) { btn.textContent = 'Signing in...'; btn.disabled = true }

      fetch(`${SHEETDB_API}/search?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            if (failMsg) { failMsg.textContent = 'Account not found.'; failMsg.style.display = 'block' }
            if (btn) { btn.disabled = false; btn.textContent = 'Sign in' }
            return
          }
          const user = data.find(u => u.email === email && u.password === password)
          if (!user) {
            if (failMsg) { failMsg.textContent = 'Incorrect password.'; failMsg.style.display = 'block' }
            if (btn) { btn.disabled = false; btn.textContent = 'Sign in' }
            return
          }
          if (successMsg) { successMsg.textContent = 'Login successful! Redirecting...'; successMsg.style.display = 'block' }
          localStorage.setItem('user_email', email)
          localStorage.setItem('user_name', user.fullname || '')
          setTimeout(() => { window.location.href = 'dashboard.html' }, 1500)
        })
        .catch(() => {
          if (failMsg) { failMsg.textContent = 'Sign in failed. Try again.'; failMsg.style.display = 'block' }
          if (btn) { btn.disabled = false; btn.textContent = 'Sign in' }
        })
    }
    if (signInForm) signInForm.addEventListener('submit', onSignIn)

    return () => {
      if (signUpForm) signUpForm.removeEventListener('submit', onSignUp)
      if (signInForm) signInForm.removeEventListener('submit', onSignIn)
      window.removeEventListener('keydown', () => {})
    }
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default function App() {
  return (
    <StrictMode>
      <Landing />
    </StrictMode>
  )
}
