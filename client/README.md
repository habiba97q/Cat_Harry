# StudioSpace 🎬📷🎙️

**StudioSpace** is a premium peer-to-peer creative workspace and production studio sharing platform. Studio owners and hosts can list their creative spaces — from photography cyc walls and cinema sound stages to podcast lounges, music recording suites, and art workshops. Fellow creators can discover, filter, inspect dynamic availability, and reserve studio slots with transparent pricing.

🌐 **Live Site URL:** [https://studio-space-client.vercel.app](https://studio-space-client.vercel.app) *(deploy to update)*

---

## ✨ Key Features

- **3-Slide Hero Swiper Slider** — Immersive full-viewport hero with navigation and autoplay across Photography, Podcast, and Music studio themes
- **5 Studio Categories** — Browse and filter by Photo Studios, Sound Stages, Podcast Rooms, Music Suites, and Art Workshops
- **Studio Discovery & Details** — Responsive grid with search, category filters, detailed studio pages with image gallery, amenities, host profile, and reviews
- **Booking Modal** — Fully interactive booking form with date/time picker, duration selector, and real-time cost calculator
- **Host Dashboard** — Stat cards, listing management table with active/inactive toggle, recent activity feed, and quick actions
- **Light/Dark Mode** — Seamless theme switching using DaisyUI data-theme and persistent localStorage preference
- **Premium UI/UX** — Built with Inter font, glassmorphism, smooth hover animations, and a cohesive blue (#2563eb) design system

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Framework   | [Next.js 14](https://nextjs.org/) (App Router, JSX)                       |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) |
| Animations  | [Swiper.js](https://swiperjs.com/) for hero carousel                      |
| HTTP Client | [Axios](https://axios-http.com/) (configured for backend API)              |
| Toasts      | [Sonner](https://sonner.emilkowal.ski/)                                    |
| Icons       | Inline SVG + Emoji                                                         |
| Fonts       | [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter)            |

---

## 📂 Project Structure

```
client/
├── app/
│   ├── layout.jsx          # Root layout (Header, Footer, ThemeProvider, Toaster)
│   ├── page.jsx            # Homepage (Hero, Categories, Featured, How It Works, CTA)
│   ├── not-found.jsx       # Custom 404 page
│   ├── studios/
│   │   ├── page.jsx        # Explore Studios (search + category filters)
│   │   ├── [id]/page.jsx   # Studio Details (gallery, booking modal, reviews)
│   │   └── edit/[id]/page.jsx  # Edit Studio (pre-filled form)
│   ├── login/page.jsx      # Login with validation
│   ├── register/page.jsx   # Register (role selection + validation)
│   ├── dashboard/page.jsx  # Host Dashboard (stats, listings, activity)
│   ├── add-studio/page.jsx # Add Studio (3-step form wizard)
│   ├── my-listings/page.jsx # My Listings (manage + status toggle)
│   └── my-bookings/page.jsx # My Bookings (history + status)
├── components/
│   ├── Header.jsx          # Sticky navbar with auth dropdown
│   ├── Footer.jsx          # 4-column footer with X logo
│   ├── MobileNav.jsx       # Mobile drawer navigation
│   ├── StudioCard.jsx      # Reusable studio card with badges
│   ├── ThemeProvider.jsx   # Context provider for light/dark mode
│   ├── Modal.jsx           # Generic modal wrapper
│   ├── FormInput.jsx       # Reusable form input
│   ├── Gallery.jsx         # Image gallery component
│   ├── LoadingSkeleton.jsx # Loading skeleton UI
│   └── EmptyState.jsx      # Empty state component
├── data/
│   ├── demoStudios.js      # 10 realistic studio entries
│   ├── demoCategories.js   # 5 studio categories
│   └── demoBookings.js     # Sample booking records
└── public/
    ├── logo.svg            # StudioSpace brand logo
    └── x-logo.svg          # X (Twitter) social icon
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/habiba97q/Cat_Harry.git
cd Cat_Harry/client

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Examiner Test Credentials

> ⚠️ **Note:** The frontend is a UI preview. Authentication and CRUD are not connected to a live backend yet. The following credentials are for reference when the backend is integrated.

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Creator | `creator@studiosp.com` | `test1234` |
| Host    | `host@studiosp.com`    | `test1234` |

To test the UI:
1. Visit [http://localhost:3000](http://localhost:3000) to see the homepage with hero slider
2. Go to `/studios` to browse and filter all 10 demo studios
3. Click any studio to see the full details, gallery, and booking modal
4. Visit `/dashboard`, `/my-listings`, `/my-bookings` to see the host management UI
5. Visit `/add-studio` to test the 3-step studio listing wizard
6. Use `/login` and `/register` to test form validation

---

## 📋 Available Routes

| Route                  | Page                     |
|------------------------|--------------------------|
| `/`                    | Homepage                 |
| `/studios`             | Explore Studios          |
| `/studios/:id`         | Studio Details           |
| `/studios/edit/:id`    | Edit Studio              |
| `/login`               | Login                    |
| `/register`            | Register                 |
| `/dashboard`           | Host Dashboard           |
| `/add-studio`          | Add New Studio           |
| `/my-listings`         | My Studio Listings       |
| `/my-bookings`         | My Bookings              |

---

## 👥 Team

Built as part of the B14-A8 assignment — StudioSpace by Cat_Harry.
