# UI Design Specification — SportRez

## Overview
**SportRez** is a sports facility reservation system (Polish UI). Dark mode, premium aesthetic with Inter font and a blue/violet accent palette.

---

## Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0d1117` | Page background |
| `--bg-surface` | `#161b27` | Cards, panels |
| `--bg-elevated` | `#1e2438` | Inputs, table headers |
| `--color-primary` | `#4f8ef7` | CTA buttons, links, accents |
| `--color-success` | `#34d399` | Confirmed status |
| `--color-warning` | `#fbbf24` | Pending status, admin badge |
| `--color-danger` | `#f87171` | Errors, cancelled, delete |
| `--text-primary` | `#e2e8f8` | Main body text |
| `--text-secondary` | `#8892b0` | Labels, subtitles |

### Typography
- Font: **Inter** (Google Fonts), weights 400/500/600/700/800
- Heading scale: 64px hero → 36px section → 24px card → 18px sub
- Body: 15–16px, line-height 1.6

### Spacing
4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px

### Border Radius
- `sm` 6px · `md` 10px · `lg` 16px · `xl` 24px · `pill` 9999px

---

## Component Hierarchy

```
<App>
 ├── <AuthProvider>          — global JWT / role state
 ├── <ToastProvider>         — floating notifications
 └── <BrowserRouter>
      ├── <Navbar />          — sticky glassmorphism top bar
      └── <Routes>
           ├── / → <HomePage />
           ├── /boiska → <FacilitiesPage />
           ├── /boiska/:id → <FacilityDetailPage />
           ├── /logowanie → <LoginPage />
           ├── /rejestracja → <RegisterPage />
           ├── /moj-panel → <ProtectedRoute> → <UserPanelPage />
           └── /admin → <ProtectedRoute adminOnly> → <AdminPage />
```

---

## Page Layouts

### HomePage `/`
```
┌─────────────────────────────────────┐
│ [Navbar]                            │
├─────────────────────────────────────┤
│     [Animated gradient orbs]        │
│         🏆 SportRez badge           │
│    "Zarezerwuj swoje wymarzone      │
│         boisko" H1                  │
│      [Przeglądaj] [Zarejestruj]    │
├─────────────────────────────────────┤
│  50+ obiektów │ 1000+ res. │ 24/7  │
├─────────────────────────────────────┤
│  🏟️ Przeglądaj  📅 Rezerwuj  📋 Zarządzaj │
│  [feature cards × 3]               │
├─────────────────────────────────────┤
│ [CTA banner — only for guests]     │
└─────────────────────────────────────┘
```

### FacilitiesPage `/boiska`
```
┌─────────────────────────────────────┐
│ H1: "Dostępne boiska"  [🔍 Search]  │
│ "Znaleziono N obiektów"            │
├─────────────────────────────────────┤
│ [Card] [Card] [Card]               │
│ [Card] [Card] [Card]  ← CSS grid   │
│  ↑ loading: skeleton cards         │
│  ↑ error: EmptyState + retry       │
│  ↑ empty: EmptyState               │
└─────────────────────────────────────┘
```

### FacilityDetailPage `/boiska/:id`
```
┌──────────────────┬──────────────────┐
│ 🏟️ Facility info │ 📅 Reserve form  │
│ Name             │ Start datetime   │
│ Address          │ End datetime     │
│ Description      │ Cost preview     │
│ 150 zł / godz.  │ [Submit btn]     │
└──────────────────┴──────────────────┘
```

### UserPanelPage `/moj-panel`
```
┌─────────────────────────────────────┐
│ [Avatar] email  role-badge          │
│          All: N  Pending: N  Conf:N │
├─────────────────────────────────────┤
│ TABLE: Obiekt│Adres│Od│Do│Status│Akcja │
│        ...   ...  ...          [Anuluj]│
└─────────────────────────────────────┘
```

### AdminPage `/admin`
```
┌─────────────────────────────────────┐
│ Panel Admina            👑 Admin    │
│ [🏟️ Obiekty] [📅 Rezerwacje]  tabs  │
├─────────────────────────────────────┤
│ FACILITIES TAB:                     │
│ TABLE: Nazwa│Adres│Cena│Status│Edit│Del│
│                          [+ Dodaj] │
│ → Edit/Create opens <Modal>        │
├─────────────────────────────────────┤
│ RESERVATIONS TAB:                   │
│ TABLE: User│Email│Obiekt│Od│Do│Status │
└─────────────────────────────────────┘
```

---

## Interaction States (all data-fetching components)

| State | Implementation |
|---|---|
| **Loading** | `<Spinner size="lg">` centered OR skeleton pulse cards |
| **Error** | `<EmptyState>` with ⚠️ icon + retry button + `toast.error()` |
| **Empty** | `<EmptyState>` with contextual icon/message/optional CTA |
| **Success mutations** | `toast.success()` + optimistic UI update |

---

## Routing & Guards

| Path | Guard | Redirect if fail |
|---|---|---|
| `/moj-panel` | Authenticated | `/logowanie` |
| `/admin` | Authenticated + admin role | `/` |

---

## Responsive Breakpoints

- `≥ 769px` — desktop grid layouts (2–3 columns)
- `≤ 768px` — single column, stacked CTAs, full-width search
