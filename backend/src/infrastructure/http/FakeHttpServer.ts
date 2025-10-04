import {
  HttpServer,
  HttpRequest,
  HttpResponse,
  RouteHandler,
} from "./HttpServer.js";

/**
 * Fake HTTP Server for integration testing
 *
 * Provides a lightweight, in-memory implementation of HttpServer
 * without any real HTTP framework overhead. Perfect for testing
 * business logic integration without infrastructure concerns.
 */
export class FakeHttpServer implements HttpServer {
  private routes: Map<string, Map<string, RouteHandler>> = new Map();

  post(path: string, handler: RouteHandler): void {
    this.registerRoute("POST", path, handler);
  }

  get(path: string, handler: RouteHandler): void {
    this.registerRoute("GET", path, handler);
  }

  put(path: string, handler: RouteHandler): void {
    this.registerRoute("PUT", path, handler);
  }

  delete(path: string, handler: RouteHandler): void {
    this.registerRoute("DELETE", path, handler);
  }

  async listen(port: number): Promise<void> {
    // No-op: fake server doesn't actually listen
  }

  async close(): Promise<void> {
    // No-op: nothing to close
  }

  async ready(): Promise<void> {
    // No-op: always ready
  }

  async inject(options: {
    method: string;
    url: string;
    payload?: any;
  }): Promise<{ statusCode: number; json: () => any }> {
    const handler = this.findHandler(options.method, options.url);

    if (!handler) {
      return {
        statusCode: 404,
        json: () => ({ error: "Route not found" }),
      };
    }

    // Create fake request/response objects
    const request = this.createFakeRequest(options);
    const response = this.createFakeResponse();

    // Invoke the handler
    await handler(request, response);

    return {
      statusCode: response._statusCode,
      json: () => response._body,
    };
  }

  private registerRoute(method: string, path: string, handler: RouteHandler): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }
    this.routes.get(method)!.set(path, handler);
  }

  private findHandler(method: string, url: string): RouteHandler | undefined {
    const methodRoutes = this.routes.get(method);
    if (!methodRoutes) {
      return undefined;
    }

    // Simple exact match (could be enhanced with path parameters)
    return methodRoutes.get(url);
  }

  private createFakeRequest(options: {
    method: string;
    url: string;
    payload?: any;
  }): HttpRequest {
    return {
      body: options.payload || {},
      params: {},
      query: {},
      headers: {},
    };
  }

  private createFakeResponse(): HttpResponse & {
    _statusCode: number;
    _body: any;
  } {
    let statusCode = 200;
    let body: any = null;

    const responseObj = {
      _statusCode: statusCode,
      _body: body,
      status(code: number): HttpResponse {
        statusCode = code;
        responseObj._statusCode = code;
        return responseObj;
      },
      send(data: any): HttpResponse {
        body = data;
        responseObj._body = data;
        return responseObj;
      },
      json(data: any): HttpResponse {
        body = data;
        responseObj._body = data;
        return responseObj;
      },
    };

    return responseObj;
  }
}
