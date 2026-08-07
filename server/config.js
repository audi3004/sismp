import dotenv from "dotenv";
dotenv.config();

export const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: "mysql", // Sequelize uses the 'mysql' dialect to talk to MySQL and MariaDB
  port: parseInt(process.env.DB_PORT, 10),
  logging: false, // Prevents excessive console noise
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "24h",
};

export const serverConfig = {
  port: parseInt(process.env.BACKEND_PORT, 10),
  apiPlnesUrl: process.env.API_PLNES || 'https://home.plnes.co.id/api',
};
