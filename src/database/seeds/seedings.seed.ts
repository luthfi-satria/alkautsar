import { Command, Positional } from 'nestjs-command';
import { UsergroupService } from '../../usergroup/usergroup.service';
import { Injectable } from '@nestjs/common';
import { AppmenuService } from '../../appmenu/appmenu.service';
import { UsersService } from '../../users/users.service';
import { AppconfigService } from '../../appconfig/appconfig.service';

@Injectable()
export class SeedingDB {
  constructor(
    private readonly usergroupService: UsergroupService,
    private readonly appmenuService: AppmenuService,
    private readonly userService: UsersService,
    private readonly appconfigService: AppconfigService,
  ) {}

  @Command({
    command: 'seeding:initial',
    describe: 'seeding all requirement data',
  })
  async initialization() {
    await this.appconfigService.seeding();
    await this.usergroupService.seeding();
  }

  @Command({
    command: 'seeding:admin',
    describe: 'seeding admin data',
  })
  async createAdmin() {
    const createAdmin = await this.userService.createAdmin();
    return createAdmin;
  }

  @Command({
    command: 'seeding:usergroup',
    describe: 'seeding usergroup',
  })
  async createGroup() {
    const seeds = await this.usergroupService.seeding();
    return seeds;
  }

  @Command({
    command: 'seeding:config',
    describe: 'seeding application configuration',
  })
  async createAppconfig() {
    const seeds = await this.appconfigService.seeding();
    return seeds;
  }

  @Command({
    command: 'seeding:appmenu',
    describe: 'seeding appmenu',
  })
  async createMenu() {
    const seeds = await this.appmenuService.seeding();
    return seeds;
  }

  @Command({
    command: 'seeding:users <amount>',
    describe: 'seeding users',
  })
  async createUser(
    @Positional({
      name: 'amount',
      describe: 'Amount of user creation',
      type: 'string',
    })
    amount: string,
  ) {
    const seeds = await this.userService.seeding(Number(amount));
    return seeds;
  }
}
