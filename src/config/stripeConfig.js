// Configuration Stripe pour le frontend
// Les variables d'environnement doivent être défini dans .env.local

export const stripeConfig = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  isProduction: import.meta.env.PROD,
};

export const licensePackages = {
  5: { name: '5 Licences', price: 49 },
  10: { name: '10 Licences', price: 89 },
  25: { name: '25 Licences', price: 199 },
  50: { name: '50 Licences', price: 399 },
};

export const getCurrencySymbol = () => '€';
export const getCurrencyCode = () => 'EUR';
