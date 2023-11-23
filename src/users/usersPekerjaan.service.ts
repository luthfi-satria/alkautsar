import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { updatePekerjaanDto } from './dto/profile.dto';
import { PekerjaanDocument } from './../database/entities/pekerjaan.entities';
import { ResponseService } from 'src/response/response.service';
import { UsersService } from './users.service';

@Injectable()
export class UserPekerjaanService {
  constructor(
    @InjectRepository(PekerjaanDocument)
    private readonly pekerjaanRepo: Repository<PekerjaanDocument>,
    private readonly userService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  protected readonly logger = new Logger(UserPekerjaanService.name);

  /**
   * PEKERJAAN
   */
  async pekerjaan(id) {
    try {
      const getPekerjaan = await this.pekerjaanRepo
        .createQueryBuilder('pekerjaan')
        .where(`user_id = :id`, { id: id })
        .getOne();

      return this.responseService.success(
        true,
        'Pekerjaan',
        getPekerjaan ? getPekerjaan : {},
      );
    } catch (error) {
      this.logger.log(error.message, 'Mengambil data pekerjaan gagal');
      throw error;
    }
  }

  async updatePekerjaan(id, body: updatePekerjaanDto) {
    try {
      const verifyUser = await this.userService.getOne({ id: id });
      if (verifyUser) {
        const updated = { ...body, user_id: id };
        const saveUpdate = await this.pekerjaanRepo.save(updated);
        if (saveUpdate) {
          return this.responseService.success(
            true,
            'pekerjaan telah diperbaharui!',
          );
        }
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'Pekerjaan',
            constraint: ['Pekerjaan gagal diperbaharui!'],
          },
          'Pekerjaan gagal diperbaharui!',
        );
      }

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'Akun',
          constraint: ['Akun tidak ditemukan!'],
        },
        'Akun tidak ditemukan',
      );
    } catch (error) {
      this.logger.log(error.message, 'pembaharuan pekerjaan tidak berhasil');
      throw error;
    }
  }
}
