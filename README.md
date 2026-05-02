# StormRelief

> No claims. No waiting. Just relief.

A consumer portal demonstrating parametric tornado insurance. The instant a
qualifying tornado passes within range of your home, money lands in your
wallet — and an empathetic email checks in on you.

Mobile-first, hosted on Vercel. Real Mapbox map. Real NOAA tornado history.
Real Resend email.

---

## What's inside

- **Onboarding** — email (no password) → address (Mapbox geocoder, map flies
  to it) → plan tier ($5K / $15K / $25K payout limits)
- **Live map** — full-bleed Mapbox 3D, pulsing home indicator, **NEXRAD live
  weather radar overlay** (NOAA via Iowa State Mesonet)
- **Tornado simulation** — taps the included historical NOAA dataset (47
  real EF2+ tornadoes from 2011–2024), picks the one closest to your home,
  animates its real path, computes payout from real distance
- **Trigger ladder** — proximity-based, exactly as the pitch deck specifies:
  - `< 0.10 mi` → 100% of plan limit
  - `< 0.25 mi` → 50%
  - `< 0.50 mi` → 10%
  - else `$0` (you're safe)
- **Wallet count-up + outcome modal**, then a Resend-rendered email

---

## Quick start

```bash
npm install
cp .env.example .env.local
# edit .env.local to fill in NEXT_PUBLIC_MAPBOX_TOKEN
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required: Mapbox token

The map and address autocomplete won't work without one.

1. Sign up free at [account.mapbox.com](https://account.mapbox.com)
2. Copy your **public default token** (`pk.…`)
3. Paste into `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`

Free tier covers 50,000 map loads / 100,000 geocodes per month.

### Optional: Resend (real email)

Without `RESEND_API_KEY`, payout emails are logged to the dev server console
(useful for demos). To send real email:

1. Sign up at [resend.com](https://resend.com), grab an API key
2. Set `RESEND_API_KEY=re_...` in `.env.local`
3. The free `onboarding@resend.dev` sender works in sandbox mode (verified
   recipients only). Verify your own domain to send to anyone.

---

## How the simulation works

```
[ tap Simulate ]
        │
        ▼
POST /api/simulate ─── reads session → loads data/tornadoes.json
        │              filters EF2+ within 250 mi → picks closest
        │              computes Turf.js distance + payout from ladder
        ▼
client receives SimulationResult
        │
        ├─ map.fitBounds(home + path)        700ms
        ├─ tornado-path layer drawn          ┐
        ├─ vortex marker travels along it    │ 1700ms (synced)
        ├─ at nearest-point: shake + flash + │
        │   haptic + applyCredit (count-up)  ┘
        ├─ map.flyTo(home)                   1100ms
        └─ POST /api/payout (commits + email)
                │
                ▼
        outcome modal slides up
```

All distance + payout math is in [`lib/payout.ts`](./lib/payout.ts) and
[`lib/tornadoes.ts`](./lib/tornadoes.ts).

The historical events live in [`data/tornadoes.json`](./data/tornadoes.json)
— 47 real EF2+ tornadoes from 2011–2024. To add more, append entries with
the same shape; everything else cascades automatically.

---

## Deploying to Vercel

```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
npx vercel env add RESEND_API_KEY            # optional
npx vercel env add SESSION_SECRET            # required: 32+ random chars
npx vercel deploy --prod
```

No database, no migrations — sessions live in a signed cookie via
`iron-session`. Wallet balance and onboarding state persist for 30 days.

---

## Tech stack

- **Next.js 15** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** (CSS-first theming via `@theme` in `app/globals.css`)
- **Mapbox GL JS v3** + Mapbox Geocoding API
- **NEXRAD radar tiles** via Iowa State Mesonet (public NOAA mirror)
- **Turf.js** for spatial math (line slicing, nearest-point-on-line)
- **iron-session** for cookie-based sessions (no DB)
- **Resend** + **React Email** for the payout notification
- **Framer Motion** for choreography, **Zustand** for sim state

---

## Project structure

```
app/
  page.tsx                    onboarding step 1: email
  onboarding/address/page.tsx step 2: address + Mapbox geocode preview
  onboarding/plan/page.tsx    step 3: tier picker
  map/page.tsx                main app surface
  api/
    geocode/route.ts          Mapbox geocode passthrough
    simulate/route.ts         find tornado + compute payout (no commit)
    payout/route.ts           commit wallet + send email
  actions/onboarding.ts       server actions for the wizard

components/
  map/MapShell.tsx            orchestrates the simulation animation
  map/MapCanvas.tsx           Mapbox setup, NEXRAD overlay, sonar pulse
  map/Vortex.tsx              SVG vortex marker with rotating arms
  map/OutcomeModal.tsx        bottom-sheet result
  chrome/SimulateButton.tsx   center FAB
  chrome/WalletPill.tsx       count-up wallet
  chrome/ProfileButton.tsx    glassmorphic profile menu
  onboarding/                 EmailForm, AddressForm, PlanPicker
  StormBackdrop.tsx           animated radial gradient + canvas wisps

lib/
  payout.ts                   the trigger ladder
  tornadoes.ts                NOAA lookup + Turf distance
  geocode.ts                  Mapbox forward-geocode
  session.ts                  iron-session config
  store.ts                    Zustand store (sim state machine)
  types.ts                    Plan, SessionUser, TornadoEvent, SimulationResult

data/tornadoes.json           47 real EF2+ historical tornadoes
emails/PayoutNotification.tsx React Email template (sent on payout)
```

---

## Trigger model (from pitch deck)

| Plan      | Annual   | Payout limit |
|-----------|---------:|-------------:|
| Basic     | $240     | $5,000       |
| Plus      | $480     | $15,000      |
| Premium   | $840     | $25,000      |

Only EF2+ (120+ mph) tornadoes trigger payouts. The fraction of the plan
limit paid is purely a function of how close the path passed to the home —
not damage. Reinsurance protects against extreme years.

---

## Verification checklist

- [ ] `npm run dev`, visit `/`
- [ ] Enter any email → land on `/onboarding/address`
- [ ] Type "1600 Pennsylvania Ave NW, Washington, DC" → suggestions appear → pick one → mini-map flies there → continue
- [ ] Pick a plan → land on `/map`
- [ ] Map renders: dark style, 3D buildings, green pulsing home ring, faint NEXRAD radar
- [ ] Profile button (top-right) opens menu showing email + plan
- [ ] Wallet pill (top-left) shows $0
- [ ] Tap "Simulate Tornado":
  - camera flies to tornado bbox
  - path animates start → end
  - vortex marker travels the path
  - at impact: screen flash + camera shake + haptic
  - wallet pill counts up
  - camera flies back to home
  - outcome modal shows real tornado date / location / EF / distance
- [ ] Email logged in dev console (or sent via Resend if configured)
- [ ] Sign out → land back on `/`

For a "no payout" path, sign up with a coastal address far from tornado
alley (e.g., "1 World Trade Center, San Francisco, CA"). The closest
historical EF2+ will be far enough to fall outside the 0.5 mi trigger.

---

## Design language

- **Palette** — `storm-950` deep midnight base, `aurora` greens for safety/wallet, `amber-tornado` + `magenta-tornado` for the vortex
- **Type** — Fraunces (display serif) + Geist (sans) + Geist Mono
- **Glass** — backdrop-blur 24px, saturate 180%, white/8% bg, white/14% stroke, soft inset highlight
- **Motion** — `[0.16, 1, 0.3, 1]` ease for entries; `easeInOutCubic` for the path animation; spring damped 30 / stiffness 280 for the bottom sheet

---

Built with Claude Code.
