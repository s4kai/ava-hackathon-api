import OpenAI from 'openai';
import { IntegrationIAService } from '../interfaces/ia-service';
import { config } from '@config/index';
import { Logger } from '@nestjs/common';

const client = new OpenAI({
  apiKey: config.openAPI, // Forma recomendada
});

export class OpenIAService implements IntegrationIAService {
  private logger = new Logger(OpenIAService.name);

  public async getResponseFromIA(prompt: string): Promise<string> {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
    });

    this.logger.log(`OpenApi chamada com o seguinte prompt: ${prompt}`);

    return response.choices[0].message.content || '';
  }

  public async getResponseFromIAWithContext(
    prompt: string,
    context: string,
  ): Promise<string> {
    const newPrompt = `
      ${prompt} \n\n
      Use o seguinte contexto: ${context} \n
    `;

    return this.getResponseFromIA(newPrompt);
  }

  public async getResponseWithFormat(
    prompt: string,
    context: string,
    format: string,
  ): Promise<string> {
    const newPrompt = `
      ${prompt}\n\n
      Use o seguinte contexto: ${context} \n
      Me devolva as informacoes nesse formato JSON: \n
      ${format}
    `;

    return this.getResponseFromIA(newPrompt);
  }
}
