import { FastifyInstance } from "fastify";
import VerifyOtpController from "./verify-otp.controller";

export async function verifyOtpRoutes(
  fastify: FastifyInstance,
  controller: VerifyOtpController
) {
  fastify.post("/auth/verify-otp", async (request, reply) => {
    const response = await controller.handle(request.body as any);
    return reply.status(response.status).send(response.body);
  });
}
