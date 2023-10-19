import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { OrderService } from './order.service';
import { CreateOrder, OrderListDto, UpdateOrder } from './dto/order.dto';
import { UserTypeAndLevel } from '../hash/guard/user-type-and-level.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../helper/utility.helper';
import * as fs from 'fs';
import { join } from 'path';
import * as mimeType from 'mime-types';
import ExcelJS from 'exceljs';

@Controller('api/order')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('')
  @ResponseStatusCode()
  @UserTypeAndLevel('owner.*', 'organisasi.*', 'public.*')
  @AuthJwtGuard()
  async ListOrder(@User() user: any, @Query() query: OrderListDto) {
    return await this.orderService.ListOrder(user, query);
  }

  @Get(':kode_transaksi')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailOrder(
    @User() user: any,
    @Param('kode_transaksi') kode_transaksi: string,
  ) {
    return await this.orderService.DetailOrder(user, kode_transaksi);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateOrder(@User() user: any, @Body() body: CreateOrder) {
    return await this.orderService.CreateOrder(user, body);
  }

  @Post('abort/:kode_transaksi')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async AbortOrder(
    @User() user: any,
    @Param('kode_transaksi') kode_transaksi: string,
  ) {
    return await this.orderService.AbortOrder(user, kode_transaksi);
  }

  @Put('')
  @UseInterceptors(
    FileInterceptor('bukti_transaksi', {
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
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateOrder(
    @User() user: any,
    @Body() body: UpdateOrder,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.orderService.UpdateOrder(user, body, file);
  }

  @Get(':kode_transaksi/bukti_transaksi/:image')
  @ResponseStatusCode()
  async readFoto(@Param('image') name: string, @Res() res) {
    try {
      if (name) {
        const file_path = `uploads/bukti/${name}`;
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
      return {
        name: name,
      };
    } catch (error) {
      throw error;
    }
  }

  @Put(':kode_transaksi/status/:name')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ChangeStatus(
    @User() user: any,
    @Param('kode_transaksi') kode_transaksi: string,
    @Param('name') status: string,
  ) {
    const isValidStatus = ['verify', 'done', 'canceled'].includes(status);
    if (isValidStatus) {
      return await this.orderService.ChangeStatus(user, kode_transaksi, status);
    } else {
      throw new BadRequestException('Invalid status');
    }
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(
    @User() user: any,
    @Query() param: OrderListDto,
    @Res() res,
  ) {
    try {
      const excelObjects = await this.orderService.exportExcel(user, param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT. Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data order', {
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

      const fileName = `data_order.xlsx`;

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
