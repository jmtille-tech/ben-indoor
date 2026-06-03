'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ClientPage() {
  const [client, setClient] = useState<any>(null)
  const [missions, setMissions] = useState<any[]>([])
  const [medias, setMedias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'rapports' | 'medias' | 'decouvrir'>('rapports')

  const toutesLesOffres = [
    {
      id: 'neuroaccess',
      nom: 'Neuroaccess',
      icon: '/neuroaccess.svg',
      tagline: 'Parcours visiteur complet',
      description: "Analyse neuro-comportementale de l'intégralité du parcours visiteur — avant, pendant et après la visite. Identifie les frictions et les opportunités d'engagement.",
      points: ['11 postes d\'observation', 'Score Neuroaccess / 10', 'Plan d\'action priorisé', 'Rapport IA complet'],
      color: '#c8f135',
    },
    {
      id: 'neurotaste',
      nom: 'Neurotaste',
      icon: '/neurotaste.svg',
      tagline: 'Expérience F&B',
      description: 'Diagnostic spécialisé sur l\'expérience food & beverage. Analyse la perception sensorielle, la lisibilité de l\'offre et les leviers d\'achat impulsif.',
      points: ['Protocole sensoriel terrain', 'Score Neurotaste / 10', 'Audit offre & prix', 'Recommandations F&B'],
      color: '#EF9F27',
    },
    {
      id: 'neuromedia',
      nom: 'Neuromedia',
      icon: '/neuromedia.svg',
      tagline: 'Captation & médias',
      description: 'Production de contenu immersif terrain — photos, vidéos drone, interviews visiteurs. Valorise ton expérience sur les réseaux et supports de communication.',
      points: ['Captation drone & terrain', 'Interviews visiteurs', 'Montage livrable', 'Contenu réseaux sociaux'],
      color: '#7C83FD',
    },
  ]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: profile } = await supabase.from('user_profiles').select('role, client_id').eq('id', user.id).single()
      if (profile?.role === 'admin') { window.location.href = '/dashboard'; return }
      if (profile?.client_id) {
        const { data: clientData } = await supabase.from('clients').select('nom, plan, secteur_cible, offres_actives').eq('id', profile.client_id).single()
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
    if (type?.includes('neuroaccess')) return '/neuroaccess.svg'
    if (type?.includes('neurotaste')) return '/neurotaste.svg'
    if (type?.includes('neuromedia')) return '/neuromedia.svg'
    return '/neuroaccess.svg'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            ['Rapports', missions.length.toString()],
            ['Médias', medias.length.toString()],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#1a2540', borderRadius: '12px', padding: '14px 10px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', margin: '0 0 6px' }}>{label}</p>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Protocoles actifs */}
        {client?.offres_actives?.length > 0 && (
          <div style={{ background: '#1a2540', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', marginBottom: '20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Protocoles actifs</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(client.offres_actives as string[]).map((offre: string) => {
                const meta: Record<string, { icon: string; color: string }> = {
                  neuroaccess: { icon: '/neuroaccess.svg', color: '#c8f135' },
                  neurotaste:  { icon: '/neurotaste.svg',  color: '#EF9F27' },
                  neuromedia:  { icon: '/neuromedia.svg',  color: '#7C83FD' },
                }
                const m = meta[offre] || { icon: '/neuroaccess.svg', color: '#fff' }
                return (
                  <div key={offre} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: m.color + '12', border: `1px solid ${m.color}40`, borderRadius: '20px', padding: '5px 12px' }}>
                    <img src={m.icon} width="16" height="16" alt={offre} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: m.color, textTransform: 'capitalize' }}>{offre}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['rapports', 'medias', 'decouvrir'] as const).map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: onglet === o ? '#c8f135' : 'rgba(255,255,255,0.05)', color: onglet === o ? '#0d1520' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              {o === 'rapports' ? `Rapports (${missions.length})` : o === 'medias' ? `Médias (${medias.length})` : '✦ Nos offres'}
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
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={missionIcon(m.type)} width="44" height="44" alt={missionLabel(m.type)} style={{ width: '100%', height: '100%' }} />
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

        {/* ── ONGLET NOS OFFRES ── */}
        {onglet === 'decouvrir' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
              Découvrez les autres protocoles Neuroplay pour aller encore plus loin dans l'optimisation de votre expérience visiteur.
            </p>
            {toutesLesOffres.map(offre => {
              const active = client?.offres_actives?.includes(offre.id)
              return (
                <div key={offre.id} style={{ background: '#1a2540', borderRadius: '16px', border: `1px solid ${active ? offre.color + '40' : 'rgba(255,255,255,0.06)'}`, marginBottom: '16px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', background: active ? offre.color + '20' : 'rgba(255,255,255,0.06)', border: `1px solid ${active ? offre.color + '60' : 'rgba(255,255,255,0.12)'}`, borderRadius: '20px', padding: '3px 10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: active ? offre.color : 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{active ? '✓ ACTIF' : 'DISPONIBLE'}</span>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={offre.icon} width="44" height="44" alt={offre.nom} style={{ width: '100%', height: '100%' }} />
                      </div>
                      <div>
                        <p style={{ color: offre.color, fontSize: '16px', fontWeight: '700', margin: '0 0 2px' }}>{offre.nom}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{offre.tagline}</p>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 14px', lineHeight: 1.6 }}>{offre.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: active ? '0' : '16px' }}>
                      {offre.points.map((p, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: offre.color + '10', border: `1px solid ${offre.color}30`, color: 'rgba(255,255,255,0.6)' }}>
                          {active ? '✓' : '·'} {p}
                        </span>
                      ))}
                    </div>
                    {!active && (
                      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', filter: 'blur(3px)', userSelect: 'none' }}>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '8px', width: '60%' }} />
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '6px', width: '90%' }} />
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px', width: '75%' }} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[40, 65, 55, 80, 45].map((h, i) => (
                              <div key={i} style={{ flex: 1, height: `${h}px`, background: offre.color + '30', borderRadius: '4px 4px 0 0' }} />
                            ))}
                          </div>
                        </div>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,21,32,0.7)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0, textAlign: 'center' }}>Aperçu disponible sur demande</p>
                        </div>
                      </div>
                    )}
                    {!active && (
                      <button
                        onClick={() => window.location.href = `mailto:contact@neuroplayxperiences.com?subject=Demande de démo ${offre.nom} — ${client?.nom}&body=Bonjour,%0A%0AJe souhaite en savoir plus sur le protocole ${offre.nom} pour ${client?.nom}.%0A%0ACordialement`}
                        style={{ width: '100%', marginTop: '14px', padding: '12px', borderRadius: '10px', background: offre.color, color: '#0d1520', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                        Demander une démo {offre.nom} →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
