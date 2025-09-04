import { Integration } from "express-zod-api";
import fs from "node:fs";

import { routing } from "@/routes";

console.log("✍️  Generating client...");

const client = new Integration({
  routing,
  variant: "client", // <— optional, see also "types" for a DIY solution
});

// Check https://github.com/RobinTail/express-zod-api/tree/master#generating-a-frontend-client
fs.writeFileSync(
  "./src/client/client.ts",
  `/* eslint-disable @typescript-eslint/no-explicit-any */\r\n${client.printFormatted()}`,
  "utf-8"
);
console.log("✅ Client generated at ./client/client.ts");
