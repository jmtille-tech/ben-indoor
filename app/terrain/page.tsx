'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── PROTOCOLE NEUROACCESS ──
const protocoleNeuroaccess = [
  {
    phase: 'Avant la visite',
    postes: [
      {
        nom: 'Accessibilité',
        questions: [
          "Le site est-il accessible en transport en commun ? L'information est-elle disponible facilement ?",
          'Y a-t-il des aménagements PMR visibles et fonctionnels ?',
          "L'accès est-il indiqué depuis les axes principaux ?",
        ],
        neuro: "Combien d'étapes faut-il pour trouver comment venir ? C'est simple ou stressant ?",
        media: ['Note vocale', 'Photo signalétique routière']
      },
      {
        nom: 'Parking',
        questions: [
          'Le parking est-il facile à trouver et à comprendre ?',
          "La distance entre le parking et l'entrée est-elle clairement indiquée ?",
          "Y a-t-il des places PMR, familles, vélos, bornes électriques ?",
        ],
        neuro: "Combien de décisions à prendre depuis l'arrivée en voiture jusqu'à l'entrée ?",
        media: ['Note vocale', 'Photo entrée parking', 'Drone vue parking']
      },
      {
        nom: 'Signalétique externe',
        questions: [
          'La signalétique est-elle visible, lisible, cohérente depuis la voie publique ?',
          "Y a-t-il une continuité visuelle entre le parking et l'entrée du site ?",
        ],
        neuro: "Y a-t-il un élément visuel fort qui crée de l'excitation avant même d'entrer ?",
        media: ['Photo signalétique', 'Vidéo cheminement']
      },
      {
        nom: 'Digital site web et réservation',
        questions: [
          "Le site est-il lisible sur mobile ? L'achat de billet est-il fluide en moins de 3 minutes ?",
          'Les tarifs, horaires et infos pratiques sont-ils visibles sans chercher ?',
          "Y a-t-il des options de prévente, abonnements, offres famille mises en avant ?",
        ],
        neuro: "Nombre de clics pour acheter un billet ? Y a-t-il des étapes inutiles ou confuses ?",
        media: ['Note vocale parcours achat', 'Screenshot mobile']
      },
    ]
  },
  {
    phase: 'Pendant la visite',
    postes: [
      {
        nom: 'Accueil humain',
        questions: [
          "Le personnel d'accueil est-il identifiable, souriant, proactif ?",
          'Le temps de passage en caisse / contrôle est-il acceptable (< 2 min) ?',
          "Y a-t-il une information de bienvenue claire sur ce qu'il y a à faire/voir ?",
        ],
        neuro: "Y a-t-il un geste d'accueil mémorable ? Quelque chose qui surprend positivement ?",
        media: ["Note vocale 1ère impression", 'Vidéo zone accueil']
      },
      {
        nom: 'Fluidité du parcours',
        questions: [
          'Les zones sont-elles bien délimitées et compréhensibles sans carte ?',
          'Y a-t-il des zones de congestion ou des zones désertes ?',
          "Le visiteur est-il naturellement guidé vers les activités à fort intérêt ?",
        ],
        neuro: "Faut-il réfléchir pour savoir où aller ? Le parcours est-il intuitif ?",
        media: ['Drone flux global', 'Vidéo zones clés']
      },
      {
        nom: 'Compréhension offre et perception prix',
        questions: [
          'Les prix sont-ils affichés clairement aux points de vente ?',
          "Le visiteur comprend-il ce qui est inclus dans son billet vs en supplément ?",
          "Y a-t-il des opportunités de vente additionnelle bien intégrées ?",
        ],
        neuro: "Le visiteur doit-il calculer, comparer, choisir sous pression ?",
        media: ['Photo affichage prix', 'Note vocale perception']
      },
      {
        nom: 'Friction F&B',
        questions: [
          'Les points F&B sont-ils visibles et accessibles depuis les zones de forte fréquentation ?',
          "L'offre est-elle lisible ? Les menus sont-ils clairs et attractifs ?",
          "Le temps d'attente F&B est-il raisonnable ?",
          'La qualité perçue est-elle cohérente avec le prix affiché ?',
        ],
        neuro: "Y a-t-il un élément F&B mémorable, signature, qui renforce l'identité du lieu ?",
        media: ['Photo menus et implantation', 'Vidéo flux F&B']
      },
    ]
  },
  {
    phase: 'Après la visite',
    postes: [
      {
        nom: 'Sortie',
        questions: [
          'La sortie est-elle clairement indiquée ?',
          'Le visiteur repart-il avec une bonne dernière image ?',
          "Y a-t-il un message de remerciement / au revoir visible ?",
        ],
        neuro: "Y a-t-il un dernier geste fort qui clôt l'expérience de façon mémorable ?",
        media: ['Note vocale impression finale', 'Photo zone sortie']
      },
      {
        nom: 'Souvenir et boutique',
        questions: [
          "Y a-t-il une boutique ou un point souvenir bien placé avant la sortie ?",
          "L'offre souvenir est-elle en cohérence avec l'identité du lieu ?",
          "Y a-t-il une photo souvenir proposée ?",
        ],
        neuro: "Y a-t-il un produit souvenir vraiment original, qu'on ne trouve nulle part ailleurs ?",
        media: ['Photo boutique et offre', 'Note vocale']
      },
      {
        nom: 'Recontact et fidélisation',
        questions: [
          "Y a-t-il une invitation à revenir ? (abonnement, offre fidélité, prochain événement)",
          "Y a-t-il un dispositif de collecte d'avis sur place ?",
          'Le visiteur reçoit-il un email de suivi / enquête satisfaction ?',
          'Les réseaux sociaux sont-ils mis en avant ?',
        ],
        neuro: "Laisser un avis est-il simple et rapide ? Y a-t-il une raison évidente de revenir ?",
        media: ['Photo dispositifs fidélisation', 'Note vocale globale']
      },
    ]
  }
]

const allPostesNeuroaccess = protocoleNeuroaccess.flatMap(p =>
  p.postes.map(poste => ({ ...poste, phase: p.phase }))
)

