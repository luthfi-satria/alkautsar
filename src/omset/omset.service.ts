import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { OmsetDocument } from './entities/omset.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderService } from '../order/order.service';
import { KreditService } from '../kredit/kredit.service';
import { ResponseService } from '../response/response.service';
import { InvestorService } from '../investor/investor.service';
import { DatetimeHelper } from '../helper/datetime.helper';

@Injectable()
export class OmsetService {
  constructor(
    @InjectRepository(OmsetDocument)
    private readonly omsetRepo: Repository<OmsetDocument>,
    private readonly orderService: OrderService,
    private readonly kreditService: KreditService,
    private readonly investorService: InvestorService,
    private readonly responseService: ResponseService,
  ) {}

  async KalkulasiOmsetBulanan(date: string) {
    try {
      const currDate = new Date(date);
      const year = currDate.getFullYear();
      const month = currDate.getMonth() + 1;

      const getOmset = await this.omsetRepo.findOneBy({
        thn: year,
        bln: month,
      });

      const omsetGrosir = await this.orderService.MonthlyIncome(
        `${year}-${month}`,
      );

      const omsetKredit = await this.kreditService.MonthlyIncome(
        `${year}-${month}`,
      );

      const omsetGrosirValue = omsetGrosir?.monthly_income || 0;
      const omsetKreditValue = omsetKredit?.monthly_income || 0;

      const OmsetData: Partial<OmsetDocument> = {
        ...getOmset,
        bln: month,
        thn: year,
        omset_grosir: omsetGrosirValue,
        omset_kredit: omsetKreditValue,
        total_omset: omsetGrosirValue + omsetKreditValue,
      };

      const saveData = await this.omsetRepo.save(OmsetData).catch((error) => {
        throw error;
      });
      return this.responseService.success(
        true,
        'Omset telah dikalkulasi',
        saveData,
      );
    } catch (error) {
      Logger.log('[ERROR] KalkulasiOmsetBulanan => ', error);
      throw error;
    }
  }

  async OmsetBulanan(year: string) {
    try {
      const query = await this.omsetRepo
        .createQueryBuilder()
        .where({ thn: year })
        .orderBy('thn', 'ASC')
        .addOrderBy('bln', 'ASC')
        .getMany();

      return this.responseService.success(true, 'Omset Bulanan', query);
    } catch (error) {
      Logger.log('[ERROR] OmsetBulanan => ', error);
    }
  }

  async OmsetTahunan() {
    try {
      const currDate = new Date();
      const year = currDate.getFullYear();

      const query = await this.omsetRepo
        .createQueryBuilder()
        .select(['SUM(total_omset) as yearly_income', 'thn'])
        .where({ thn: MoreThanOrEqual(year - 5) })
        .groupBy('thn')
        .orderBy('thn', 'ASC')
        .getRawMany();

      return this.responseService.success(true, 'Yearly income', query);
    } catch (error) {
      Logger.log('[ERROR] OmsetTahunan => ', error);
    }
  }

  async PembagianHasil(year: string) {
    try {
      const { investor } = await this.investorService.ActiveInvestorListQuery();
      if (investor) {
        const omsetTahunan = await this.omsetRepo
          .createQueryBuilder()
          .select('SUM(total_omset) as yearlyOmset')
          .where({ thn: year })
          .groupBy('thn')
          .getRawOne();

        const { total_investasi } = await this.investorService.Statistics(year);
        let totalInvestor = 0;
        for (const items in investor) {
          const formulasi =
            (investor[items].inv_nilai * omsetTahunan?.yearlyOmset) /
            total_investasi;
          const bagi_hasil = formulasi * (65 / 100);
          totalInvestor += bagi_hasil;
          investor[items]['hasil'] = bagi_hasil;
        }
        const response = {
          omsetTahunan: omsetTahunan?.yearlyOmset,
          total_investasi: total_investasi,
          hasil_investor: totalInvestor,
          pengelola: omsetTahunan?.yearlyOmset - totalInvestor,
          investor: investor,
        };
        return this.responseService.success(true, 'Pembagian Hasil', response);
      }
      return;
    } catch (error) {
      Logger.log('[ERROR] Pembagian Hasil => ', error);
    }
  }

  /**
   * REPORT
   */
  async DownloadOmsetBulanan(year: string) {
    try {
      const omset = await this.OmsetBulanan(year);
      const excelObjects = await this.mapOmsetBulanan(omset);
      return excelObjects;
    } catch (error) {
      Logger.log('[ERROR] Download Omset Bulanan => ', error);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: '',
            constraint: ['Gagal mengunduh omset bulanan', error.message],
          },
          'Bad Request',
        ),
      );
    }
  }

  async mapOmsetBulanan(excelObjects) {
    if (!excelObjects && !excelObjects.data) {
      throw new NotFoundException('No data to download');
    }

    const rows = [
      [
        'No',
        'Bulan',
        'Tahun',
        'Omset Grosir',
        'Omset Kredit',
        'Total Omset',
        'Tanggal kalkulasi',
        'Tanggal Kalkulasi Ulang',
      ],
    ];

    if (excelObjects.data) {
      let i = 1;
      for (const items of excelObjects.data) {
        rows.push([
          i,
          DatetimeHelper.LocalMonth(items?.bln),
          items?.thn,
          items?.omset_grosir,
          items?.omset_kredit,
          items?.total_omset,
          DatetimeHelper.UTCToLocaleDate(items?.created_at),
          DatetimeHelper.UTCToLocaleDate(items?.updated_at),
        ]);
        i++;
      }
    } else {
      rows.push(['Tidak ada data yang dapat ditampilkan']);
    }

    return {
      rows: rows,
    };
  }

  async DownloadPembagianHasil(year: string) {
    try {
      const omset = await this.PembagianHasil(year);
      const excelObjects = await this.mapPembagianHasil(year, omset);
      return excelObjects;
    } catch (error) {
      Logger.log('[ERROR] Download Pembagian Hasil => ', error);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: '',
            constraint: ['Gagal mengunduh pembagian hasil', error.message],
          },
          'Bad Request',
        ),
      );
    }
  }

  async mapPembagianHasil(year, excelObjects) {
    if (!excelObjects && !excelObjects.data) {
      throw new NotFoundException('No data to download');
    }

    const rows = [
      [
        'No',
        'Investor',
        'Nilai Investasi',
        'Jangka Waktu',
        'Tanggal Investasi',
        'Hingga',
        'Pembagian Hasil (65%)',
      ],
    ];
    const obj = excelObjects.data;
    if (obj) {
      let i = 1;
      for (const items of obj?.investor) {
        rows.push([
          i,
          items?.profile_name,
          items?.inv_nilai,
          items?.inv_jangka_waktu,
          DatetimeHelper.UTCToLocaleDate(items?.inv_tanggal_investasi),
          DatetimeHelper.UTCToLocaleDate(items?.inv_tanggal_kadaluarsa),
          items?.hasil,
        ]);
        i++;
      }

      rows.push(['', '', '', '', '', 'Total Investasi', obj?.total_investasi]);
      rows.push(['', '', '', '', '', 'Omset tahun ' + year, obj?.omsetTahunan]);
      rows.push(['', '', '', '', '', 'Investor (65%) ', obj?.hasil_investor]);
      rows.push(['', '', '', '', '', 'Pengelola (35%) ', obj?.pengelola]);
    } else {
      rows.push(['Tidak ada data yang dapat ditampilkan']);
    }

    return {
      rows: rows,
    };
  }
}
