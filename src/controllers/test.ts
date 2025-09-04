import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod";

export const helloWorldEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    // for empty input use z.object({})
    name: z.string().optional(),
  }),
  output: z.object({
    greetings: z.string(),
  }),
  handler: async ({ input: { name }, options, logger }) => {
    logger.debug("Options:", options); // middlewares provide options

    return new Promise((resolve) =>
      resolve({ greetings: `Hello, ${name || "World"}. Happy coding!` })
    );
  },
});
