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
import { InvestorService } from './investor.service';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import ExcelJS from 'exceljs';
import {
  CreateInvestorDto,
  InvestorIdDto,
  ListInvestorDto,
  UpdateInvestorDto,
} from './dto/investor.dto';

@Controller('api/investor')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Get('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ListInvestor(@Query() query: ListInvestorDto) {
    return await this.investorService.ListInvestor(query);
  }

  @Get(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DetailInvestor(@Param() param: InvestorIdDto) {
    return await this.investorService.DetailInvestor(param.id);
  }

  @Post('')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async CreateInvestor(@Body() body: CreateInvestorDto) {
    return await this.investorService.CreateInvestor(body);
  }

  @Put(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async UpdateInvestor(
    @Param() param: InvestorIdDto,
    @Body() body: UpdateInvestorDto,
  ) {
    return await this.investorService.UpdateInvestor(param.id, body);
  }

  @Patch(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async Reactivate(@Param() param: InvestorIdDto) {
    return await this.investorService.ReactivateInvestor(param.id);
  }

  @Delete(':id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async DeleteInvestor(@Param() param: InvestorIdDto) {
    return await this.investorService.DeleteInvestor(param.id);
  }

  @Patch('restore/:id')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async RestoreInvestor(@Param() param: InvestorIdDto) {
    return await this.investorService.RestoreInvestor(param.id);
  }

  /** REPORTS */
  @Get('print/report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(@Query() param: ListInvestorDto, @Res() res) {
    try {
      const excelObjects = await this.investorService.exportExcel(param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT.Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data investor', {
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

      const fileName = `data_investor.xlsx`;

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
   * LAPORAN INVESTOR AKTIF
   */

  @Get('active/list')
  @ResponseStatusCode()
  @UserType()
  @AuthJwtGuard()
  async ActiveInvestorList() {
    return await this.investorService.ActiveInvestorList();
  }
}
