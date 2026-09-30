/** URL di un file in public/img, rispettando il `base` di Vite (sottocartella su GitHub Pages). */
export const img = (file: string) => `${import.meta.env.BASE_URL}img/${file}`
