'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
      else setUser(data.user)
    })
    loadMissions()
    loadClients()
  }, [])

  async function loadMissions() {
    const { data } = await supabase.from('missions').select('*, clients(nom, secteur)').order('created_at', { ascending: false })
    if (data) setMissions(data)
  }

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id, nom, secteur_cible, plan, offres_actives, statut').order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const statusColor: any = { publie: '#c8f135', brouillon: 'rgba(255,255,255,0.3)', 'en cours': '#EF9F27' }

  // Label lisible pour le type de mission
  function missionLabel(type: string): string {
    if (!type) return '—'
    if (type.includes('neuroaccess')) return 'Neuroaccess'
    if (type.includes('neurotaste')) return 'Neurotaste'
    if (type.includes('neuromedia')) return 'Neuromedia'
    return type
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif', padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: '#c8f135', fontSize: '22px', margin: '0 0 4px' }}>BEN · Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Neuroplay Xpériences — Diagnostic expérience visiteur</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          ['Clients actifs', clients.filter(c => c.statut === 'actif').length.toString()],
          ['Rapports publiés', missions.filter(m => m.statut === 'publie').length.toString()],
          ['En cours', missions.filter(m => m.statut === 'en cours').length.toString()]
        ].map(([label, val]) => (
          <div key={label} style={{ background: '#1a2540', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 8px' }}>{label}</p>
            <p style={{ color: '#fff', fontSize: '28px', fontWeight: '500', margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Bouton démarrer diagnostic */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => window.location.href = '/terrain'} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '14px', padding: '18px 24px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="10" r="3" stroke="#c8f135" strokeWidth="1.5"/>
              <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="#c8f135" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#c8f135', fontSize: '15px', fontWeight: '700', margin: '0 0 3px' }}>Démarrer un diagnostic</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>BEN te guide poste par poste — Cognitif ou Connecté →</p>
          </div>
          <div style={{ marginLeft: 'auto', color: '#c8f135', fontSize: '20px' }}>→</div>
        </button>
      </div>

      {/* Clients */}
      <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', marginBottom: '24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>Clients</p>
        {clients.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>Aucun client pour l'instant.</p>
        ) : clients.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8f135', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{c.nom?.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>{c.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>{c.secteur_cible || '—'}</p>
            </div>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>{c.plan || 'Neuroplay'}</span>
          </div>
        ))}
      </div>

      {/* Missions */}
      <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>Missions récentes</p>
        {missions.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>Aucune mission pour l'instant.</p>
        ) : missions.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
            onClick={() => window.location.href = `/rapport/${m.id}`}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8f135', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{m.clients?.nom?.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: '0 0 2px' }}>{m.clients?.nom}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{missionLabel(m.type)} · {m.date_mission}</p>
            </div>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${statusColor[m.statut]}`, color: statusColor[m.statut] }}>{m.statut}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
