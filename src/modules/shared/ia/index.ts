import { IntegrationIAService } from './interfaces/ia-service';
import { FakeIAService } from './services/FakeIA.impl';
export { IntegrationIAService } from './interfaces/ia-service';

export const IntegrationIAProvider = {
  provide: IntegrationIAService, // Used as a symbol
  useClass: FakeIAService,
};
