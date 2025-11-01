import { FastifyInstance } from "fastify";
import ResendOtpController from "./resend-otp.controller";

export async function resendOtpRoutes(
  fastify: FastifyInstance,
  controller: ResendOtpController
) {
  fastify.post("/auth/resend-otp", async (request, reply) => {
    const response = await controller.handle(request.body as any);
    return reply.status(response.status).send(response.body);
  });
}
