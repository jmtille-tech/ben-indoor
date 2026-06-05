'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

// ── Teaser onglet non activé ──────────────────────────────────────────────────
function TeaserConnecte({ titre, description, icone }: { titre: string; description: string; icone: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', padding: '40px' }}>
      {/* Icone */}
      <div style={{ fontSize: '48px', marginBottom: '24px' }}>{icone}</div>

      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f135' }} />
        <span style={{ fontSize: '11px', color: '#c8f135', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Disponible en diagnostic connecté</span>
      </div>

      {/* Titre */}
      <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 12px', lineHeight: 1.3 }}>{titre}</h2>

      {/* Description */}
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.7, maxWidth: '480px', margin: '0 0 32px' }}>{description}</p>

      {/* Ce que ça apporte */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '600px', marginBottom: '40px' }}>
        {[
          { icon: '📡', label: 'Capteurs biométriques', desc: 'EDA, HRV, eye-tracking en temps réel' },
          { icon: '🧬', label: 'Signaux physiologiques', desc: 'Stress, engagement, zones de flow' },
          { icon: '📊', label: 'Données enrichies', desc: 'Corrélation comportement & physiologie' },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{item.icon}</div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', margin: '0 0 4px' }}>{item.label}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <a href="mailto:jmtille@neuroplayxperiences.com?subject=Demande diagnostic connecté BEN" style={{ background: '#c8f135', border: 'none', borderRadius: '8px', color: '#0d1520', fontSize: '13px', fontWeight: '700', padding: '10px 24px', cursor: 'pointer', textDecoration: 'none' }}>
          Demander une démonstration
        </a>
        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '10px 24px', cursor: 'pointer' }}>
          En savoir plus
        </button>
      </div>

      {/* Note bas */}
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '24px 0 0' }}>
        Ce rapport est basé sur un diagnostic cognitif terrain. Le diagnostic connecté enrichit l'analyse avec des données physiologiques objectives.
      </p>
    </div>
  )
}

