'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Email ou mot de passe incorrect'); setLoading(false); return }
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single()
    window.location.href = profile?.role === 'admin' ? '/dashboard' : '/client'
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1520', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '2.5px solid #c8f135', margin: '0 auto 20px', background: '#1a2540' }}>
          <img src="/ben.jpg" alt="BEN" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ color: '#c8f135', fontSize: '26px', fontWeight: '700', margin: '0 0 6px' }}>BEN</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 36px', lineHeight: 1.5 }}>
          Diagnostic expérience visiteur<br />Neuroplay Xpériences
        </p>
        <div style={{ background: '#1a2540', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '16px', padding: '28px' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' }} />
          {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#c8f135', color: '#0d1520', fontSize: '15px', fontWeight: '700', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', margin: '20px 0 0' }}>Neuroplay Xpériences · BEN™</p>
      </div>
    </main>
  )
}
