import * as dotenv from 'dotenv';
dotenv.config();

export const {
    MONGODB_URI,
    EXTERNAL_API_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
    PORT,
    WEB_URL,
} = process.env;