export default function Rapport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [rapport, setRapport] = useState<any>(null)
  const [mission, setMission] = useState<any>(null)
  const [onglet, setOnglet] = useState('exec')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/'
    })
    loadRapport()
  }, [])

  useEffect(() => {
    if (onglet !== 'neuroimpact' || !rapport) return
    const ni = rapport.neuro_impact || {}
    // Seulement si données connectées présentes
    if (!ni.eda && !ni.hrv) return
    const drawChart = (id: string, data: number[], color: string, bgColor: string) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement
      if (!canvas || (canvas as any)._drawn) return
      ;(canvas as any)._drawn = true
      import('chart.js').then(({ Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler }) => {
        Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)
        new Chart(canvas, {
          type: 'line',
          data: {
            labels: ['Entrée', 'Billetterie', 'Parcours', 'Attraction', 'F&B', 'Sortie'],
            datasets: [{
              data,
              borderColor: color,
              backgroundColor: bgColor,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: color
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxRotation: 0, autoSkip: false },
                grid: { color: 'rgba(255,255,255,0.04)' }
              },
              y: {
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.04)' }
              }
            }
          }
        })
      })
    }
    drawChart('edaChart', [1.2, 4.8, 2.1, 3.2, 6.8, 2.9], '#c8f135', 'rgba(200,241,53,0.08)')
    drawChart('hrvChart', [68, 21, 45, 58, 18, 24], '#378ADD', 'rgba(55,138,221,0.08)')
  }, [onglet, rapport])

  useEffect(() => {
    if (onglet !== 'score' || !rapport) return
    const sn = rapport.score_neuroplay || {}
    if (!sn.accessibilite) return
    const canvas = document.getElementById('radarChart') as HTMLCanvasElement
    if (!canvas || (canvas as any)._drawn) return
    ;(canvas as any)._drawn = true
    import('chart.js').then(({ Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip }) => {
      Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)
      new Chart(canvas, {
        type: 'radar',
        data: {
          labels: ['Accessibilité', 'Fluidité', 'Clarté', 'Plaisir', 'Perf. commerciale'],
          datasets: [{
            data: [sn.accessibilite, sn.fluidite, sn.clarte, sn.plaisir, sn.performance_commerciale],
            backgroundColor: 'rgba(200,241,53,0.12)',
            borderColor: '#c8f135',
            borderWidth: 2,
            pointBackgroundColor: '#c8f135',
            pointRadius: 4
          }]
        },
        options: {
          responsive: false,
          scales: {
            r: {
              min: 0, max: 10,
              ticks: { stepSize: 2, color: 'rgba(255,255,255,0.2)', font: { size: 10 }, backdropColor: 'transparent' },
              grid: { color: 'rgba(255,255,255,0.08)' },
              angleLines: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }
            }
          },
          plugins: { legend: { display: false } }
        }
      })
    })
  }, [onglet, rapport])

  async function loadRapport() {
    const { data: m } = await supabase
      .from('missions')
      .select('*, clients(nom, secteur)')
      .eq('id', id)
      .single()
    if (m) setMission(m)
    const { data: r } = await supabase
      .from('rapports')
      .select('*')
      .eq('mission_id', id)
      .single()
    if (r) setRapport(r)
  }

  async function handleRetour() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    window.location.href = profile?.role === 'admin' ? '/dashboard' : '/client'
  }

  const scoreColor = (s: number) => s >= 7 ? '#c8f135' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const interpColor: any = {
    flow: '#1D9E75', waouh: '#1D9E75',
    stress_modere: '#EF9F27', confusion: '#EF9F27',
    stress_fort: '#E24B4A'
  }
  const interpLabel: any = {
    flow: 'Flow', waouh: 'Waouh',
    stress_modere: 'Stress modéré', confusion: 'Confusion',
    stress_fort: 'Stress fort'
  }
  const syntheseColor: any = {
    critique: '#E24B4A', quickwin: '#c8f135',
    optimisation: '#378ADD', long_terme: 'rgba(255,255,255,0.4)'
  }
  const syntheseLabel: any = {
    critique: 'Friction critique', quickwin: 'Quick win',
    optimisation: 'Optimisation', long_terme: 'Long terme'
  }

  const onglets = [
    { id: 'exec', label: 'Executive Summary', connecte: false },
    { id: 'parcours', label: 'Parcours client', connecte: false },
    { id: 'cognitif', label: 'Analyse cognitive', connecte: false },
    { id: 'neuroimpact', label: 'NeuroImpact', connecte: true },
    { id: 'synthese', label: 'Synthèse stratégique', connecte: false },
    { id: 'score', label: 'Score NeuroPlay', connecte: true },
  ]

  const pct = (v: number) => `${Math.round(v * 10)}%`

  if (!rapport) return (
    <main style={{ minHeight: '100vh', background: '#0d1520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial' }}>Chargement...</p>
    </main>
  )

  const ex = rapport.executive_summary || {}
  const parc = rapport.parcours_scores || {}
  const cog = rapport.analyse_cognitive || {}
  const ni = rapport.neuro_impact || {}
  const syn = rapport.synthese || []
  const sn = rapport.score_neuroplay || {}

  // Détecte si les données connectées sont présentes
  const hasNeuroImpact = ni && (ni.eda || ni.hrv || ni.zones?.length > 0)
  const hasScore = sn && Object.keys(sn).length > 0 && sn.accessibilite

  return (
    <main style={{ minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' }}>

      <div style={{ background: '#111d30', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleRetour} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>← Retour</button>
          <div>
            <p style={{ color: '#c8f135', fontSize: '13px', fontWeight: '700', margin: 0 }}>NeuroPlay Access — Diagnostic Expérience Visiteur</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{mission?.clients?.nom} · {mission?.type} · {mission?.date_mission}</p>
          </div>
        </div>
        <button style={{ background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '8px', color: '#c8f135', fontSize: '12px', padding: '6px 14px', cursor: 'pointer' }}>
          Télécharger PDF
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', background: '#111d30', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', overflowX: 'auto' }}>
        {onglets.map(o => {
          const isConnecte = o.connecte
          const isActive = onglet === o.id
          return (
            <div key={o.id} onClick={() => setOnglet(o.id)} style={{ padding: '10px 16px', fontSize: '12px', color: isActive ? '#c8f135' : isConnecte ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: isActive ? '2px solid #c8f135' : '2px solid transparent', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {o.label}
              {isConnecte && (
                <span style={{ fontSize: '9px', background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.25)', color: '#c8f135', borderRadius: '10px', padding: '1px 6px', fontWeight: '700', letterSpacing: '0.05em' }}>
                  CONNECTÉ
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

        {onglet === 'exec' && (
          <div>
            <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
              <p style={{ fontSize: '64px', fontWeight: '700', color: '#c8f135', margin: '0 0 4px', lineHeight: 1 }}>{ex.score_global}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Score global expérience / 10</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: '3 frictions majeures', items: ex.frictions || [], color: '#E24B4A' },
                { label: '3 opportunités immédiates', items: ex.opportunites || [], color: '#c8f135' },
                { label: 'Insight stratégique', items: [ex.insight], color: '#378ADD' },
              ].map(({ label, items, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>{label}</p>
                  {items.map((item: string, i: number) => (
                    <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '10px', borderLeft: `2px solid ${color}`, lineHeight: 1.4 }}>{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {onglet === 'parcours' && (
          <div>
            {[
              { label: 'Avant la visite', data: parc.avant || [] },
              { label: 'Pendant la visite', data: parc.pendant || [] },
              { label: 'Après la visite', data: parc.apres || [] },
            ].map(({ label, data }) => (
              <div key={label} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>{label}</p>
                {data.map((item: any) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', flex: 1, margin: 0 }}>{item.label}</p>
                    <div style={{ width: '100px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', flexShrink: 0 }}>
                      <div style={{ width: pct(item.score), height: '5px', background: scoreColor(item.score), borderRadius: '3px' }} />
                    </div>
                    <p style={{ color: scoreColor(item.score), fontSize: '13px', fontWeight: '500', minWidth: '36px', textAlign: 'right', margin: 0 }}>{item.score}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {onglet === 'cognitif' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { icon: '🧠', label: 'Surcharge mentale', data: cog.surcharge || [] },
              { icon: '😕', label: 'Moments de doute', data: cog.doute || [] },
              { icon: '😍', label: 'Moments waouh', data: cog.waouh || [] },
            ].map(({ icon, label, data }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{label}</p>
                {data.map((obs: string, i: number) => (
                  <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 8px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', lineHeight: 1.5 }}>{obs}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {onglet === 'neuroimpact' && (
          hasNeuroImpact ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <span style={{ background: 'rgba(200,241,53,0.12)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', color: '#c8f135', fontWeight: '700' }}>NeuroImpact</span>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{ni.protocole}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>EDA — Réponse électrodermale</p>
                  {[
                    ['Niveau moyen', `${ni.eda?.moyenne} µS`],
                    ['Pic maximal', `${ni.eda?.pic_max} µS`],
                    ['Pic minimal', `${ni.eda?.pic_min} µS`],
                    ['Zones de stress', `${ni.eda?.zones_stress} détectées`]
                  ].map(([k, v]: any) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ position: 'relative', height: '130px', marginTop: '16px' }}>
                    <canvas id="edaChart" />
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '6px 0 0', textAlign: 'center' }}>Parcours chronologique — de l'entrée à la sortie</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>HRV — Variabilité cardiaque</p>
                  {[
                    ['HRV moyen', `${ni.hrv?.moyenne} ms`],
                    ['HRV minimum', `${ni.hrv?.minimum} ms`],
                    ['HRV maximum', `${ni.hrv?.maximum} ms`],
                    ['Zones de flow', `${ni.hrv?.zones_flow} détectées`]
                  ].map(([k, v]: any) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{k}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ position: 'relative', height: '130px', marginTop: '16px' }}>
                    <canvas id="hrvChart" />
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '6px 0 0', textAlign: 'center' }}>HRV élevé = détente & engagement · HRV bas = stress</p>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Corrélation zones · signaux physiologiques</p>
              {(ni.zones || []).map((z: any) => (
                <div key={z.nom} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: interpColor[z.interpretation], flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', flex: 1 }}>{z.nom}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', flex: 1 }}>EDA {z.eda} µS · HRV {z.hrv} ms</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: `${interpColor[z.interpretation]}18`, color: interpColor[z.interpretation], flexShrink: 0 }}>{interpLabel[z.interpretation]}</span>
                </div>
              ))}
            </div>
          ) : (
            <TeaserConnecte
              icone="📡"
              titre="NeuroImpact — Signaux physiologiques"
              description="Cette section présente les données biométriques captées en temps réel lors du parcours visiteur : réponse électrodermale (EDA), variabilité cardiaque (HRV) et corrélation avec les zones d'expérience. Disponible uniquement dans le cadre d'un diagnostic connecté."
            />
          )
        )}

        {onglet === 'synthese' && (
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Plan d'action stratégique</p>
            {syn.map((r: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: `${syntheseColor[r.type]}18`, color: syntheseColor[r.type], border: `1px solid ${syntheseColor[r.type]}40`, flexShrink: 0, whiteSpace: 'nowrap' }}>{syntheseLabel[r.type]}</span>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 2px' }}>{r.texte}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{r.poste} · {r.delai}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === 'score' && (
          hasScore ? (
            <div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Score NeuroPlay — signature Neuroplay Xpériences</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <canvas id="radarChart" width="300" height="300" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {[
                  { label: 'Accessibilité', val: sn.accessibilite },
                  { label: 'Fluidité', val: sn.fluidite },
                  { label: 'Clarté', val: sn.clarte },
                  { label: 'Plaisir', val: sn.plaisir },
                  { label: 'Perf. commerciale', val: sn.performance_commerciale },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '32px', background: scoreColor(val), borderRadius: '4px 4px 0 0', height: `${val * 6}px` }} />
                    </div>
                    <p style={{ fontSize: '22px', fontWeight: '700', color: scoreColor(val), margin: 0 }}>{val}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Score global NeuroPlay</p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: '#c8f135', margin: 0 }}>
                  {((sn.accessibilite + sn.fluidite + sn.clarte + sn.plaisir + sn.performance_commerciale) / 5).toFixed(1)}
                </p>
              </div>
            </div>
          ) : (
            <TeaserConnecte
              icone="🎯"
              titre="Score NeuroPlay — Signature globale"
              description="Le Score NeuroPlay agrège les données physiologiques et comportementales en 5 dimensions clés : Accessibilité, Fluidité, Clarté, Plaisir et Performance commerciale. Ce scoring enrichi est généré à partir des données captées lors d'un diagnostic connecté."
            />
          )
        )}

      </div>
    </main>
  )
}
