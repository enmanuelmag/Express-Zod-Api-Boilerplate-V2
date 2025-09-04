import { ez } from "express-zod-api";
import createHttpError from "http-errors";
import { z } from "zod";

import { taggedEndpointsFactory } from "@/factories";
import { methodProviderMiddleware } from "@/middlewares";
import { exampleWithRandomThrow } from "@/services";
import { safeAsync } from "@/utils";

export const getUserEndpoint = taggedEndpointsFactory
  .addMiddleware(methodProviderMiddleware)
  .build({
    method: "get",
    tag: "users",
    shortDescription: "Retrieves an user by its ID.",
    description: "Example user retrieval endpoint.",
    input: z
      .object({
        id: z
          .string()
          .trim()
          .regex(/\d+/)
          .transform((id) => parseInt(id, 10))
          .describe("a numeric string containing the id of the user"),
      })
      .example({
        id: 12,
      }),
    output: z
      .object({
        demoData: z.string(),
      })
      .example({
        demoData: "Querying User 12 succeed!",
      }),
    handler: async ({ input: { id }, options: { method }, logger }) => {
      logger.debug(`Requested id: ${id}, method ${method}`);

      if (id > 100) throw createHttpError(404, "User not found");

      // Example calling async function but with the safety it never crashes!
      const exampleFnResult = await safeAsync(
        async () => await exampleWithRandomThrow()
      );

      if (!exampleFnResult.ok) {
        return {
          demoData: `Querying User ${id} failed safely: ${exampleFnResult.data}`,
        };
      }

      return { demoData: `Querying User ${id} succeed!` };
    },
  });

export const updateUserEndpoint = taggedEndpointsFactory
  .addMiddleware(methodProviderMiddleware)
  .build({
    method: "post",
    tag: "users",
    shortDescription: "Updates an user by its ID.",
    description: "Example user retrieval endpoint.",
    input: z
      .object({
        id: z
          .string()
          .trim()
          .regex(/\d+/)
          .transform((id) => parseInt(id, 10))
          .describe("a numeric string containing the id of the user"),
        name: z.string().min(1),
      })
      .example({
        id: 12,
        name: "John Doe",
      }),
    output: z.object({
      name: z.string(),
      createdAt: ez.dateOut(),
    }),
    handler: ({ input: { id, name }, options: { method }, logger }) => {
      logger.debug(
        `Requested id: ${id}, method ${method}, Name to set: ${name}`
      );

      if (id > 100) throw createHttpError(404, "User not found");

      throw createHttpError(500, "Not implemented yet!");
    },
  });
