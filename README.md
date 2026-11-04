# Mazigh Auto — Showroom Kecherid Auto

Site vitrine + espace d'administration pour le showroom Mazigh Auto (El Khroub, Constantine).
Next.js 16 (App Router, Cache Components) · Supabase (auth, base de données, stockage photos) · Tailwind CSS v4.

## Démarrer

```bash
npm install
npm run dev
```

Variables d'environnement requises (`.env.local`) :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://mazighauto.dz
```

## Structure

```
app/
  (site)/            Site public — partage un en-tête, un pied de page et le défilement fluide
    page.tsx           Accueil (hero animé, véhicules vedettes, reprise, contact)
    voitures/          Catalogue + fiche véhicule
    vendre-echanger/   Formulaire de reprise → WhatsApp
    contact/
  admin/             Espace propriétaire (styles isolés dans admin.css)
    (dashboard)/       Pages protégées : véhicules, ajout/modification, finances
    login/, access-denied/
    AdminShell.tsx     Barre latérale (desktop) + tiroir (mobile)
    ui.tsx             AdminPageHeader, AdminDialog
  components/
    site/              SiteHeader, SiteFooter, VehicleCard, SmoothScroll, HeroStreaks
  globals.css        Design tokens + styles du site public
supabase/migrations/ Schéma de la base
```

## Animations

- **Lenis** (`app/components/site/SmoothScroll.tsx`) : défilement fluide sur le site public uniquement
  (jamais dans `/admin`), désactivé si l'utilisateur a activé « réduire les animations ».
- **Apparition au défilement** : ajouter `data-reveal` (et éventuellement `data-reveal-delay="1..4"`) à un élément.
- **HeroStreaks** : traînées de phares en canvas derrière le hero, sans dépendance. Mis en pause hors écran
  et dans les onglets inactifs.
