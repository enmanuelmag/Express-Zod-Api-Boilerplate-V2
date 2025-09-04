import { Environment } from "@/models/app";

export const currentEnvironment = Environment.parse(process.env.NODE_ENV);
export const isDevEnvironment: boolean = currentEnvironment === "development";
