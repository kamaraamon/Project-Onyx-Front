import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  // Theme states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      setIsDarkMode(true);
    } else {
      document.body.classList.remove('dark-theme');
      setIsDarkMode(false);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'inactivity') {
      setIsInactivityRedirect(true);
    }
  }, []);

  const handleToggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('onyx_theme', isDark ? 'dark' : 'light');
    setIsDarkMode(isDark);
  };

  // --- States ---
  const [isLogin, setIsLogin] = useState<boolean>(true); // Mode Connexion par défaut
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [planPayment, setPlanPayment] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isInactivityRedirect, setIsInactivityRedirect] = useState<boolean>(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<number>(1);
  const [forgotPhone, setForgotPhone] = useState<string>('');
  const [smsCode, setSmsCode] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState<string>('');
  const [smsSentMessage, setSmsSentMessage] = useState<string>('');

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotPhone) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSmsSentMessage(`Code envoyé par SMS au ${forgotPhone} (simulé: 1234).`);
      setForgotStep(2);
    }, 1000);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (smsCode !== '1234') {
      setErrorMsg('Le code SMS saisi est incorrect (entrez 1234).');
      return;
    }
    if (newPassInput.length < 6) {
      setErrorMsg('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassInput !== confirmNewPassInput) {
      setErrorMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    alert('Votre mot de passe a été réinitialisé avec succès ! Connectez-vous avec votre nouveau mot de passe.');
    setIsForgotPassword(false);
    setForgotStep(1);
    setForgotPhone('');
    setSmsCode('');
    setNewPassInput('');
    setConfirmNewPassInput('');
  };

  // --- Actions ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!phone) {
      setErrorMsg('Veuillez renseigner votre numéro Wave.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Veuillez renseigner un mot de passe d\'au moins 6 caractères.');
      return;
    }

    if (!isLogin) {
      // Validations d'inscription
      if (!fullName) {
        setErrorMsg('Veuillez renseigner votre nom complet.');
        return;
      }
      if (!email || !email.includes('@')) {
        setErrorMsg('Veuillez renseigner une adresse e-mail valide.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setLoading(true);
    
    try {
      if (!isLogin) {
        // Enregistrement de l'utilisateur en base de données
        const regRes = await fetch('http://localhost:5000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        if (!regRes.ok) {
          const errData = await regRes.json();
          throw new Error(errData.message || 'Erreur lors de la création du compte.');
        }
      }

      // Connexion de l'utilisateur
      const loginRes = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        throw new Error(errData.message || 'Identifiants incorrects ou serveur injoignable.');
      }

      const data = await loginRes.json();
      
      localStorage.setItem('onyx_token', data.accessToken);
      localStorage.setItem('onyx_user_id', data.user.id);
      localStorage.setItem('onyx_user_phone', data.user.phone);
      localStorage.setItem('onyx_user_name', isLogin ? 'Client Onyx' : fullName);
      localStorage.setItem('onyx_user_email', isLogin ? 'client@onyx.sn' : email);
      
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur d\'authentification. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOnboarding = () => {
    const formattedPhone = phone ? encodeURIComponent(phone) : '';
    const message = `Bonjour Onyx, je souhaite configurer mes accès abonnements avec un conseiller. Mon numéro Wave: ${formattedPhone}`;
    const waUrl = `https://wa.me/221770000000?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="onboarding-screen">
      {/* Theme Toggle Button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <button
          onClick={handleToggleTheme}
          style={{
            background: 'none',
            border: '1.5px solid var(--border-color)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            backgroundColor: 'var(--panel-bg)',
            color: 'var(--text-primary)',
            transition: 'var(--transition-smooth)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          title="Changer de thème (Clair / Sombre)"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <Head>
        <title>Onyx - Bienvenue</title>
        <meta name="description" content="Le socle de votre gestion d'abonnement." />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="onboarding-container">
        
        {/* Logo et Titre */}
        <div className="onboarding-logo-wrapper">
          <img 
            src={isDarkMode ? "/logo_dark.png" : "/logo_light.png"} 
            alt="Onyx Logo" 
            className="onboarding-logo-img" 
          />
          <img 
            src={isDarkMode ? "/name_dark.png" : "/name_light.png"} 
            alt="Onyx" 
            className="onboarding-name-img" 
          />
        </div>

        {isForgotPassword ? (
          <div className="onboarding-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>
                🔑 Réinitialiser mon accès
              </h2>
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setForgotStep(1); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {errorMsg && (
              <div style={{ color: '#ff1744', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #ff1744', padding: '12px', borderRadius: '8px', backgroundColor: '#fff5f5', marginBottom: '16px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: '#606468', lineHeight: '1.4', margin: 0 }}>
                  Entrez le numéro Wave relié à votre compte Onyx. Nous allons vous envoyer un code de validation temporaire.
                </p>
                <div className="onboarding-form-group">
                  <label className="onboarding-label">Numéro de téléphone Wave</label>
                  <input 
                    type="tel" 
                    placeholder="Ex: 77 123 45 67" 
                    className="onboarding-input"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary-dark" disabled={loading}>
                  {loading ? 'Envoi...' : 'Recevoir le code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold', lineHeight: '1.4', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '8px', margin: 0 }}>
                  {smsSentMessage}
                </p>
                <div className="onboarding-form-group">
                  <label className="onboarding-label">Code SMS reçu</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 1234" 
                    className="onboarding-input"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    required
                  />
                </div>
                <div className="onboarding-form-group">
                  <label className="onboarding-label">Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    placeholder="Minimum 6 caractères" 
                    className="onboarding-input"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    required
                  />
                </div>
                <div className="onboarding-form-group">
                  <label className="onboarding-label">Confirmer le nouveau mot de passe</label>
                  <input 
                    type="password" 
                    placeholder="Minimum 6 caractères" 
                    className="onboarding-input"
                    value={confirmNewPassInput}
                    onChange={(e) => setConfirmNewPassInput(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary-dark" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Valider mon nouveau mot de passe'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="onboarding-card">
          
          {/* Commutateur de Mode (Connexion / Inscription) */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #e5e5e0', paddingBottom: '16px', gap: '20px' }}>
            <button 
              type="button" 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: isLogin ? '800' : '500',
                color: isLogin ? '#000000' : '#8c8c88',
                cursor: 'pointer',
                borderBottom: isLogin ? '3px solid #000000' : 'none',
                paddingBottom: '8px'
              }}
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            >
              Se connecter
            </button>
            <button 
              type="button" 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: !isLogin ? '800' : '500',
                color: !isLogin ? '#000000' : '#8c8c88',
                cursor: 'pointer',
                borderBottom: !isLogin ? '3px solid #000000' : 'none',
                paddingBottom: '8px'
              }}
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            >
              S'inscrire
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {isInactivityRedirect && (
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                border: '1.5px solid #1976d2', 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                marginBottom: '4px' 
              }}>
                <div>⚠️ Session expirée pour inactivité.</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85, fontWeight: 500, marginTop: '4px' }}>
                  Vos données personnelles ont été sauvegardées localement en toute sécurité.
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ color: '#ff1744', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #ff1744', padding: '12px', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Inscription : Nom Complet */}
            {!isLogin && (
              <div className="onboarding-form-group">
                <label className="onboarding-label">Nom Complet</label>
                <input 
                  type="text" 
                  placeholder="Nom et Prénom" 
                  className="onboarding-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {/* Inscription : E-mail */}
            {!isLogin && (
              <div className="onboarding-form-group">
                <label className="onboarding-label">Adresse E-mail</label>
                <input 
                  type="email" 
                  placeholder="exemple@domaine.com" 
                  className="onboarding-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Numéro Wave */}
            <div className="onboarding-form-group">
              <label className="onboarding-label">Numéro de téléphone Wave</label>
              <input 
                type="tel" 
                placeholder="Ex: 77 123 45 67" 
                className="onboarding-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Mot de passe */}
            <div className="onboarding-form-group">
              <label className="onboarding-label">Mot de passe</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••" 
                className="onboarding-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606468" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606468" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>

            {/* Inscription : Confirmer le mot de passe */}
            {!isLogin && (
              <div className="onboarding-form-group">
                <label className="onboarding-label">Confirmer le mot de passe</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••" 
                  className="onboarding-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Option : Planifier un paiement */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="onboarding-checkbox-group">
                <input 
                  type="checkbox" 
                  checked={planPayment} 
                  onChange={(e) => setPlanPayment(e.target.checked)} 
                />
                <span>Planifier un paiement?</span>
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#000000',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>

            {/* Bouton de validation d'authentification */}
            <button 
              type="submit" 
              className="btn-primary-dark"
              disabled={loading}
            >
              {loading ? 'Traitement...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
            </button>

            {/* WhatsApp assistant redirection */}
            <button 
              type="button" 
              className="btn-secondary-outline"
              onClick={handleWhatsAppOnboarding}
            >
              Aide humaine via WhatsApp Business
            </button>

          </form>

        </div>
        )}

        {/* Footer */}
        <p className="onboarding-footer-text">
          LE SOCLE DE VOTRE GESTION D'ABONNEMENT
        </p>

      </div>
    </div>
  );
}
