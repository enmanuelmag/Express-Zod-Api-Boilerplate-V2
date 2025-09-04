import { Documentation } from "express-zod-api";
import fs from "node:fs";

import { zodConfig as config, envConfig } from "@/configs";
import { routing } from "@/routes";

console.log("✍️  Generating docs...");

const yamlString = new Documentation({
  routing, // the same routing and config that you use to start the server
  config,
  version: envConfig.API_VERSION,
  title: envConfig.API_TITLE,
  serverUrl: envConfig.API_SERVER_URL,
  composition: "inline", // optional, or "components" for keeping schemas in a separate dedicated section using refs
  // descriptions: { positiveResponse, negativeResponse, requestParameter, requestBody }, // check out these features
}).getSpecAsYaml();

// Check this for docs: https://github.com/RobinTail/express-zod-api/tree/master#creating-a-documentation
fs.writeFileSync("./src/docs/api.yaml", yamlString, "utf-8");
console.log("✅ OpenAPI API Docs generated at ./docs/api.yaml");
