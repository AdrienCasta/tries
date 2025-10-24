import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseHelperRepository } from "@infrastructure/persistence/SupabaseHelperRepository.js";
import { SupabaseAuthRepository } from "@infrastructure/persistence/SupabaseAuthRepository.js";
import { SupabaseAuthUserRepository } from "@infrastructure/persistence/SupabaseAuthUserRepository.js";
import { SupabaseOnboardedHelperNotificationService } from "@infrastructure/notifications/SupabaseOnboardedHelperNotificationService.js";
import { SupabaseEmailConfirmationService } from "@infrastructure/services/SupabaseEmailConfirmationService.js";
import { SystemClock } from "@infrastructure/time/SystemClock.js";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus.js";
import { createApp } from "./app/createApp";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const dependencies = {
  helperRepository: new SupabaseHelperRepository(supabase),
  helperAccountRepository: new SupabaseAuthRepository(supabase),
  authUserRepository: new SupabaseAuthUserRepository(supabase),
  notificationService: new SupabaseOnboardedHelperNotificationService(supabase),
  emailConfirmationService: new SupabaseEmailConfirmationService(supabase),
  clock: new SystemClock(),
  eventBus: new InMemoryEventBus(),
};

const server = new FastifyHttpServer();
const app = createApp(server, dependencies);

await app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
