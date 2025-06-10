export interface IntegrationIAService {
  getResponseFromIA(prompt: string): Promise<string>;

  getResponseFromIAWithContext(
    prompt: string,
    context: string,
  ): Promise<string>;
}

export const IntegrationIAService = Symbol('IntegrationIAService');
