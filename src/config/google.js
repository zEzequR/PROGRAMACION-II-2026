import { OAuth2Client } from "google-auth-library";
import 'dotenv/config';

export const GClient = new OAuth2Client (process.env.GOOGLE_CLIENT_ID);