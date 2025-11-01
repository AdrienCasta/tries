import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  InjectOptions,
} from "fastify";
import cors from "@fastify/cors";
import {
  HttpServer,
  HttpRequest,
  HttpResponse,
  RouteHandler,
} from "./HttpServer.js";

/**
 * Fastify adapter implementing the framework-agnostic HttpServer interface
 */
export class FastifyHttpServer implements HttpServer {
  private app: FastifyInstance;
  private pluginsReady: ReturnType<typeof this.app.register>;

  constructor() {
    this.app = Fastify({
      logger: false,
    });
    this.pluginsReady = this.app.register(cors, {
      origin: true,
    });
  }

  post(path: string, handler: RouteHandler): void {
    this.app.post(
      path,
      async (request: FastifyRequest, reply: FastifyReply) => {
        await handler(this.adaptRequest(request), this.adaptResponse(reply));
      }
    );
  }

  get(path: string, handler: RouteHandler): void {
    this.app.get(path, async (request: FastifyRequest, reply: FastifyReply) => {
      await handler(this.adaptRequest(request), this.adaptResponse(reply));
    });
  }

  put(path: string, handler: RouteHandler): void {
    this.app.put(path, async (request: FastifyRequest, reply: FastifyReply) => {
      await handler(this.adaptRequest(request), this.adaptResponse(reply));
    });
  }

  delete(path: string, handler: RouteHandler): void {
    this.app.delete(
      path,
      async (request: FastifyRequest, reply: FastifyReply) => {
        await handler(this.adaptRequest(request), this.adaptResponse(reply));
      }
    );
  }

  async listen(port: number): Promise<void> {
    await this.pluginsReady;
    await this.app.listen({ port, host: "0.0.0.0" });
  }

  async close(): Promise<void> {
    await this.app.close();
  }

  async ready(): Promise<void> {
    await this.app.ready();
  }

  async inject(options: {
    method: string;
    url: string;
    payload?: any;
  }): Promise<{ statusCode: number; json: () => any }> {
    const response = await this.app.inject(options as InjectOptions);
    return {
      statusCode: response.statusCode,
      json: () => response.json(),
    };
  }

  private adaptRequest(request: FastifyRequest): HttpRequest {
    return {
      body: request.body,
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string>,
      headers: request.headers as Record<string, string>,
    };
  }

  private adaptResponse(reply: FastifyReply): HttpResponse {
    return {
      status: (code: number) => {
        reply.status(code);
        return this.adaptResponse(reply);
      },
      send: (body: any) => {
        reply.send(body);
        return this.adaptResponse(reply);
      },
      json: (body: any) => {
        reply.send(body);
        return this.adaptResponse(reply);
      },
    };
  }
}
