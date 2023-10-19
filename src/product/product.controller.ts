import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import ExcelJS from 'exceljs';
import {
  CreateProductDto,
  ListProductDto,
  ProductIdDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../helper/utility.helper';
import { UserTypeAndLevel } from '../hash/guard/user-type-and-level.decorator';
import { ProductDocuments } from '../database/entities/product.entities';
import * as fs from 'fs';
import * as mimeType from 'mime-types';

import { join } from 'path';

@Controller('api/product')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  @ResponseStatusCode()
  async ListProduct(@Query() query: ListProductDto) {
    return await this.productService.ListProduct(query);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailProduct(@Param() param: ProductIdDto) {
    return await this.productService.DetailProduct(param.id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateProduct(@Body() body: CreateProductDto) {
    return await this.productService.CreateProduct(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateProduct(
    @Param() param: ProductIdDto,
    @Body() body: UpdateProductDto,
  ) {
    return await this.productService.UpdateProduct(param.id, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteProduct(@Param() param: ProductIdDto) {
    return await this.productService.DeleteProduct(param.id);
  }

  @Patch('restore/:id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async RestoreProduct(@Param() param: ProductIdDto) {
    return await this.productService.RestoreProduct(param.id);
  }

  @Post('stock/deduct')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeductStok(@Body() body: any) {
    return await this.productService.DeductStock(body);
  }

  @Post('stock/return')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ReturningStock(@Body() body: any) {
    return await this.productService.ReturningStock(body);
  }

  @Post('image/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: editFileName,
      }),
      limits: {
        fileSize: 5242880,
      },
      fileFilter: imageFileFilter,
    }),
  )
  @UserTypeAndLevel('owner.*')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async uploadFoto(
    @Param() param: ProductIdDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.productService.uploadImage(param.id, file);
  }

  @Get(':id/image/:name')
  @ResponseStatusCode()
  async readFoto(
    @Param('id') id: string,
    @Param('name') name: string,
    @Res() res,
  ) {
    if (name) {
      const file_path = `uploads/products/${id}/${name}`;
      if (fs.existsSync(`./${file_path}`)) {
        const file = fs.createReadStream(join(process.cwd(), file_path));
        res.set({
          'Content-Type': mimeType.lookup(file_path),
          'Content-Disposition': `attachment; filename="${name}"`,
        });
        file.pipe(res, {
          end: true,
        });
      }
    }
    // return not found;
    return {
      success: false,
      message: 'image not found',
    };
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(@Query() param: ListProductDto, @Res() res) {
    try {
      const excelObjects = await this.productService.exportExcel(param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT.Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data produk', {
        properties: { defaultColWidth: 20 },
      });

      // assign data to rows
      mySheet.addRows(excelObjects.rows);

      // styling
      const style = await this.stylingSheet();
      mySheet.getRow(1).font = style.font;
      mySheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      const fileName = `data_product.xlsx`;

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=' + `${fileName}`,
      });

      return workbook.xlsx.write(res).then(function () {
        return res.status(200).end();
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async stylingSheet() {
    const style = {
      font: {
        size: 11.05,
        bold: true,
      },
      border: {
        style: 'thin',
        color: {
          argb: '000000',
        },
      },
    };
    return style;
  }
}
