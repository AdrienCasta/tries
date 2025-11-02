import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseAuthService } from "@infrastructure/auth/SupabaseAuthService.js";
import { SupabaseUserRepository } from "@infrastructure/persistence/SupabaseUserRepository.js";
import { createApp } from "./app/createApp";
import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";
import InMemoryUserRepository from "@infrastructure/persistence/InMemoryUserRepository.js";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const IS_TEST_MODE = process.env.NODE_ENV === "test";

let dependencies;

if (IS_TEST_MODE) {
  console.log("Running in TEST mode with InMemory repositories");
  const authService = new InMemoryAuthService();
  const userRepository = new InMemoryUserRepository();

  dependencies = {
    authService: authService,
    userRepository: userRepository,
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
    authService: new SupabaseAuthService(supabase),
    userRepository: new SupabaseUserRepository(supabase),
  };
}

const server = new FastifyHttpServer();
const app = createApp(server, dependencies);

await app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
