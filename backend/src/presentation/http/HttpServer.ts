/**
 * Framework-agnostic HTTP server interface
 *
 * This abstraction allows the application to be independent of any specific
 * HTTP framework (Fastify, Express, etc.)
 */

export interface HttpRequest {
  body: any;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  send(body: any): HttpResponse;
  json(body: any): HttpResponse;
}

export interface RouteHandler {
  (request: HttpRequest, response: HttpResponse): Promise<void> | void;
}

export interface HttpServer {
  post(path: string, handler: RouteHandler): void;
  get(path: string, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  delete(path: string, handler: RouteHandler): void;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
  ready(): Promise<void>;
  inject(options: { method: string; url: string; payload?: any }): Promise<{
    statusCode: number;
    json: () => any;
  }>;
}