// ── PROTOCOLE NEUROTASTE ──
const protocoleNeurotaste = [
  {
    phase: 'Avant la commande',
    postes: [
      {
        nom: 'Séquence d\'entrée',
        questions: [
          'Le point F&B est-il visible et accessible depuis les zones de forte fréquentation du site ?',
          'La signalétique directionnelle vers la restauration est-elle claire et suffisante ?',
          'L\'entrée du point de vente est-elle propre, accueillante, sans encombrement ?',
          'La première impression (propreté, odeurs, ambiance sonore) est-elle positive ?',
        ],
        neuro: 'En arrivant, le visiteur sait-il immédiatement ce qu\'il va trouver ? Y a-t-il un élément visuel ou olfactif qui donne envie d\'entrer ?',
        media: ['Photo entrée point F&B', 'Note vocale 1ère impression']
      },
      {
        nom: 'Aspect général & ambiance',
        questions: [
          'Le comptoir/espace de vente est-il visible depuis la salle et les zones d\'attente ?',
          'L\'éclairage est-il adapté (attractif sur les produits, agréable pour les clients) ?',
          'Le mobilier et la décoration sont-ils cohérents avec l\'identité du site ?',
          'La propreté générale (sols, tables, comptoirs, équipements) est-elle irréprochable ?',
        ],
        neuro: 'L\'ambiance donne-t-elle envie de s\'attarder et de consommer ? Y a-t-il un élément scénographique mémorable ?',
        media: ['Photo ambiance générale', 'Vidéo panoramique espace']
      },
      {
        nom: 'Signalétique & lisibilité',
        questions: [
          'Les menus et prix sont-ils affichés clairement et lisibles depuis la file d\'attente ?',
          'Les formules et offres spéciales sont-elles mises en avant efficacement ?',
          'Les visuels des produits sont-ils appétissants et représentatifs de la réalité ?',
          'Les informations légales (allergènes, labels) sont-elles présentes et lisibles ?',
        ],
        neuro: 'Le visiteur peut-il prendre sa décision de commande avant d\'arriver au comptoir ? Y a-t-il une surcharge d\'information ou au contraire un manque ?',
        media: ['Photo menus & affichages', 'Screenshot offre digitale']
      },
    ]
  },
  {
    phase: 'La commande',
    postes: [
      {
        nom: 'L\'offre',
        questions: [
          'L\'offre salée couvre-t-elle les différents moments de consommation (snacking, repas complet) ?',
          'L\'offre sucrée et boissons est-elle adaptée aux attentes des familles et groupes ?',
          'La cohérence offre/prix est-elle perçue positivement par rapport au contexte du site ?',
          'Y a-t-il des produits signature ou locaux qui renforcent l\'identité du lieu ?',
        ],
        neuro: 'Y a-t-il un produit ou une offre qui crée de la surprise ou de l\'envie ? La gamme donne-t-elle le sentiment d\'un bon rapport qualité/prix ?',
        media: ['Photo offre complète', 'Note vocale perception prix']
      },
      {
        nom: 'Le personnel',
        questions: [
          'Le personnel est-il identifiable (tenue, badge) et souriant à l\'accueil ?',
          'La prise en charge client est-elle rapide et professionnelle ?',
          'Le personnel propose-t-il des ventes additionnelles ou complémentaires spontanément ?',
          'L\'encaissement est-il fluide ? Les moyens de paiement sont-ils adaptés (CB, sans contact) ?',
        ],
        neuro: 'Y a-t-il un geste ou une attention du personnel qui surprend positivement ? La relation client crée-t-elle de l\'attachement au lieu ?',
        media: ['Note vocale interaction staff', 'Vidéo zone caisse']
      },
      {
        nom: 'Fluidité & temps d\'attente',
        questions: [
          'Le temps d\'attente pour commander est-il acceptable (< 5 min en période normale) ?',
          'Le temps de préparation et de service est-il cohérent avec le type d\'offre proposée ?',
          'Y a-t-il des zones de congestion ou de confusion dans la circulation autour du comptoir ?',
          'La gestion de la file d\'attente est-elle organisée et clairement indiquée ?',
        ],
        neuro: 'L\'attente est-elle perçue comme longue par le visiteur ? Y a-t-il des éléments qui occupent ou distraient pendant l\'attente ?',
        media: ['Vidéo flux file d\'attente', 'Note vocale temps observé']
      },
    ]
  },
  {
    phase: 'Après la commande',
    postes: [
      {
        nom: 'Qualité & présentation produits',
        questions: [
          'La présentation des produits est-elle soignée et conforme aux visuels affichés ?',
          'La qualité gustative perçue est-elle cohérente avec le prix payé ?',
          'Les portions sont-elles adaptées aux attentes (familles, enfants, adultes) ?',
          'Y a-t-il un produit ou une recette qui se distingue positivement ?',
        ],
        neuro: 'Y a-t-il un moment "waouh" lié au produit lui-même ? La dégustation crée-t-elle un souvenir positif associé au lieu ?',
        media: ['Photo produits servis', 'Note vocale dégustation']
      },
      {
        nom: 'Performance & fidélisation',
        questions: [
          'La dépense par visiteur semble-t-elle optimisée (vente additionnelle, offres combinées) ?',
          'Y a-t-il un dispositif de collecte d\'avis ou de satisfaction sur place ?',
          'L\'exploitant dispose-t-il d\'indicateurs de suivi (DPV, taux de transformation, tickets moyens) ?',
          'Y a-t-il une incitation à revenir ou une offre de fidélisation liée à la restauration ?',
        ],
        neuro: 'Le visiteur repart-il avec l\'envie de revenir spécifiquement pour l\'offre F&B ? La restauration renforce-t-elle ou affaiblit-elle l\'image globale du site ?',
        media: ['Note vocale bilan global', 'Photo dispositifs fidélisation']
      },
    ]
  }
]

const allPostesNeurotaste = protocoleNeurotaste.flatMap(p =>
  p.postes.map(poste => ({ ...poste, phase: p.phase }))
)

