import * as dotenv from 'dotenv';

import { EnvFileSchema } from '@/models';

dotenv.config();

export const envConfig = EnvFileSchema.parse(process.env);
