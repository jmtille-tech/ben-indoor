'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [medias, setMedias] = useState<any[]>([])
  const [onglet, setOnglet] = useState<'missions' | 'medias'>('missions')
  const [filtreClient, setFiltreClient] = useState<string>('tous')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'admin') setIsAdmin(true)
      else setUser(data.user)
    })
    loadMissions()
    loadClients()
    loadMedias()
  }, [])

  async function loadMissions() {
    const { data } = await supabase.from('missions').select('*, clients(nom, secteur)').order('created_at', { ascending: false })
    if (data) setMissions(data)
  }

  async function loadClients() {
    const { data } = await supabase.from('clients').select('id, nom, secteur_cible, plan, offres_actives, statut').order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  async function deleteMedia(id: string) {
    if (!confirm('Supprimer ce média ?')) return
    await supabase.from('medias').delete().eq('id', id)
    setMedias(prev => prev.filter((m: any) => m.id !== id))
  }

  async function loadMedias() {
    const { data } = await supabase.from('medias').select('*, clients(nom)').order('created_at', { ascending: false })
    if (data) setMedias(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const statusColor: any = { publie: '#c8f135', brouillon: 'rgba(255,255,255,0.3)', 'en cours': '#EF9F27' }

  function missionLabel(type: string): string {
    if (!type) return '—'
    if (type.includes('neuroaccess')) return 'Neuroaccess'
    if (type.includes('neurotaste')) return 'Neurotaste'
    if (type.includes('neuromedia')) return 'Neuromedia'
    return type
  }

  const clientsActifs = clients.filter(c => c.statut === 'actif')
  const mediasFiltres = filtreClient === 'tous' ? medias : medias.filter(m => m.client_id === filtreClient)

  // grouper médias par poste
  const mediasParPoste = mediasFiltres.reduce((acc: any, m: any) => {
    const key = m.poste || 'Sans poste'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  function typeIcon(type: string) {
    if (type === 'audio') return '🎙'
    if (type === 'video') return '🎬'
    if (type === 'drone') return '🚁'
    if (type === 'doc') return '📄'
    return '📷'
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

  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', flexShrink: 0 }}>
            <img src="/ben.jpg" alt="BEN" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ color: '#c8f135', fontSize: '18px', margin: '0 0 2px', fontWeight: '700' }}>BEN</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>Neuroplay Xpériences</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'none' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>Déco</button>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            ['Clients', clientsActifs.length.toString()],
            ['Rapports', missions.filter(m => m.statut === 'publie').length.toString()],
            ['Médias', medias.length.toString()],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#1a2540', borderRadius: '12px', padding: '16px 12px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '0 0 6px' }}>{label}</p>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: '600', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* CTA Diagnostic */}
        <button onClick={() => window.location.href = '/terrain'}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '14px', padding: '16px 20px', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: '24px', boxSizing: 'border-box' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="10" r="3" stroke="#c8f135" strokeWidth="1.5"/>
              <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="#c8f135" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#c8f135', fontSize: '14px', fontWeight: '700', margin: '0 0 2px' }}>Démarrer un diagnostic</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>BEN te guide poste par poste →</p>
          </div>
          <span style={{ color: '#c8f135', fontSize: '18px' }}>→</span>
        </button>

        {/* Onglets Missions / Médias */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['missions', 'medias'] as const).map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: onglet === o ? '#c8f135' : 'rgba(255,255,255,0.05)', color: onglet === o ? '#0d1520' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize' }}>
              {o === 'missions' ? `Missions (${missions.length})` : `Médias (${medias.length})`}
            </button>
          ))}
        </div>

        {/* ── ONGLET MISSIONS ── */}
        {onglet === 'missions' && (
          <>
            {/* Clients */}
            <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Clients</p>
              {clients.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>Aucun client.</p>
                : clients.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8f135', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{c.nom?.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nom}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{c.secteur_cible || '—'}</p>
                    </div>
                    <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>{c.plan || 'Neuroplay'}</span>
                  </div>
                ))}
            </div>

            {/* Missions */}
            <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Missions récentes</p>
              {missions.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>Aucune mission.</p>
                : missions.map(m => (
                  <div key={m.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                    onClick={() => window.location.href = `/rapport/${m.id}`}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8f135', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{m.clients?.nom?.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.clients?.nom}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>{missionLabel(m.type)} · {m.date_mission}</p>
                    </div>
                    <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', border: `1px solid ${statusColor[m.statut]}`, color: statusColor[m.statut], flexShrink: 0 }}>{m.statut}</span>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* ── ONGLET MÉDIAS ── */}
        {onglet === 'medias' && (
          <div>
            {/* Filtre par client */}
            <select
              value={filtreClient}
              onChange={e => setFiltreClient(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', marginBottom: '16px', boxSizing: 'border-box' }}>
              <option value="tous" style={{ background: '#1a2540' }}>Tous les clients</option>
              {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#1a2540' }}>{c.nom}</option>)}
            </select>

            {mediasFiltres.length === 0 ? (
              <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Aucun média capté pour l'instant.</p>
              </div>
            ) : (
              <>
                {/* Récap types */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {(['photo', 'video', 'audio', 'drone', 'doc'] as const).map(type => {
                    const count = mediasFiltres.filter((m: any) => m.type === type).length
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
                        <div key={m.id} style={{ position: 'relative', display: 'inline-block' }}>
                          {isAdmin && <button onClick={() => deleteMedia(m.id)} style={{ position: 'absolute', top: '-6px', right: '-6px', zIndex: 10, width: '18px', height: '18px', borderRadius: '50%', background: '#E24B4A', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>}
                          <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
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
                        </div>
                      ))}
                    </div>
                    {/* Nom client si filtre "tous" */}
                    {filtreClient === 'tous' && items[0]?.clients?.nom && (
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', margin: '8px 0 0' }}>{items[0].clients.nom}</p>
                    )}
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
