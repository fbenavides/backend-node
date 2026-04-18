import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.time('findOne');
    const user = await this.productService.findOne(+id);
    console.timeEnd('findOne');
    return user;
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }
}
