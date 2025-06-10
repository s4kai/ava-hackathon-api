import { IntegrationIAService } from '../interfaces/ia-service';

export class FakeIAService implements IntegrationIAService {
  public async getResponseFromIA(prompt: string): Promise<string> {
    return `Response to prompt: ${prompt}`;
  }

  public async getResponseFromIAWithContext(
    prompt: string,
    context: string,
  ): Promise<string> {
    return `Response to prompt: ${prompt} with context: ${context}`;
  }
}
