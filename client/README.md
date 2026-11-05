# StudioSpace 🎬📷🎙️

**StudioSpace** is a peer-to-peer creative workspace and production studio sharing platform. Hosts can list their creative spaces, and creators can discover listings and send booking requests. Booking requests require host confirmation; payment processing is not included.

---

## ✨ Key Features

- **Responsive discovery** — Browse and filter by creative studio categories
- **5 Studio Categories** — Browse and filter by Photo Studios, Sound Stages, Podcast Rooms, Music Suites, and Art Workshops
- **Studio Discovery & Details** — Responsive grid with search, category filters, detailed studio pages with image gallery, amenities, host profile, and reviews
- **Booking Requests** — Date/time booking requests with server-side pricing, overlap prevention, and host status controls
- **Role-based Dashboards** — Customer booking summaries and host listing and booking management
- **Light/Dark Mode** — Seamless theme switching using DaisyUI data-theme and persistent localStorage preference
- **Premium UI/UX** — Built with Inter font, glassmorphism, smooth hover animations, and a cohesive blue (#2563eb) design system

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                 |
|-------------|----------------------------------------------------------------------------|
| Framework   | [Next.js 14](https://nextjs.org/) (App Router, JSX)                       |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) |
| Animations  | [Swiper.js](https://swiperjs.com/) for hero carousel                      |
| HTTP Client | Native Fetch API with HTTPOnly-cookie credentials                          |
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
│   ├── dashboard/page.jsx  # Customer or host dashboard
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
│   └── demoCategories.js   # Static category choices used by listing forms
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

Follow the full-stack setup in the repository [README](../README.md). Start the Express API and set `NEXT_PUBLIC_SERVER_URL` to its origin before starting Next.js. To enable Google sign-in, set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend and the matching `GOOGLE_CLIENT_ID` in the server configuration.

```bash
cd client
npm ci
NEXT_PUBLIC_SERVER_URL=http://localhost:5000 npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Authentication and data

Registration, login, session restoration, and logout use the Express API and HTTPOnly cookies. Studio discovery, details, reviews, listings, dashboards, and booking requests load from MongoDB. Create accounts through `/register` and add studios through a host account; production views do not fall back to demo studio or booking records.

---

## 📋 Available Routes

| Route                  | Page                     |
|------------------------|--------------------------|
| `/`                    | Homepage                 |
| `/about`               | About StudioSpace        |
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
