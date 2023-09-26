import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUsersDto,
  GetUserDetail,
  ListUser,
  UpdateUserDto,
} from './dto/users.dto';
import { ResponseStatusCode } from '../response/response.decorator';
import { UserType } from '../hash/guard/user-type.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { User } from '../auth/auth.decorator';
import { ResponseService } from '../response/response.service';
import { AppconfigInterceptor } from '../appconfig/appconfig.interceptor';
import {
  updatePekerjaanDto,
  updateProfileDto,
  updateRekomendasiDto,
} from './dto/profile.dto';
import { UserPerekomendasiService } from './usersPerekomendasi.service';
import { UserPekerjaanService } from './usersPekerjaan.service';
import { UserTypeAndLevel } from '../hash/guard/user-type-and-level.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../helper/utility.helper';
import * as fs from 'fs';
import { UserProfileDocuments } from '../database/entities/profile.entities';
import { join } from 'path';
import * as mimeType from 'mime-types';
import ExcelJS from 'exceljs';

@Controller('api/user')
@UseInterceptors(AppconfigInterceptor)
@ResponseStatusCode()
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly rekomendasiService: UserPerekomendasiService,
    private readonly pekerjaanService: UserPekerjaanService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('register')
  @ResponseStatusCode()
  async register(@Body() payload: CreateUsersDto) {
    return this.userService.register(payload);
  }

  @Post('createAdmin')
  @ResponseStatusCode()
  async createAdmin() {
    return this.userService.createAdmin();
  }

  @Get()
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  async listUser(@Query() param: ListUser) {
    return await this.userService.listUser(param);
  }

  @Get('profile/:id')
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  async detail(@Param() user: GetUserDetail) {
    return await this.userService.profile(user.id);
  }

  @Post('find_profile')
  @ResponseStatusCode()
  @UserType('owner')
  @AuthJwtGuard()
  async findProfile(@Body() body: any) {
    try {
      const profile = await this.userService
        .findOne('profile.phone = :phone_numb', {
          phone_numb: body.phone,
        })
        .catch((error) => {
          console.log(error);
          throw error;
        });

      if (profile && Object.keys(profile).length > 0) {
        delete profile?.password;
        delete profile?.token_reset_password;
      }
      return this.responseService.success(true, 'Data akun', profile || {});
    } catch (error) {
      Logger.log(error);
      return error;
    }
  }

  @Get('profile')
  @ResponseStatusCode()
  @UserTypeAndLevel('owner.*', 'organisasi.*', 'public.*')
  @AuthJwtGuard()
  async profile(@User() user: any) {
    return await this.userService.profile(user.id);
  }

  @Put('profile')
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async updateProfile(@User() user: any, @Body() body: updateProfileDto) {
    return await this.userService.update(user.id, body);
  }

  @Put('profile/:id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async update(@Param() param: GetUserDetail, @Body() body: updateProfileDto) {
    return await this.userService.update(param.id, body);
  }

  @Put('login_account/:id')
  @UserType('owner')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async updateLoginAccount(
    @Param() param: GetUserDetail,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.updateUserLogin(param.id, body);
  }

  /**
   * UPLOAD FOTO
   */

  @Post('photo/:id')
  @UseInterceptors(
    FileInterceptor('photo', {
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
  @UserTypeAndLevel('owner.*', 'organisasi.*', 'public.*')
  @AuthJwtGuard()
  @ResponseStatusCode()
  async uploadFoto(
    @Param() param: GetUserDetail,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.uploadImage(param.id, file);
  }

  @Get('photo/:id/:name')
  // @UserTypeAndLevel('owner.*', 'organisasi.*', 'public.*')
  // @AuthJwtGuard()
  @ResponseStatusCode()
  async readFoto(
    @Param('id') id: string,
    @Param('name') name: string,
    @Res() res,
  ) {
    const profile: Partial<UserProfileDocuments> =
      await this.userService.readPhoto(id);
    if (profile) {
      const file_path = `uploads/photos/${profile.user_id}/${profile.photo}`;
      if (fs.existsSync(`./${file_path}`)) {
        const file = fs.createReadStream(join(process.cwd(), file_path));
        res.set({
          'Content-Type': mimeType.lookup(file_path),
          'Content-Disposition': `attachment; filename="${profile.photo}"`,
        });
        file.pipe(res);
      }
    }
    // return not found;
    return profile;
  }

  /**
   * PEREKOMENDASI
   */
  @Get('perekomendasi')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async perekomendasi(@User() user: any) {
    return await this.rekomendasiService.perekomendasi(user.id);
  }

  @Put('perekomendasi')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async updatePerekomendasi(
    @User() user: any,
    @Body() body: updateRekomendasiDto,
  ) {
    return await this.rekomendasiService.updatePerekomendasi(user.id, body);
  }

  /**
   * PEKERJAAN
   */
  @Get('pekerjaan')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async pekerjaan(@User() user: any) {
    return await this.pekerjaanService.pekerjaan(user.id);
  }

  @Put('pekerjaan')
  @ResponseStatusCode()
  @UserType('owner', 'organisasi', 'public')
  @AuthJwtGuard()
  async updatePekerjaan(@User() user: any, @Body() body: updatePekerjaanDto) {
    return await this.pekerjaanService.updatePekerjaan(user.id, body);
  }

  /** REPORTS */
  @Get('report')
  @AuthJwtGuard()
  @UserType('owner', 'organisasi')
  @ResponseStatusCode()
  async exportExcel(@Query() param: ListUser, @Res() res) {
    try {
      const excelObjects = await this.userService.exportExcel(param);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'PT. Laju Investama';

      // add worksheet
      const mySheet = workbook.addWorksheet('Data user', {
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

      const fileName = `data_user.xlsx`;

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
