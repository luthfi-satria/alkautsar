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
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import ExcelJS from 'exceljs';
import { CategoryService } from './categories.service';
import {
  CategoryIdDto,
  CreateCategoryDto,
  ListCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@Controller('api/category')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('')
  @ResponseStatusCode()
  // @UserType()
  // @AuthJwtGuard()
  async ListCategory(@Query() query: ListCategoryDto) {
    return await this.categoryService.ListCategory(query);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailCategory(@Param() param: CategoryIdDto) {
    return await this.categoryService.DetailCategory(param.id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateCategory(@Body() body: CreateCategoryDto) {
    return await this.categoryService.CreateCategory(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateCategory(
    @Param() param: CategoryIdDto,
    @Body() body: UpdateCategoryDto,
  ) {
    return await this.categoryService.UpdateCategory(param.id, body);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteCategory(@Param() param: CategoryIdDto) {
    return await this.categoryService.DeleteCategory(param.id);
  }

  @Patch('restore/:id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async RestoreCategory(@Param() param: CategoryIdDto) {
    return await this.categoryService.RestoreCategory(param.id);
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(@Query() param: ListCategoryDto, @Res() res) {
    try {
      const excelObjects = await this.categoryService.exportExcel(param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT.Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data kategori', {
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

      const fileName = `data_kategori.xlsx`;

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
