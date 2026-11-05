# StudioSpace

StudioSpace is a Next.js and Express marketplace for discovering creative studios, creating host listings, and requesting time-slot bookings. Studio listings, account sessions, reviews, and bookings are backed by MongoDB; the app does not include payment processing.

## Requirements

- Node.js 18 or newer
- MongoDB (a local standalone server or MongoDB Atlas)

## Run locally

1. Configure the API:

   ```sh
   cd server
   npm ci
   cp .env.example .env
   ```

   Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` in `server/.env`. Use a long random JWT secret. `PORT` defaults to `5000`; `CLIENT_URLS` may contain additional comma-separated frontend origins. To enable Google sign-in, configure `GOOGLE_CLIENT_ID` here and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend with the same Google Identity Services web client ID. Never commit `.env`.

2. Start the API from the `server` directory:

   ```sh
   npm run dev
   ```

   The API connects to MongoDB before listening. `GET /api/health` reports API process availability.

3. In a second terminal configure and start the frontend:

   ```sh
   cd client
   npm ci
   NEXT_PUBLIC_SERVER_URL=http://localhost:5000 npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Set `NEXT_PUBLIC_SERVER_URL` to the backend origin when deploying the frontend. The browser sends the JWT in an HTTPOnly cookie; do not store tokens in local storage.

## Images

Configure the three `CLOUDINARY_*` variables in `server/.env` to store uploaded studio photos in Cloudinary. Without those values, the API stores uploads under `server/src/uploads` and serves them from `/uploads`.

## Booking behavior

Customers submit a pending booking request for a date and time. Hosts can confirm or cancel requests, and mark confirmed bookings complete after their end time. Overlapping pending or confirmed requests are rejected. Booking-slot writes use a MongoDB atomic lock, so the booking workflow works with both standalone MongoDB and replica-set deployments without disabling TLS validation.

## Checks

```sh
cd client && npm run lint && npm run build
cd ../server && npm test
```

The backend tests cover booking time overlap rules and HTTP health/CORS behavior. Full database-backed flows require a running MongoDB instance and configured environment.
