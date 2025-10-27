import { spawn, ChildProcess } from "node:child_process";

export class ServerHelper {
  private backendProcess: ChildProcess | null = null;
  private frontendProcess: ChildProcess | null = null;

  async startBackend(port: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      this.backendProcess = spawn("npm", ["run", "start"], {
        cwd: "/home/acastagliola/perso/tries/backend",
        env: { ...process.env, PORT: port.toString() },
        stdio: "pipe",
      });

      const timeout = setTimeout(() => {
        reject(new Error("Backend server failed to start within timeout"));
      }, 30000);

      this.backendProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        if (output.includes(`listening on port ${port}`)) {
          clearTimeout(timeout);
          resolve();
        }
      });

      this.backendProcess.stderr?.on("data", (data) => {
        console.error(`Backend error: ${data}`);
      });

      this.backendProcess.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async startFrontend(port: number = 5173): Promise<void> {
    return new Promise((resolve, reject) => {
      this.frontendProcess = spawn("npm", ["run", "dev"], {
        cwd: "/home/acastagliola/perso/tries/frontend",
        env: { ...process.env },
        stdio: "pipe",
      });

      const timeout = setTimeout(() => {
        reject(new Error("Frontend server failed to start within timeout"));
      }, 30000);

      this.frontendProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        if (output.includes("Local:") && output.includes(`${port}`)) {
          clearTimeout(timeout);
          setTimeout(resolve, 1000);
        }
      });

      this.frontendProcess.stderr?.on("data", (data) => {
        console.error(`Frontend error: ${data}`);
      });

      this.frontendProcess.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async stopBackend(): Promise<void> {
    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }
  }

  async stopFrontend(): Promise<void> {
    if (this.frontendProcess) {
      this.frontendProcess.kill();
      this.frontendProcess = null;
    }
  }

  async cleanup(): Promise<void> {
    await Promise.all([this.stopBackend(), this.stopFrontend()]);
  }
}
