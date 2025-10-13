import { HttpHelperRepository } from "../repositories/HttpHelperRepository";
import type { IHelperRepository } from "../../domain/interfaces/IHelperRepository";

class HelperContainer {
  private static instance: HelperContainer;
  private helperRepository: IHelperRepository | null = null;

  private constructor() {}

  static getInstance(): HelperContainer {
    if (!HelperContainer.instance) {
      HelperContainer.instance = new HelperContainer();
    }
    return HelperContainer.instance;
  }

  getHelperRepository(): IHelperRepository {
    if (!this.helperRepository) {
      this.helperRepository = new HttpHelperRepository();
    }
    return this.helperRepository;
  }

  setHelperRepository(repository: IHelperRepository): void {
    this.helperRepository = repository;
  }
}

export const helperContainer = HelperContainer.getInstance();
