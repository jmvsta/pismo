const DEFAULT_API_BASE_URL = 'http://localhost:8080'

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL
