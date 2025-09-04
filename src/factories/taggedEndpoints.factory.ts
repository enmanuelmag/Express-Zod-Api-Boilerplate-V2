import { EndpointsFactory, defaultResultHandler } from "express-zod-api";

// import { zodConfig as config } from '@/configs';

export const taggedEndpointsFactory = new EndpointsFactory(
  defaultResultHandler
);
