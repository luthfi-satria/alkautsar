import {
  Controller,
  UseInterceptors,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Res,
  UploadedFiles,
} from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { UserTypeAndLevel } from '../hash/guard/user-type-and-level.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../helper/utility.helper';
import * as fs from 'fs';
import { join } from 'path';
import * as mimeType from 'mime-types';
import ExcelJS from 'exceljs';
import { KreditService } from './kredit.service';
import {
  BayarKreditDto,
  ChangeStatusDto,
  CreateKredit,
  KreditListDto,
} from './dto/kredit.dto';

@Controller('api/kredit')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class KreditController {
  constructor(private readonly kreditService: KreditService) {}

  @Get('')
  @ResponseStatusCode()
  @UserTypeAndLevel('owner.*')
  @AuthJwtGuard()
  async ListKredit(@User() user: any, @Query() query: KreditListDto) {
    return await this.kreditService.ListKredit(user, query);
  }

  @Get(':kredit_code')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailKredit(
    @User() user: any,
    @Param('kredit_code') kredit_code: string,
  ) {
    return await this.kreditService.DetailKredit(user, kredit_code);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fc_ktp', maxCount: 1 },
        { name: 'fc_kk', maxCount: 1 },
        { name: 'slip_gaji', maxCount: 1 },
        { name: 'rek_koran', maxCount: 1 },
        { name: 'surat_pernyataan', maxCount: 1 },
        { name: 'down_payment', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/temp',
          filename: editFileName,
        }),
        limits: {
          fileSize: 5242880,
        },
        fileFilter: imageFileFilter,
      },
    ),
  )
  async CreateKredit(
    @User() user: any,
    @Body() body: CreateKredit,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.kreditService.CreateKredit(user, body, files);
  }

  @Put(':kredit_code')
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fc_ktp', maxCount: 1 },
        { name: 'fc_kk', maxCount: 1 },
        { name: 'slip_gaji', maxCount: 1 },
        { name: 'rek_koran', maxCount: 1 },
        { name: 'surat_pernyataan', maxCount: 1 },
        { name: 'down_payment', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/temp',
          filename: editFileName,
        }),
        limits: {
          fileSize: 5242880,
        },
        fileFilter: imageFileFilter,
      },
    ),
  )
  async UpdateKredit(
    @User() user: any,
    @Param('kredit_code') code: string,
    @Body() body: CreateKredit,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.kreditService.UpdateKredit(user, code, body, files);
  }

  @Get(':kredit_code/support/:image')
  @ResponseStatusCode()
  async readFoto(
    @Param('kredit_code') kode: string,
    @Param('image') name: string,
    @Res() res,
  ) {
    try {
      if (name) {
        const file_path = `uploads/kredit/${kode}/${name}`;
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

  @Get(':kredit_code/akad')
  @UserTypeAndLevel('owner.admin')
  @ResponseStatusCode()
  async cetakAkad(@User() user: any, @Param('kredit_code') code: string) {
    const detail = await this.kreditService.DetailKredit(user, code);
    if (detail) {
      return detail;
    }
  }

  @Put(':kredit_code/status')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ChangeStatus(@User() user: any, @Body() body: ChangeStatusDto) {
    return await this.kreditService.ChangeStatus(user, body);
  }

  /** PEMBAYARAN */
  @Post('payment')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'bukti_payment', maxCount: 1 }], {
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
  async BayarKredit(
    @User() user: any,
    @Body() body: BayarKreditDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.kreditService.BayarKredit(user, body, files);
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(
    @User() user: any,
    @Query() param: KreditListDto,
    @Res() res,
  ) {
    try {
      const excelObjects = await this.kreditService.exportExcel(user, param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT. Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data kredit', {
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

      const fileName = `data_pengajuan_kredit.xlsx`;

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

  /**
   * MONTHLY REPORT
   */

  @Get('monthly_report/kredit')
  @ResponseStatusCode()
  @UserTypeAndLevel('owner.*')
  @AuthJwtGuard()
  async LaporanKredit(@User() user: any, @Query() query: any) {
    return await this.kreditService.LaporanKredit(user, query);
  }

  @Get('monthly_report/kredit/print')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async DownloadLaporankredit(
    @User() user: any,
    @Query() param: any,
    @Res() res,
  ) {
    try {
      const excelObjects = await this.kreditService.DownloadLaporankredit(
        user,
        param,
      );

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT. Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Laporan Kredit', {
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

      const fileName = `rekapitulasi_kredit.xlsx`;

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
}
