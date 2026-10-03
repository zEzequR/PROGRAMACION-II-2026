import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const filePath = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(filePath, { recursive: true });