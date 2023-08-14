import { Test, TestingModule } from '@nestjs/testing';
import { AppmenuService } from './appmenu.service';

describe('AppmenuService', () => {
  let service: AppmenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppmenuService],
    }).compile();

    service = module.get<AppmenuService>(AppmenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