// ── PROTOCOLE NEUROMEDIA ──
const protocoleNeuromedia = [
  {
    phase: 'Avant la visite',
    postes: [
      {
        nom: 'Présence digitale',
        questions: [
          'Le site web donne-t-il envie de visiter ? Les visuels sont-ils immersifs et émotionnels ?',
          'Les réseaux sociaux reflètent-ils l\'expérience réelle du site ? Le contenu est-il régulier ?',
          'Y a-t-il des vidéos de présentation (teaser, storytelling, drone) facilement accessibles ?',
          'Le référencement local et les avis Google sont-ils soignés et mis en avant ?',
        ],
        neuro: 'En voyant les contenus en ligne, ressent-on de l\'envie, de la curiosité, de l\'émotion ? Y a-t-il un élément visuel fort qui ancre l\'identité du lieu dans la mémoire ?',
        media: ['Screenshot site & réseaux', 'Note vocale 1ère impression digitale']
      },
      {
        nom: 'Communication pré-visite',
        questions: [
          'Y a-t-il une stratégie de contenu cohérente sur les différents canaux digitaux ?',
          'Les emails / newsletters pre-visite sont-ils engageants et personnalisés ?',
          'Y a-t-il des contenus qui créent de l\'anticipation et de l\'excitation avant la venue ?',
          'Les campagnes publicitaires utilisent-elles des formats vidéo ou immersifs ?',
        ],
        neuro: 'Le visiteur arrive-t-il avec des attentes fortes et une représentation mentale positive du lieu ? Y a-t-il un élément de communication qui crée un effet de surprise ou d\'exclusivité ?',
        media: ['Screenshot campagnes', 'Note vocale analyse communication']
      },
    ]
  },
  {
    phase: 'Pendant la visite',
    postes: [
      {
        nom: 'Activation sur site',
        questions: [
          'Y a-t-il des QR codes ou dispositifs digitaux qui enrichissent l\'expérience sur site ?',
          'Les activations digitales sont-elles intuitives et engageantes pour tous les publics ?',
          'Y a-t-il un parcours augmenté (AR, gamification, interactivité) proposé aux visiteurs ?',
          'Les dispositifs d\'activation sont-ils bien signalés et accessibles ?',
        ],
        neuro: 'Les activations digitales créent-elles de la surprise et de l\'engagement émotionnel ? Y a-t-il un moment "waouh" lié à un dispositif technologique ou interactif ?',
        media: ['Vidéo activation terrain', 'Photo dispositifs digitaux']
      },
      {
        nom: 'Captation terrain',
        questions: [
          'Y a-t-il des spots photo/vidéo identifiés et scénarisés pour encourager le partage sur les réseaux ?',
          'L\'éclairage, la mise en scène et les décors favorisent-ils la captation de contenus de qualité ?',
          'Y a-t-il des éléments instagrammables ou viraux intégrés au parcours ?',
          'Les visiteurs sont-ils incités à partager leur expérience en temps réel ?',
        ],
        neuro: 'Quels sont les moments qui déclenchent spontanément le réflexe de sortir son téléphone ? Y a-t-il un élément visuel suffisamment fort pour générer du contenu UGC de qualité ?',
        media: ['Photo spots photo', 'Vidéo moments de captation', 'Drone vue générale']
      },
      {
        nom: 'Storytelling immersif',
        questions: [
          'Y a-t-il une narration cohérente et émotionnelle tout au long du parcours ?',
          'Les éléments de décor, de signalétique et de mise en scène racontent-ils une histoire ?',
          'Y a-t-il des moments de surprise, de rupture ou d\'intensité émotionnelle dans le parcours ?',
          'L\'identité visuelle du site est-elle forte, distinctive et mémorable ?',
        ],
        neuro: 'Le visiteur ressent-il une montée en émotion progressive ? Y a-t-il un pic émotionnel clairement identifiable dans le parcours — un moment qui restera gravé en mémoire ?',
        media: ['Vidéo storytelling parcours', 'Note vocale analyse narrative']
      },
    ]
  },
  {
    phase: 'Après la visite',
    postes: [
      {
        nom: 'Continuité digitale',
        questions: [
          'Y a-t-il un dispositif de collecte de contacts (email, réseaux) au moment du départ ?',
          'Un email post-visite est-il envoyé avec du contenu personnalisé et mémorable ?',
          'Le site encourage-t-il les visiteurs à partager leurs photos et vidéos sur les réseaux ?',
          'Y a-t-il une stratégie de remarketing ou de suivi post-visite ?',
        ],
        neuro: 'Le visiteur repart-il avec l\'envie de partager son expérience ? Y a-t-il un élément déclencheur qui prolonge l\'émotion après la visite et maintient le lien avec le lieu ?',
        media: ['Screenshot email post-visite', 'Note vocale bilan digital']
      },
      {
        nom: 'Contenus & exploitation',
        questions: [
          'Le site exploite-t-il les contenus UGC générés par les visiteurs ?',
          'Y a-t-il une production régulière de vidéos (IA, drone, interviews visiteurs) valorisant le site ?',
          'Les contenus produits sont-ils déclinés sur tous les canaux (web, social, email, ads) ?',
          'Y a-t-il un ROI mesurable des actions de contenu (reach, engagement, conversion) ?',
        ],
        neuro: 'Les contenus produits donnent-ils envie à quelqu\'un qui ne connaît pas le site de venir ? Y a-t-il un format ou un contenu qui crée suffisamment d\'émotion pour être spontanément partagé ?',
        media: ['Screenshot contenus produits', 'Note vocale analyse ROI contenu']
      },
      {
        nom: 'Neuromarketing & impact',
        questions: [
          'Y a-t-il des éléments visuels ou sonores qui déclenchent des émotions fortes et identifiables ?',
          'La palette de couleurs, les typographies et les visuels sont-ils cohérents avec l\'émotion cible ?',
          'Y a-t-il des mécanismes de rareté, d\'urgence ou d\'exclusivité intégrés dans la communication ?',
          'Les messages clés sont-ils formulés pour activer des biais cognitifs positifs (appartenance, statut, nostalgie) ?',
        ],
        neuro: 'Quels sont les 3 éléments qui créent le plus fort impact émotionnel sur le visiteur ? Comment ces stimuli peuvent-ils être croisés avec les données biométriques EDA/HRV pour cartographier l\'émotion réelle ?',
        media: ['Note vocale analyse neuromarketing', 'Photo éléments déclencheurs']
      },
    ]
  }
]

const allPostesNeuromedia = protocoleNeuromedia.flatMap(p =>
  p.postes.map(poste => ({ ...poste, phase: p.phase }))
)

type TypeDiagnostic = 'cognitif' | 'connecte'
type TypeMission = 'neuroaccess' | 'neurotaste' | 'neuromedia'
type Etape = 'choix-diagnostic' | 'choix-mission' | 'selection' | 'intro' | 'terrain' | 'generation' | 'fin'

const REPONSE_SCORES: Record<string, number> = { oui: 10, partiel: 5, non: 0 }

function calculerScorePoste(reponses: Record<string, string>): number {
  const vals = Object.values(reponses)
  if (vals.length === 0) return 5
  const total = vals.reduce((sum, r) => sum + (REPONSE_SCORES[r] ?? 5), 0)
  return Math.round(total / vals.length)
}

function sanitize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').substring(0, 50)
}

