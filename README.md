# Shopwise: E-Commerce Store with Admin Panel

React + Vite + Tailwind CSS v4 + React Router. Data and authentication come from the free DummyJSON API.

## Demo

[View the live application](https://react-js-ecommerce-application.vercel.app/)

## Features

- Login with JWT authentication
- Protected and role-based routes
- Shopping cart using useReducer and localStorage
- Product search, category filtering and sorting
- Pagination
- Form validation
- Loading skeletons
- Error handling with retry
- Responsive UI
- Admin product add/delete (simulated by the demo API)

## Demo Logins

- **Admin:** `emilys` / `emilyspass`
- **Customer:** `michaelw` / `michaelwpass`

## Run Locally

```bash
npm install
npm run dev
```

## Deployment

Vercel/Netlify: import the repository (or drag the project folder).

- Build command: `npm run build`
- Output directory: `dist`

SPA redirects are already configured.