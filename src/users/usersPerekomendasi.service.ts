import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { updateRekomendasiDto } from './dto/profile.dto';
import { PerekomendasiDocument } from './../database/entities/perekomendasi.entities';
import { ResponseService } from 'src/response/response.service';
import { UsersService } from './users.service';

@Injectable()
export class UserPerekomendasiService {
  constructor(
    @InjectRepository(PerekomendasiDocument)
    private readonly rekoRepo: Repository<PerekomendasiDocument>,
    private readonly userService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  protected readonly logger = new Logger(UserPerekomendasiService.name);

  /**
   * PEREKOMENDASI
   */
  async perekomendasi(id) {
    try {
      const getPerekomendasi = await this.rekoRepo
        .createQueryBuilder('reko')
        .where(`user_id = :id`, { id: id })
        .getOne();

      return this.responseService.success(
        true,
        'Perekomendasi',
        getPerekomendasi ? getPerekomendasi : {},
      );
    } catch (error) {
      this.logger.log(error.message, 'Fetching perekomendasi is failed');
      throw error;
    }
  }

  async updatePerekomendasi(id, body: updateRekomendasiDto) {
    try {
      const verifyUser = await this.userService.getOne({ id: id });
      if (verifyUser) {
        const updated = { ...body, user_id: id };
        const saveUpdate = await this.rekoRepo.save(updated);
        if (saveUpdate) {
          return this.responseService.success(
            true,
            'user rekomendasi telah diperbaharui!',
          );
        }
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: id,
            property: 'user rekomendasi',
            constraint: ['user rekomendasi gagal diperbaharui!'],
          },
          'user rekomendasi gagal diperbaharui!',
        );
      }

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        {
          value: id,
          property: 'user profile',
          constraint: ['user profile tidak ditemukan!'],
        },
        'user profile tidak ditemukan',
      );
    } catch (error) {
      this.logger.log(error.message, 'pembaharuan profil tidak berhasil');
      throw error;
    }
  }
}
