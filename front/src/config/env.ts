const DEFAULT_API_BASE_URL = 'http://localhost:8080'

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL

// Publishable key is safe to ship to the client (unlike the secret key backing app.stripe.api-key
// on the backend); it's still an env var since it differs between Stripe test/live modes.
export const STRIPE_PUBLISHABLE_KEY: string = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''
