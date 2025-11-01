import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseAuthUserRepository } from "@infrastructure/persistence/SupabaseAuthUserRepository.js";
import { createApp } from "./app/createApp";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const IS_TEST_MODE = process.env.NODE_ENV === "test";

let dependencies;

if (IS_TEST_MODE) {
  console.log("Running in TEST mode with InMemory repositories");
  const authUserRepository = new InMemoryAuthUserRepository();

  dependencies = {
    authUserRepository: authUserRepository,
  };
} else {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  dependencies = {
    authUserRepository: new SupabaseAuthUserRepository(supabase),
  };
}

const server = new FastifyHttpServer();
const app = createApp(server, dependencies);

await app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
