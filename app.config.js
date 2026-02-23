export default {
  name: 'HealthPal',
  displayName: 'HealthPal',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://health-api-node-js-production.up.railway.app/api/v1',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://isgugvnltlnnqghjfpaq.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};
