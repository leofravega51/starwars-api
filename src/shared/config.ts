import * as dotenv from 'dotenv';
dotenv.config();

export const {
    MONGODB_URI,
    API_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REFRESH_JWT_SECRET,
    REFRESH_JWT_EXPIRES_IN,
    NODE_ENV,
    PORT,
    WEB_URL,
} = process.env;