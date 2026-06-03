'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ClientPage() {
  const [client, setClient] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [medias, setMedias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'rapports' | 'medias'>('rapports')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: profile } = await supabase.from('user_profiles').select('role, client_id').eq('id', user.id).single()
      if (profile?.role === 'admin') { window.location.href = '/dashboard'; return }
      if (profile?.client_id) {
        const { data: clientData } = await supabase.from('clients').select('nom, plan, secteur_cible').eq('id', profile.client_id).single()
        if (clientData) setClient(clientData)
        const { data: missionsData } = await supabase.from('missions').select('id, type, date_mission, statut').eq('client_id', profile.client_id).eq('statut', 'publie').order('created_at', { ascending: false })
        if (missionsData) setMissions(missionsData)
        const { data: mediasData } = await supabase.from('medias').select('*').eq('client_id', profile.client_id).order('created_at', { ascending: false })
        if (mediasData) setMedias(mediasData)
      }
      setLoading(false)
    }
    load()
  }, [])

  function missionLabel(type: string): string {
    if (!type) return 'Diagnostic'
    if (type.includes('neuroaccess')) return 'Neuroaccess'
    if (type.includes('neurotaste')) return 'Neurotaste'
    if (type.includes('neuromedia')) return 'Neuromedia'
    return type
  }

  function missionIcon(type: string): string {
    if (type?.includes('neuroaccess')) return '🗺️'
    if (type?.includes('neurotaste')) return '🍽️'
    if (type?.includes('neuromedia')) return '🎬'
    return '📋'
  }

  function typeBorder(type: string) {
    if (type === 'drone') return 'rgba(139,92,246,0.4)'
    if (type === 'audio') return 'rgba(255,149,0,0.4)'
    if (type === 'doc') return 'rgba(52,199,89,0.4)'
    return 'rgba(55,138,221,0.3)'
  }
  function typeBg(type: string) {
    if (type === 'drone') return 'rgba(139,92,246,0.1)'
    if (type === 'audio') return 'rgba(255,149,0,0.1)'
    if (type === 'doc') return 'rgba(52,199,89,0.1)'
    return 'rgba(55,138,221,0.08)'
  }
  function typeIcon(type: string) {
    if (type === 'audio') return '🎙'
    if (type === 'video') return '🎬'
    if (type === 'drone') return '🚁'
    if (type === 'doc') return '📄'
    return '📷'
  }

  // Médias groupés par poste
  const mediasParPoste = medias.reduce((acc: any, m: any) => {
    const key = m.poste || 'Général'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Arial' }}>Chargement...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', flexShrink: 0 }}>
            <img src="/ben.jpg" alt="BEN" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 2px' }}>NeuroBoard</p>
            <h1 style={{ color: '#c8f135', fontSize: '16px', margin: 0, fontWeight: '700' }}>{client?.nom}</h1>
          </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
          Déco
        </button>
      </div>

      <div style={{ padding: '0 20px 40px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            ['Rapports', missions.length.toString()],
            ['Médias', medias.length.toString()],
            ['Offre', client?.plan || 'Neuroplay'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#1a2540', borderRadius: '12px', padding: '14px 10px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: '0 0 6px' }}>{label}</p>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['rapports', 'medias'] as const).map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: onglet === o ? '#c8f135' : 'rgba(255,255,255,0.05)', color: onglet === o ? '#0d1520' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              {o === 'rapports' ? `Rapports (${missions.length})` : `Médias (${medias.length})`}
            </button>
          ))}
        </div>

        {/* ── ONGLET RAPPORTS ── */}
        {onglet === 'rapports' && (
          <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {missions.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📋</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Aucun rapport disponible pour l'instant.</p>
              </div>
            ) : missions.map((m, i) => (
              <div key={m.id}
                onClick={() => window.location.href = `/rapport/${m.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', cursor: 'pointer', borderBottom: i < missions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(200,241,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {missionIcon(m.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 3px' }}>{missionLabel(m.type)}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>{m.date_mission}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', border: '1px solid #c8f135', color: '#c8f135' }}>publié</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ONGLET MÉDIAS ── */}
        {onglet === 'medias' && (
          <div>
            {medias.length === 0 ? (
              <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Aucun média disponible pour l'instant.</p>
              </div>
            ) : (
              <>
                {/* Récap types */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(['photo', 'video', 'audio', 'drone', 'doc'] as const).map(type => {
                    const count = medias.filter((m: any) => m.type === type).length
                    if (count === 0) return null
                    return (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: typeBg(type), border: `1px solid ${typeBorder(type)}`, borderRadius: '8px', padding: '4px 10px' }}>
                        <span style={{ fontSize: '12px' }}>{typeIcon(type)}</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{count} {type}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Médias groupés par poste */}
                {Object.entries(mediasParPoste).map(([poste, items]: any) => (
                  <div key={poste} style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', margin: 0 }}>{poste}</p>
                      <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{items.length}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {items.map((m: any) => (
                        <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${typeBorder(m.type)}`, background: typeBg(m.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                            {(m.type === 'photo' || (m.type === 'drone' && m.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)))
                              ? <img src={m.url} alt={m.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : (m.type === 'video' || (m.type === 'drone' && m.url?.match(/\.(mp4|mov|avi|webm)/i)))
                              ? <>
                                  <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <svg width="9" height="9" viewBox="0 0 10 10" fill="#000"><path d="M3 2l6 3-6 3V2z"/></svg>
                                    </div>
                                  </div>
                                </>
                              : <>
                                  <span style={{ fontSize: '24px' }}>{typeIcon(m.type)}</span>
                                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0 4px', wordBreak: 'break-all' }}>{m.nom?.substring(0, 10)}</span>
                                </>
                            }
                            {m.type === 'drone' && (
                              <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: 'rgba(0,0,0,0.6)', borderRadius: '3px', padding: '1px 3px', fontSize: '8px' }}>🚁</div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
