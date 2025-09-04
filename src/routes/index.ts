import { DependsOnMethod } from 'express-zod-api';

import type { Routing } from 'express-zod-api';

import { getUserEndpoint, updateUserEndpoint } from '@/controllers/users.endpoints';

export const routing: Routing = {
  v1: {
    user: {
      ':id': new DependsOnMethod({
        get: getUserEndpoint,
        post: updateUserEndpoint,
      }),
    },
  },
};
