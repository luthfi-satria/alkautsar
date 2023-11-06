import { Controller, Get, Query, Res, UseInterceptors } from '@nestjs/common';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserTypeAndLevel } from '../hash/guard/user-type-and-level.decorator';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { KreditHistoryListDto } from '../kredit/dto/kredit.dto';
import { HistoryKreditService } from './history_kredit.service';
import { UserType } from '../hash/guard/user-type.decorator';
import ExcelJS from 'exceljs';

@Controller('api/angsuran')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class HistoryKreditController {
  constructor(private readonly historyService: HistoryKreditService) {}

  @Get('')
  @ResponseStatusCode()
  @UserTypeAndLevel('owner.*')
  @AuthJwtGuard()
  async ListHistoryKredit(
    @User() user: any,
    @Query() query: KreditHistoryListDto,
  ) {
    return await this.historyService.ListHistoryKredit(user, query);
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(
    @User() user: any,
    @Query() param: KreditHistoryListDto,
    @Res() res,
  ) {
    try {
      const excelObjects = await this.historyService.exportExcel(user, param);

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

      const fileName = `riwayat_angsuran.xlsx`;

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
