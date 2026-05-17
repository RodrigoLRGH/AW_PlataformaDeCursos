export default () => ({
  jwtSecret: process.env.JWT_SECRET,
  dbUrl: process.env.DB_URL,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
});
