import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UsergroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  is_default: boolean;
}

export class GetUsergroupID {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