// ── Détection du type de média à partir du fichier ou de l'extension ──
function detectMediaType(file: File): 'photo' | 'video' | 'audio' | 'doc' {
  if (file.type.startsWith('image/')) return 'photo'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'doc'
}

// ── Icône selon le type de média ──
function MediaIcon({ type, size = 24 }: { type: string; size?: number }) {
  const s = size
  if (type === 'audio') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(255,149,0,0.8)" strokeWidth="1.5"/>
      <path d="M9 8v8M12 6v12M15 9v6" stroke="rgba(255,149,0,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'video') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="14" height="12" rx="2" stroke="rgba(55,138,221,0.9)" strokeWidth="1.5"/>
      <path d="M16 10l6-3v10l-6-3V10z" stroke="rgba(55,138,221,0.9)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
  if (type === 'drone') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="rgba(139,92,246,0.9)" strokeWidth="1.5"/>
      <path d="M5 5l3 3M19 5l-3 3M5 19l3-3M19 19l-3-3" stroke="rgba(139,92,246,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="4" cy="4" r="2" stroke="rgba(139,92,246,0.9)" strokeWidth="1.2"/>
      <circle cx="20" cy="4" r="2" stroke="rgba(139,92,246,0.9)" strokeWidth="1.2"/>
      <circle cx="4" cy="20" r="2" stroke="rgba(139,92,246,0.9)" strokeWidth="1.2"/>
      <circle cx="20" cy="20" r="2" stroke="rgba(139,92,246,0.9)" strokeWidth="1.2"/>
    </svg>
  )
  if (type === 'doc') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="rgba(52,199,89,0.9)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="rgba(52,199,89,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
  // photo
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="rgba(55,138,221,0.9)" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" stroke="rgba(55,138,221,0.9)" strokeWidth="1.5"/>
      <circle cx="17" cy="8" r="1" fill="rgba(55,138,221,0.9)"/>
    </svg>
  )
}

