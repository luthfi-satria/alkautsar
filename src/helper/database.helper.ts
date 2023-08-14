import { Injectable } from '@nestjs/common';

@Injectable()
export class DBHelper {
  // static NewObjectID(value: string) {
  //   return new mongoose.Types.ObjectId(value);
  // }
  // static toMongoObjectId({ value, key }) {
  //   if (
  //     Types.ObjectId.isValid(value) &&
  //     new Types.ObjectId(value).toString() === value
  //   ) {
  //     return new Types.ObjectId(value);
  //   }
  //   return `${value} is not a valid format, should be use ${key} properties`;
  // }
}
