# Furever

**Furever** is a comprehensive Pet Care Platform with Geo Services and AI Assistance. Furever connects pet owners, veterinarians, and adoption services—everything you need for your pet’s wellbeing in one place.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [Project Structure](#project-structure)
8. [Usage](#usage)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

* **Pet Profiles**
  Add, view and update pet details such as name, description, diseases, vaccinations, next vaccination date, owner, location .

* **Geo Services**
  Display nearby veterinarians on an interactive map using OpenStreetMap.

* **Adoption Portal**
  Post pets for adoption; track and manage adoption inquiries.

* **Appointment Booking**
  Book vet appointments and receive confirmations.

* **Authentication**
  Google OAuth login + email/password powered by JWT with httpOnly cookies.

* **AI-Powered FAQ**
  Ask pet-care questions; AI  provides real‑time answers.

* **Reminders & Alerts**
  Push/email/SMS reminders for upcoming vaccinations and lost/found pet alerts.

* **Community Forum**
  Q\&A boards for pet owners to share advice and experiences.

* **Vet Ratings & Reviews**
  Rate and review local veterinarians.

---

## Tech Stack

* **Frontend:** Next.js (React + Typescript)
* **Backend:** Node.js + Express
* **Database:** MongoDB
* **Authentication:** JWT (httpOnly cookies), Google OAuth
* **Maps & Geo:** OpenStreetMap
* **Media Storage:** Cloudinary
* **Deployment:** Vercel (frontend),Render (backend)

---

## Prerequisites

* Node.js ≥ 16.x
* npm ≥ 8.x
* MongoDB instance (Atlas or local)
* Cloudinary account
* Google OAuth credentials

---

## Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/binayakjoshi/furever.git
   cd furever
   ```

2. **Install root dependencies**

   ```bash
   npm i
   ```

3. **Set up frontend `.env`** (in project root)

   ```env
   BACKEND_URL=http://localhost:5000
   NEXT_ROUTE_URL=http://localhost:3000
   ```

4. **Start frontend**

   ```bash
   npm run dev
   ```

   Visit: [http://localhost:3000](http://localhost:3000)

5. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

   Create `backend/.env` with:

   ```env
   MONGODB_URL=<your-mongodb-connection-string>
   PORT=5000
   CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<cloudinary-api-key>
   CLOUDINARY_API_SECRET=<cloudinary-api-secret>
   JWT_SECRET=<your-jwt-secret>
   ```

   ```bash
   npm start
   ```

   API runs on [http://localhost:5000](http://localhost:5000)

---

## Environment Variables

| Variable                | Description                                       |
| ----------------------- | ------------------------------------------------- |
| BACKEND\_URL            | Backend base URL (e.g., `http://localhost:5000`)  |
| NEXT\_ROUTE\_URL        | Frontend base URL (e.g., `http://localhost:3000`) |
| MONGODB\_URL            | MongoDB connection string                         |
| PORT                    | Backend server port (default: `5000`)             |
| CLOUDINARY\_CLOUD\_NAME | Cloudinary account cloud name                     |
| CLOUDINARY\_API\_KEY    | Cloudinary API key                                |
| CLOUDINARY\_API\_SECRET | Cloudinary API secret                             |
| JWT\_SECRET             | Secret for signing JWTs                           |

---

## Project Structure

```
furever/
├── app/                   # Next.js pages and routes
├── assets/                  # Static assets
├── backend/                 # Express server, models, routes, controllers
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── app.js
├── components/              # Reusable React components
│   ├── authentication/
│   ├── custom-elements/      # reusable custom components
│   ├── navigation/           # Navigation bar, navlinks and button
├── lib/                   # Frontend helper functions and hooks
├── .env                     # Frontend environment vars
├── next.config.js
└── package.json
```

---

## Usage

1. Register or log in via Google or email/password.
2. Create and manage pet profiles under **My Pets**.
3. Find nearby vets on the map and book appointments.
4. Post pets for adoption; manage adoption requests.
5. Ask the AI assistant pet-care questions.
6. Participate in the community forum.
7. Receive vaccination reminders and alerts.

---

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/YourFeature`.
3. Commit: `git commit -m "Add YourFeature"`.
4. Push: `git push origin feature/YourFeature`.
5. Open a Pull Request.

Please follow existing code style and include tests for new features.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
