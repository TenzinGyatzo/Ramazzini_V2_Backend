import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpCode, ParseIntPipe, ParseBoolPipe, Query, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExamplesService } from './examples.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { ValidateUserPipe } from 'src/modules/examples/pipes/validate-user/validate-user.pipe';
import { AuthGuard } from './guards/auth/auth.guard';

@Controller('examples')
export class ExamplesController {
  constructor(private readonly examplesService: ExamplesService) {}

  // HTTP REQUESTS & RESPONSES
  @Get('test')
  index(@Req() request: Request, @Res() response: Response) {
    console.log(request.url);
    response.status(200).json({ message: 'Hello World!' });
  }

  // CUSTOM HTTP CODES
  @Get('not-found')
  @HttpCode(404)
  notFoundPage() {
    return '404 not found';
  }

  @Get('error')
  @HttpCode(500)
  errorPage() {
    return 'Error Route!!';
  }

  // PIPES
  @Get('ticket/:num') // Convert response to number
  getNumber(@Param('num', ParseIntPipe) num: number) {
    return num + 14;
  }

  @Get('active/:status') // Convert response to boolean
  isUserActive(@Param('status', ParseBoolPipe) status: boolean) {
      console.log(typeof status);
      return status;
  }

  @Get('greet') // Using custom pipe (ValidateUserPipe)
  @UseGuards(AuthGuard) // Using guard (AuthGuard) guards can be useful for checking user roles
  greet(@Query(ValidateUserPipe) query: {name: string, age: number} ) {
    console.log(typeof query.age);
    console.log(typeof query.name);
    return `Hello ${query.name}, your age is ${query.age}`;
  }

  // CRUD OPERATIONS
  @Post()
  create(@Body() createExampleDto: CreateExampleDto) {
    return this.examplesService.create(createExampleDto);
  }

  @Get()
  findAll() {
    return this.examplesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examplesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExampleDto: UpdateExampleDto) {
    return this.examplesService.update(+id, updateExampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examplesService.remove(+id);
  }
}
