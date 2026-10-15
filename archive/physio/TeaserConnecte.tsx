// ARCHIVE — teaser « Disponible en diagnostic connecté » (extrait tel quel de app/rapport/[id]/page.tsx, état physio-v1).
import React from 'react'

export function TeaserConnecte({ titre, description, icone }: { titre: string; description: string; icone: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px', marginBottom: '24px' }}>{icone}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f135' }} />
        <span style={{ fontSize: '11px', color: '#c8f135', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Disponible en diagnostic connecté</span>
      </div>
      <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 12px', lineHeight: 1.3 }}>{titre}</h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.7, maxWidth: '480px', margin: '0 0 32px' }}>{description}</p>
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
      <div style={{ display: 'flex', gap: '12px' }}>
        <a href="mailto:jmtille@neuroplayxperiences.com?subject=Demande diagnostic connecté BEN" style={{ background: '#c8f135', border: 'none', borderRadius: '8px', color: '#0d1520', fontSize: '13px', fontWeight: '700', padding: '10px 24px', cursor: 'pointer', textDecoration: 'none' }}>
          Demander une démonstration
        </a>
        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '10px 24px', cursor: 'pointer' }}>
          En savoir plus
        </button>
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '24px 0 0' }}>
        Ce rapport est basé sur un diagnostic cognitif terrain. Le diagnostic connecté enrichit l'analyse avec des données physiologiques objectives.
      </p>
    </div>
  )
}
