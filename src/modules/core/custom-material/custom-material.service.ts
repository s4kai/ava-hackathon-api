import { IntegrationIAService } from '@modules/shared';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CustomMaterialService {
  constructor(
    @Inject(IntegrationIAService)
    private readonly integrationIAService: IntegrationIAService,
  ) {}
}
