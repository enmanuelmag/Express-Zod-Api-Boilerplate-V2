import { Middleware } from "express-zod-api";
import { z } from "zod";

import type { Method } from "express-zod-api";

export const methodProviderMiddleware = new Middleware({
  input: z.object({}),
  handler: async ({ request }) => {
    return new Promise<{ method: Method }>((resolve) => {
      resolve({ method: request.method.toLowerCase() as Method });
    });
  },
});
