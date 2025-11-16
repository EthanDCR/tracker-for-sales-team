import { createClient } from "@libsql/client";


let client;

export function db() {

  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error("Missing required environment variables");
    }

    client = createClient({
      url: url,
      authToken: authToken,
    })
  }
  return client;
} 
