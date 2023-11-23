import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseStatusCode } from '../response/response.decorator';
import { AppconfigInterceptor } from './../appconfig/appconfig.interceptor';
import { OmsetService } from './omset.service';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import ExcelJS from 'exceljs';

@Controller('api/omset')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class OmsetController {
  constructor(private readonly omsetService: OmsetService) {}

  @Post('monthly_calc')
  @UserType('owner')
  @AuthJwtGuard()
  async KalkulasiOmsetBulanan(@Body() body: any) {
    return await this.omsetService.KalkulasiOmsetBulanan(body?.date);
  }

  @Get('monthly/:year')
  @UserType('owner')
  @AuthJwtGuard()
  async OmsetBulanan(@Param('year') year: any) {
    return await this.omsetService.OmsetBulanan(year);
  }

  @Get('yearly')
  @UserType('owner')
  @AuthJwtGuard()
  async OmsetTahunan() {
    return await this.omsetService.OmsetTahunan();
  }

  @Get('bagi_hasil/:year')
  @UserType('owner')
  @AuthJwtGuard()
  async PembagianHasil(@Param('year') year: any) {
    return await this.omsetService.PembagianHasil(year);
  }

  /**
   * REPORT
   */
  @Get('monthly/:year/download')
  @UserType('owner')
  @AuthJwtGuard()
  async DownloadOmsetBulanan(@Param('year') year: string, @Res() res) {
    const data = await this.omsetService.DownloadOmsetBulanan(year);
    const fileName = `OmsetBulananTahun_${year}.xlsx`;
    return await this.exportToExcel(data, 'Omset bulanan').then(
      async (output) => {
        res.set({
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=' + `${fileName}`,
        });

        return output.write(res).then(function () {
          return res.status(200).end();
        });
      },
    );
  }

  @Get('bagi_hasil/:year/download')
  @UserType('owner')
  @AuthJwtGuard()
  async DownloadPembagianHasil(@Param('year') year: string, @Res() res) {
    const data = await this.omsetService.DownloadPembagianHasil(year);
    const fileName = `PembagianHasil_${year}.xlsx`;
    return await this.exportToExcel(data, 'Pembagian Hasil').then(
      async (output) => {
        res.set({
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=' + `${fileName}`,
        });

        return output.write(res).then(function () {
          return res.status(200).end();
        });
      },
    );
  }

  async exportToExcel(object: any, sheetName: string) {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT.Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet(sheetName, {
        properties: { defaultColWidth: 20 },
      });

      // assign data to rows
      mySheet.addRows(object.rows);

      // styling
      const style = this.stylingSheet();
      mySheet.getRow(1).font = style.font;
      mySheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };

      return workbook.xlsx;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  stylingSheet() {
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
