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

  create(example: CreateExampleDto) {
    console.log(example);
    this.examples.push({
      id: this.examples.length + 1,
      name: example.name,
      description: example.description
    })
  }

  findAll() {
    return this.examples;
  }

  findOne(id: number) {
    const exampleFound = this.examples.find(example => example.id === id)
    if(!exampleFound) {
      return new NotFoundException('No se encontro la example')
    }
    
    return exampleFound;
  }

  update(id: number, updateExampleDto: UpdateExampleDto) {
    return `This action updates a #${id} example`;
  }

  remove(id: number) {
    return `This action removes a #${id} example`;
  }
}
