'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ClientPage() {
  const [client, setClient] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: profile } = await supabase.from('user_profiles').select('role, client_id').eq('id', user.id).single()
      if (profile?.role === 'admin') { window.location.href = '/dashboard'; return }
      if (profile?.client_id) {
        const { data: clientData } = await supabase.from('clients').select('nom, plan').eq('id', profile.client_id).single()
        if (clientData) setClient(clientData)
        const { data: missionsData } = await supabase.from('missions').select('id, type, date_mission, statut').eq('client_id', profile.client_id).order('created_at', { ascending: false })
        if (missionsData) setMissions(missionsData)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Arial' }}>Chargement...</p></main>

  const statusColor: any = { publie: '#c8f135', brouillon: 'rgba(255,255,255,0.3)', 'en cours': '#EF9F27' }

  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif', padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 4px' }}>Ben Indoor</p>
          <h1 style={{ color: '#c8f135', fontSize: '22px', margin: '0 0 2px', fontWeight: '700' }}>Mes rapports</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>{client?.nom}</p>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>Déconnexion</button>
      </div>
      <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 0' }}>
        {missions.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>Aucun rapport disponible pour l'instant.</p>
        ) : missions.map(m => (
          <div key={m.id} onClick={() => window.location.href = `/rapport/${m.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(200,241,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🏟️</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500', margin: '0 0 2px' }}>{m.type || 'Diagnostic indoor'}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{m.date_mission || '—'}</p>
            </div>
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${statusColor[m.statut] || 'rgba(255,255,255,0.2)'}`, color: statusColor[m.statut] || 'rgba(255,255,255,0.4)' }}>{m.statut}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>→</span>
          </div>
        ))}
      </div>
    </main>
  )
}
