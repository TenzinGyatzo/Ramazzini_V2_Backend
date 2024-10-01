import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';

export interface Example {
  id: number;
  name: string;
  description: string;
}

@Injectable()
export class ExamplesService {

  private examples: Example[] = [
    {
      id: 1,
      name: 'Example 1',
      description: 'This is example 1',
    },
    {
      id: 2,
      name: 'Example 2',
      description: 'This is example 2',
    },
  ];

}