// ── Vignette média — gère photo/vidéo/audio/doc/drone ──
function MediaThumb({ media, size = 70 }: { media: any; size?: number }) {
  const borderColor = media.type === 'drone' ? 'rgba(139,92,246,0.4)'
    : media.type === 'audio' ? 'rgba(255,149,0,0.4)'
    : media.type === 'doc' ? 'rgba(52,199,89,0.4)'
    : 'rgba(55,138,221,0.3)'

  const bgColor = media.type === 'drone' ? 'rgba(139,92,246,0.08)'
    : media.type === 'audio' ? 'rgba(255,149,0,0.08)'
    : media.type === 'doc' ? 'rgba(52,199,89,0.08)'
    : 'rgba(55,138,221,0.08)'

  const style: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${borderColor}`,
    flexShrink: 0,
    position: 'relative',
  }

  if (media.type === 'photo' || media.type === 'drone' && media.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return (
      <div style={style}>
        <img src={media.url} alt={media.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {media.type === 'drone' && (
          <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px 4px' }}>
            <MediaIcon type="drone" size={10} />
          </div>
        )}
      </div>
    )
  }

  if (media.type === 'video' || (media.type === 'drone' && media.url?.match(/\.(mp4|mov|avi|webm)/i))) {
    return (
      <div style={{ ...style, background: '#000' }}>
        <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="#000">
              <path d="M3 2l6 3-6 3V2z"/>
            </svg>
          </div>
        </div>
        {media.type === 'drone' && (
          <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px 4px' }}>
            <MediaIcon type="drone" size={10} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ ...style, background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
      <MediaIcon type={media.type} size={28} />
      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '0 4px', lineHeight: 1.2, wordBreak: 'break-all' }}>
        {media.nom?.substring(0, 12) || media.type}
      </span>
    </div>
  )
}

// ── Lecteur média plein écran (lightbox simple) ──
function MediaLightbox({ media, onClose }: { media: any; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{media.type} · {media.poste}</p>
      {(media.type === 'photo') && (
        <img src={media.url} alt={media.nom} onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px', objectFit: 'contain' }} />
      )}
      {(media.type === 'video' || media.type === 'drone') && (
        <video src={media.url} controls autoPlay onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px' }} />
      )}
      {media.type === 'audio' && (
        <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <MediaIcon type="audio" size={48} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '12px 0' }}>{media.nom}</p>
          <audio controls src={media.url} style={{ width: '280px' }} />
        </div>
      )}
      {media.type === 'doc' && (
        <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <MediaIcon type="doc" size={48} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '16px 0 20px' }}>{media.nom}</p>
          <a href={media.url} target="_blank" rel="noopener noreferrer"
            style={{ background: 'rgba(52,199,89,0.2)', border: '1px solid rgba(52,199,89,0.4)', borderRadius: '8px', padding: '10px 20px', color: 'rgba(52,199,89,0.9)', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
            Ouvrir le document ↗
          </a>
        </div>
      )}
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '16px' }}>Appuyer en dehors pour fermer</p>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#0d1520', fontFamily: 'Arial, sans-serif' } as React.CSSProperties,
  center: { minHeight: '100vh', background: '#0d1520', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Arial, sans-serif' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', marginBottom: '20px' },
  title: { color: '#c8f135', fontSize: '22px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' as const },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center' as const, margin: '0 0 32px', lineHeight: 1.6, maxWidth: '320px' },
  btn: { background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%', maxWidth: '360px' },
  btnGhost: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' },
  select: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' as const },
  label: { color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 8px' },
  card: { background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' },
}

const Avatar = () => (
  <div style={S.avatar}>
    <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
)

export default function Terrain() {
  const [etape, setEtape] = useState<Etape>('choix-diagnostic')
  const [typeDiagnostic, setTypeDiagnostic] = useState<TypeDiagnostic | null>(null)
  const [typeMission, setTypeMission] = useState<TypeMission | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [missions, setMissions] = useState<any[]>([])
  const [posteIndex, setPosteIndex] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteActuelle, setNoteActuelle] = useState('')
  const [reponsesParPoste, setReponsesParPoste] = useState<Record<string, Record<string, string>>>({})
  const [reponsesActuelles, setReponsesActuelles] = useState<Record<string, string>>({})
  const [reponsesNeuroParPoste, setReponsesNeuroParPoste] = useState<Record<string, string>>({})
  const [reponseNeuroActuelle, setReponseNeuroActuelle] = useState('')
  const [rapport, setRapport] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const [uploadingPoste, setUploadingPoste] = useState(false)
  const [uploadingDrone, setUploadingDrone] = useState(false)
  const [mediasParPoste, setMediasParPoste] = useState<Record<string, any[]>>({})
  const [lightboxMedia, setLightboxMedia] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const droneInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [enregistrement, setEnregistrement] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const allPostes = typeMission === 'neurotaste' ? allPostesNeurotaste : typeMission === 'neuromedia' ? allPostesNeuromedia : allPostesNeuroaccess
  const total = allPostes.length
  const poste = allPostes[posteIndex]
  const progression = Math.round((posteIndex / total) * 100)
  const selectedClient = clients.find(c => c.id === selectedClientId)

  // Tous les médias de la session (toutes postes confondus)
  const tousLesMedias = Object.values(mediasParPoste).flat()
  const totalMedias = tousLesMedias.length

  useEffect(() => {
    supabase.from('clients').select('id, nom').eq('statut', 'actif').then(({ data }) => {
      if (data) setClients(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    supabase.from('missions').select('id, type, date_mission').eq('client_id', selectedClientId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMissions(data)
    })
  }, [selectedClientId])

  function setReponse(questionIndex: number, valeur: string) {
    setReponsesActuelles(prev => ({ ...prev, [questionIndex]: valeur }))
  }

  // ── Upload générique (photo/vidéo/audio/doc) ──
  async function uploadFiles(files: FileList, isDrone: boolean) {
    if (!files || !selectedClientId) return
    isDrone ? setUploadingDrone(true) : setUploadingPoste(true)
    const newMedias: any[] = []

    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const prefix = isDrone ? 'drone' : 'media'
        const path = `${selectedClientId}/${Date.now()}_${prefix}_${sanitize(poste.nom)}_${sanitize(file.name.replace(/\.[^.]+$/, ''))}.${ext}`
        const mediaType = isDrone ? 'drone' : detectMediaType(file)

        const { error: uploadError } = await supabase.storage.from('medias').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) continue

        const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
        const { data: mediaData } = await supabase.from('medias').insert({
          client_id: selectedClientId,
          mission_id: selectedMissionId || null,
          type: mediaType,
          url: urlData.publicUrl,
          nom: file.name,
          poste: poste.nom
        }).select().single()

        if (mediaData) newMedias.push(mediaData)
      } catch {}
    }

    setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), ...newMedias] }))
    isDrone ? setUploadingDrone(false) : setUploadingPoste(false)
    if (isDrone) { if (droneInputRef.current) droneInputRef.current.value = '' }
    else { if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  async function handleUploadPoste(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await uploadFiles(e.target.files, false)
  }

  async function handleUploadDrone(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await uploadFiles(e.target.files, true)
  }

  const toggleEnregistrement = async () => {
    if (enregistrement) { mediaRecorderRef.current?.stop(); setEnregistrement(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: mimeType })
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `vocal_${Date.now()}.${ext}`, { type: mimeType })
        setUploadingAudio(true)
        const path = `${selectedClientId}/${sanitize(poste.nom)}_vocal_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('medias').upload(path, file, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('medias').getPublicUrl(path)
          const { data: mediaData } = await supabase.from('medias').insert({
            client_id: selectedClientId,
            mission_id: selectedMissionId || null,
            poste: poste.nom,
            type: 'audio',
            url: urlData.publicUrl,
            nom: file.name
          }).select().single()
          if (mediaData) setMediasParPoste(prev => ({ ...prev, [poste.nom]: [...(prev[poste.nom] || []), mediaData] }))
        }
        setUploadingAudio(false)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setEnregistrement(true)
    } catch { setErreur('Micro non accessible') }
  }

  function sauvegarderEtContinuer() {
    const nouvellesNotes = { ...notes }
    if (noteActuelle.trim()) { nouvellesNotes[poste.nom] = noteActuelle; setNotes(nouvellesNotes) }
    const nouvellesReponses = { ...reponsesParPoste, [poste.nom]: reponsesActuelles }
    setReponsesParPoste(nouvellesReponses)
    const nouvellesReponsesNeuro = { ...reponsesNeuroParPoste }
    if (reponseNeuroActuelle.trim()) nouvellesReponsesNeuro[poste.nom] = reponseNeuroActuelle
    setReponsesNeuroParPoste(nouvellesReponsesNeuro)
    setNoteActuelle('')
    setReponsesActuelles({})
    setReponseNeuroActuelle('')
    if (posteIndex < total - 1) {
      const next = allPostes[posteIndex + 1]
      setReponsesActuelles(nouvellesReponses[next.nom] || {})
      setNoteActuelle(nouvellesNotes[next.nom] || '')
      setReponseNeuroActuelle(nouvellesReponsesNeuro[next.nom] || '')
      setPosteIndex(posteIndex + 1)
    } else {
      genererRapport(nouvellesNotes, nouvellesReponses, nouvellesReponsesNeuro)
    }
  }

  function precedent() {
    if (posteIndex > 0) {
      const prev = allPostes[posteIndex - 1]
      setReponsesActuelles(reponsesParPoste[prev.nom] || {})
      setNoteActuelle(notes[prev.nom] || '')
      setReponseNeuroActuelle(reponsesNeuroParPoste[prev.nom] || '')
      setPosteIndex(posteIndex - 1)
    }
  }

  async function genererRapport(notesFinales: Record<string, string>, reponsesFinales: Record<string, Record<string, string>>, reponsesNeuroFinales: Record<string, string> = {}) {
    setEtape('generation')
    setErreur('')
    const scoresCalcules: Record<string, number> = {}
    for (const p of allPostes) { scoresCalcules[p.nom] = calculerScorePoste(reponsesFinales[p.nom] || {}) }
    const notesAvecScores: Record<string, string> = {}
    for (const p of allPostes) {
      const reponses = reponsesFinales[p.nom] || {}
      const lignes = p.questions.map((q, i) => `- ${q} → ${reponses[i] || 'non évalué'}`).join('\n')
      const note = notesFinales[p.nom] || ''
      const scoreOn10 = (scoresCalcules[p.nom] / 10).toFixed(1)
      notesAvecScores[p.nom] = `Score calculé: ${scoreOn10}/10\n${lignes}${note ? '\nObservations: ' + note : ''}`
    }

    let finalMissionId = selectedMissionId
    if (!finalMissionId && selectedClientId) {
      const missionType = (typeMission || 'neuroaccess') + '-' + (typeDiagnostic || 'cognitif')
      const { data: newMission } = await supabase.from('missions').insert({
        client_id: selectedClientId,
        type: missionType,
        date_mission: new Date().toISOString().split('T')[0],
        statut: 'publie'
      }).select().single()
      if (newMission) finalMissionId = newMission.id
    }

    try {
      const res = await fetch('/api/generer-rapport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesAvecScores,
          scores_calcules: scoresCalcules,
          reponses_neuro: reponsesNeuroFinales,
          client_nom: selectedClient?.nom || 'Diagnostic terrain',
          client_id: selectedClientId || null,
          mission_id: finalMissionId || null,
          type_mission: typeMission,
          type_diagnostic: typeDiagnostic
        })
      })
      const data = await res.json()
      if (data.success) { setRapport(data.rapport); setEtape('fin') }
      else { setErreur(data.error || 'Erreur'); setEtape('fin') }
    } catch (e: any) { setErreur(e.message); setEtape('fin') }
  }

  function resetAll() {
    setEtape('choix-diagnostic')
    setTypeDiagnostic(null); setTypeMission(null)
    setPosteIndex(0); setNotes({}); setNoteActuelle(''); setRapport(null)
    setSelectedClientId(''); setSelectedMissionId(''); setMediasParPoste({})
    setReponsesParPoste({}); setReponsesActuelles({})
    setReponsesNeuroParPoste({}); setReponseNeuroActuelle('')
  }

  const scoreColor = (s: number) => s >= 7 ? '#c8f135' : s >= 5 ? '#EF9F27' : '#E24B4A'
  const mediasPosteActuel = mediasParPoste[poste?.nom] || []

  // ════════════════════════════════════════
  // ÉTAPE 1 — CHOIX DIAGNOSTIC
  // ════════════════════════════════════════
  if (etape === 'choix-diagnostic') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Type de diagnostic</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>Choisis le type de diagnostic à réaliser</p>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setTypeDiagnostic('cognitif'); setEtape('choix-mission') }}
          style={{ background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5C7 5 3 9 3 12s4 7 9 7 9-4 9-7-4-7-9-7z" stroke="#c8f135" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="#c8f135" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="1" fill="#c8f135"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#c8f135', fontSize: '15px', fontWeight: '700', margin: 0 }}>Diagnostic Cognitif</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>IA uniquement · Sans appareil</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Analyse comportementale terrain guidée par BEN&#x2122;. Génération automatique du rapport via IA.
          </p>
        </button>
        <button disabled style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'not-allowed', opacity: 0.5, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.06em' }}>BIENTÔT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h3l2-5 3 10 2-7 2 4 2-2h4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '700', margin: 0 }}>Diagnostic Connecté</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>EDA / HRV · Données biométriques</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>Croise les observations terrain avec les données physiologiques en temps réel.</p>
        </button>
      </div>
      <button onClick={() => window.location.href = '/dashboard'} style={{ ...S.btnGhost, maxWidth: '360px', width: '100%' }}>
        ← Dashboard
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 2 — CHOIX MISSION
  // ════════════════════════════════════════
  if (etape === 'choix-mission') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Quelle mission ?</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>Diagnostic Cognitif · choisis ton offre</p>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setTypeMission('neuroaccess'); setEtape('selection') }}
          style={{ background: 'rgba(200,241,53,0.05)', border: '1px solid rgba(200,241,53,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="3" stroke="#c8f135" strokeWidth="1.5"/>
                <path d="M12 3C8.13 3 5 6.13 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z" stroke="#c8f135" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#c8f135', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neuroaccess</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{allPostesNeuroaccess.length} postes · Parcours visiteur</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Analyse complète du parcours visiteur — avant, pendant et après la visite.
          </p>
        </button>
        <button onClick={() => { setTypeMission('neurotaste'); setEtape('selection') }}
          style={{ background: 'rgba(239,159,39,0.05)', border: '1px solid rgba(239,159,39,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,159,39,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/neurotaste.svg" width="36" height="36" alt="Neurotaste" />
            </div>
            <div>
              <p style={{ color: '#EF9F27', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neurotaste</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{allPostesNeurotaste.length} postes · Expérience F&B</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Diagnostic complet de l'offre de restauration — lisibilité, fluidité, qualité produit et performance.
          </p>
        </button>
        <button onClick={() => { setTypeMission('neuromedia'); setEtape('selection') }}
          style={{ background: 'rgba(124,131,253,0.05)', border: '1px solid rgba(124,131,253,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124,131,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/neuromedia.svg" width="36" height="36" alt="Neuromedia" />
            </div>
            <div>
              <p style={{ color: '#7C83FD', fontSize: '15px', fontWeight: '700', margin: 0 }}>Neuromedia</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{allPostesNeuromedia.length} postes · Activation & contenus</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Rend l'expérience visible, vivante et mémorable. Activation digitale, storytelling et neuromarketing.
          </p>
        </button>
      </div>
      <button onClick={() => setEtape('choix-diagnostic')} style={{ ...S.btnGhost, maxWidth: '360px', width: '100%' }}>
        ← Retour
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 3 — SÉLECTION CLIENT
  // ════════════════════════════════════════
  if (etape === 'selection') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Pour quel client ?</h1>
      <p style={{ ...S.sub, marginBottom: '28px' }}>
        Mission <strong style={{ color: '#c8f135' }}>{typeMission === 'neurotaste' ? 'Neurotaste' : typeMission === 'neuromedia' ? 'Neuromedia' : 'Neuroaccess'}</strong> · Diagnostic Cognitif
      </p>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <p style={S.label}>Client</p>
        <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedMissionId('') }}
          style={{ ...S.select, marginBottom: '16px', color: selectedClientId ? '#fff' : 'rgba(255,255,255,0.3)' }}>
          <option value="">— Sélectionner un client</option>
          {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#1a2540' }}>{c.nom}</option>)}
        </select>
        {selectedClientId && missions.length > 0 && (
          <>
            <p style={S.label}>Mission</p>
            <select value={selectedMissionId} onChange={e => setSelectedMissionId(e.target.value)}
              style={{ ...S.select, marginBottom: '16px', color: selectedMissionId ? '#fff' : 'rgba(255,255,255,0.3)' }}>
              <option value="">— Sans mission spécifique</option>
              {missions.map(m => <option key={m.id} value={m.id} style={{ background: '#1a2540' }}>{m.type} · {m.date_mission}</option>)}
            </select>
          </>
        )}
        <button onClick={() => selectedClientId && setEtape('intro')} disabled={!selectedClientId}
          style={{ ...S.btn, maxWidth: '100%', background: selectedClientId ? '#c8f135' : 'rgba(255,255,255,0.1)', color: selectedClientId ? '#0d1520' : 'rgba(255,255,255,0.3)', cursor: selectedClientId ? 'pointer' : 'not-allowed', marginBottom: '12px' }}>
          Continuer →
        </button>
        <button onClick={() => setEtape('choix-mission')} style={{ ...S.btnGhost, width: '100%' }}>
          ← Retour
        </button>
      </div>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 4 — INTRO
  // ════════════════════════════════════════
  if (etape === 'intro') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Bonjour, je suis Ben</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 4px', textAlign: 'center' }}>
        Mission <strong style={{ color: '#c8f135' }}>{typeMission === 'neurotaste' ? 'Neurotaste' : typeMission === 'neuromedia' ? 'Neuromedia' : 'Neuroaccess'}</strong> · <strong style={{ color: '#fff' }}>{selectedClient?.nom}</strong>
      </p>
      <p style={S.sub}>
        Je vais te guider poste par poste. On a <strong style={{ color: '#fff' }}>{total} postes</strong> à couvrir. Pour chaque question, réponds par{' '}
        <strong style={{ color: '#c8f135' }}>Oui</strong>, <strong style={{ color: '#EF9F27' }}>Partiel</strong> ou <strong style={{ color: '#E24B4A' }}>Non</strong>.
      </p>
      <div style={{ width: '100%', maxWidth: '360px', marginBottom: '24px' }}>
        {(typeMission === 'neurotaste' ? protocoleNeurotaste : typeMission === 'neuromedia' ? protocoleNeuromedia : protocoleNeuroaccess).map(p => (
          <div key={p.phase} style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{p.phase}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {p.postes.map(po => (
                <span key={po.nom} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(200,241,53,0.08)', border: '0.5px solid rgba(200,241,53,0.2)', color: 'rgba(255,255,255,0.6)' }}>{po.nom}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setEtape('terrain')} style={{ ...S.btn, maxWidth: '100%' }}>
        Commencer le diagnostic →
      </button>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 5 — GÉNÉRATION
  // ════════════════════════════════════════
  if (etape === 'generation') return (
    <main style={S.center}>
      <Avatar />
      <h1 style={S.title}>Ben analyse tes observations...</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', margin: '0 0 32px' }}>Génération du rapport {typeMission === 'neurotaste' ? 'Neurotaste' : typeMission === 'neuromedia' ? 'Neuromedia' : 'Neuroaccess'} — 20 à 30 secondes</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8f135', animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.2); } }`}</style>
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE 6 — FIN (avec galerie médias)
  // ════════════════════════════════════════
  if (etape === 'fin') return (
    <main style={{ ...S.page, padding: '24px' }}>
      {lightboxMedia && <MediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #c8f135', marginBottom: '16px' }}>
          <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ color: '#c8f135', fontSize: '20px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
          {rapport ? `Rapport ${typeMission === 'neurotaste' ? 'Neurotaste' : typeMission === 'neuromedia' ? 'Neuromedia' : 'Neuroaccess'} généré !` : 'Diagnostic terminé'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
          {rapport ? `Ben a analysé le parcours visiteur de ${selectedClient?.nom}` : erreur}
        </p>
      </div>

      {rapport && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Score global */}
          <div style={{ ...S.card, textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '48px', fontWeight: '700', color: '#c8f135', margin: '0 0 4px', lineHeight: 1 }}>{rapport.executive_summary?.score_global}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score global / 10</p>
          </div>

          {/* Frictions / Opportunités */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={S.card}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Frictions</p>
              {(rapport.executive_summary?.frictions || []).map((f: string, i: number) => (
                <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #E24B4A', lineHeight: 1.4 }}>{f}</p>
              ))}
            </div>
            <div style={S.card}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Opportunités</p>
              {(rapport.executive_summary?.opportunites || []).map((o: string, i: number) => (
                <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 6px', paddingLeft: '8px', borderLeft: '2px solid #c8f135', lineHeight: 1.4 }}>{o}</p>
              ))}
            </div>
          </div>

          {/* Score par poste */}
          <div style={{ ...S.card, marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Score Neuroaccess</p>
            {Object.entries(rapport.score_neuroaccess || rapport.score_neuroplay || {}).map(([key, val]: any) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize', minWidth: '160px' }}>{key.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <div style={{ width: `${val * 10}%`, height: '4px', background: scoreColor(val), borderRadius: '2px' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: scoreColor(val), minWidth: '24px' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* ── SECTION MÉDIAS ── */}
          {totalMedias > 0 && (
            <div style={{ ...S.card, marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Médias captés
                </p>
                <span style={{ fontSize: '11px', background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.3)', borderRadius: '10px', padding: '2px 8px', color: 'rgba(55,138,221,0.9)' }}>
                  {totalMedias} fichier{totalMedias > 1 ? 's' : ''}
                </span>
              </div>

              {/* Récap par type */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {(['photo', 'video', 'audio', 'drone', 'doc'] as const).map(type => {
                  const count = tousLesMedias.filter(m => m.type === type).length
                  if (count === 0) return null
                  const colors: Record<string, string> = {
                    photo: 'rgba(55,138,221,0.2)',
                    video: 'rgba(55,138,221,0.2)',
                    audio: 'rgba(255,149,0,0.2)',
                    drone: 'rgba(139,92,246,0.2)',
                    doc: 'rgba(52,199,89,0.2)',
                  }
                  const borders: Record<string, string> = {
                    photo: 'rgba(55,138,221,0.4)',
                    video: 'rgba(55,138,221,0.4)',
                    audio: 'rgba(255,149,0,0.4)',
                    drone: 'rgba(139,92,246,0.4)',
                    doc: 'rgba(52,199,89,0.4)',
                  }
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: colors[type], border: `1px solid ${borders[type]}`, borderRadius: '8px', padding: '4px 8px' }}>
                      <MediaIcon type={type} size={12} />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{count} {type}</span>
                    </div>
                  )
                })}
              </div>

              {/* Médias groupés par poste */}
              {allPostes.filter(p => (mediasParPoste[p.nom] || []).length > 0).map(p => {
                const medias = mediasParPoste[p.nom] || []
                return (
                  <div key={p.nom} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{p.nom}</span>
                      <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{medias.length}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {medias.map(m => (
                        <div key={m.id} onClick={() => setLightboxMedia(m)} style={{ cursor: 'pointer' }}>
                          <MediaThumb media={m} size={70} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={resetAll} style={{ flex: 1, ...S.btnGhost }}>Nouveau diagnostic</button>
            <button onClick={() => window.location.href = '/dashboard'} style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Dashboard →</button>
          </div>
        </div>
      )}
    </main>
  )

  // ════════════════════════════════════════
  // ÉTAPE TERRAIN
  // ════════════════════════════════════════
  return (
    <main style={S.page}>
      {lightboxMedia && <MediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />}

      <div style={{ background: '#111d30', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #c8f135', flexShrink: 0 }}>
          <img src="/ben.jpg" alt="Ben" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#c8f135', fontSize: '13px', fontWeight: '700', margin: 0 }}>Ben · {typeMission === 'neurotaste' ? 'Neurotaste' : typeMission === 'neuromedia' ? 'Neuromedia' : 'Neuroaccess'} · {selectedClient?.nom}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{poste.phase}</p>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{posteIndex + 1}/{total}</span>
        <button onClick={() => { if (window.confirm('Quitter ? Tes notes seront perdues.')) window.location.href = '/dashboard' }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
      </div>

      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '3px', width: `${progression}%`, background: '#c8f135', transition: 'width 0.3s' }} />
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Poste {posteIndex + 1}</p>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>{poste.nom}</h2>
        </div>

        {/* Questions */}
        <div style={{ ...S.card, marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Observer & évaluer</p>
          {poste.questions.map((q, i) => {
            const rep = reponsesActuelles[i]
            return (
              <div key={i} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: i < poste.questions.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 10px', lineHeight: 1.6 }}>{q}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['oui', 'partiel', 'non'] as const).map(val => {
                    const colors = {
                      oui:     { bg: rep === 'oui'     ? 'rgba(200,241,53,0.2)'  : 'transparent', border: rep === 'oui'     ? '#c8f135' : 'rgba(255,255,255,0.12)', text: rep === 'oui'     ? '#c8f135' : 'rgba(255,255,255,0.4)' },
                      partiel: { bg: rep === 'partiel' ? 'rgba(239,159,39,0.2)'  : 'transparent', border: rep === 'partiel' ? '#EF9F27' : 'rgba(255,255,255,0.12)', text: rep === 'partiel' ? '#EF9F27' : 'rgba(255,255,255,0.4)' },
                      non:     { bg: rep === 'non'     ? 'rgba(226,75,74,0.2)'   : 'transparent', border: rep === 'non'     ? '#E24B4A' : 'rgba(255,255,255,0.12)', text: rep === 'non'     ? '#E24B4A' : 'rgba(255,255,255,0.4)' },
                    }
                    const c = colors[val]
                    return (
                      <button key={val} onClick={() => setReponse(i, val)}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                        {val === 'oui' ? '✓ Oui' : val === 'partiel' ? '~ Partiel' : '✗ Non'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {Object.keys(reponsesActuelles).length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score poste</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: scoreColor(calculerScorePoste(reponsesActuelles)) }}>{calculerScorePoste(reponsesActuelles)}/10</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>({Object.keys(reponsesActuelles).length}/{poste.questions.length} réponses)</span>
            </div>
          )}
        </div>

        {/* Question neuro */}
        <div style={{ background: 'rgba(200,241,53,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(200,241,53,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#c8f135', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Question neuro</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.6 }}>{poste.neuro}</p>
          <textarea
            value={reponseNeuroActuelle}
            onChange={e => setReponseNeuroActuelle(e.target.value)}
            placeholder="Ta réponse / observation..."
            rows={2}
            style={{ width: '100%', background: 'rgba(200,241,53,0.05)', border: '0.5px solid rgba(200,241,53,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', resize: 'none', fontFamily: 'Arial', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
        </div>

        {/* Zone médias */}
        <div style={{ background: 'rgba(55,138,221,0.05)', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '0.5px solid rgba(55,138,221,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mediasPosteActuel.length > 0 ? '12px' : '0' }}>
            <p style={{ fontSize: '11px', color: 'rgba(55,138,221,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Médias {mediasPosteActuel.length > 0 && (
                <span style={{ marginLeft: '8px', background: 'rgba(55,138,221,0.2)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px' }}>{mediasPosteActuel.length}</span>
              )}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* Input fichier — TOUS types */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                multiple
                onChange={handleUploadPoste}
                style={{ display: 'none' }}
              />
              {/* Input drone — vidéo + photo */}
              <input
                ref={droneInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleUploadDrone}
                style={{ display: 'none' }}
              />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPoste}
                style={{ background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.3)', borderRadius: '8px', color: 'rgba(55,138,221,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingPoste ? 'wait' : 'pointer', opacity: uploadingPoste ? 0.6 : 1 }}>
                {uploadingPoste ? 'Upload...' : '+ Fichier'}
              </button>
              <button onClick={toggleEnregistrement} disabled={uploadingAudio}
                style={{ background: enregistrement ? 'rgba(255,59,48,0.2)' : 'rgba(255,149,0,0.15)', border: enregistrement ? '1px solid rgba(255,59,48,0.5)' : '1px solid rgba(255,149,0,0.3)', borderRadius: '8px', color: enregistrement ? 'rgb(255,59,48)' : 'rgba(255,149,0,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: 'pointer' }}>
                {uploadingAudio ? 'Envoi...' : enregistrement ? '⏹ Stop' : '🎙 Vocal'}
              </button>
              <button onClick={() => droneInputRef.current?.click()} disabled={uploadingDrone}
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'rgba(139,92,246,0.9)', fontSize: '12px', fontWeight: '600', padding: '5px 10px', cursor: uploadingDrone ? 'wait' : 'pointer', opacity: uploadingDrone ? 0.6 : 1 }}>
                {uploadingDrone ? 'Upload...' : '🚁 Drone'}
              </button>
            </div>
          </div>

          {/* Galerie poste actuel */}
          {mediasPosteActuel.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {mediasPosteActuel.map(m => (
                <div key={m.id} onClick={() => setLightboxMedia(m)} style={{ cursor: 'pointer' }}>
                  <MediaThumb media={m} size={70} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Observations complémentaires</p>
          <textarea value={noteActuelle} onChange={e => setNoteActuelle(e.target.value)} placeholder="Note tes observations ici..." rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'none', fontFamily: 'Arial', boxSizing: 'border-box', lineHeight: 1.6 }} />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {posteIndex > 0 && (
            <button onClick={precedent} style={{ flex: 1, ...S.btnGhost }}>&#x2190; Précédent</button>
          )}
          <button onClick={sauvegarderEtContinuer} style={{ flex: 2, background: '#c8f135', color: '#0d1520', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            {posteIndex < total - 1 ? 'Suivant →' : 'Générer le rapport ✓'}
          </button>
        </div>
      </div>
    </main>
  )
}
