import { Injectable, Logger } from '@nestjs/common';
import { UsergroupService } from '../usergroup/usergroup.service';
import { AppmenuService } from '../appmenu/appmenu.service';
import { Cron } from '@nestjs/schedule';
import { AppconfigService } from '../appconfig/appconfig.service';

@Injectable()
export class SchedullerService {
  constructor(
    private readonly usergroupService: UsergroupService,
    private readonly appmenuService: AppmenuService,
    private readonly appconfigService: AppconfigService,
  ) {}

  Logger = new Logger(SchedullerService.name);

  /**
   * Synchroinizing apps config into redis storage every hour
   * @returns
   */
  @Cron('0 0 * * * *', {
    name: 'synchronize application configs',
  })
  async AppConfigHandle() {
    console.log('synchronizing application config');
    return await this.appconfigService.synchronize();
  }

  // @Cron('45 * * * * *', {
  //   name: 'Syncronize usergroup',
  // })
  async UsergroupHandle() {
    this.Logger.log('cron is running every 45s');
  }
}
