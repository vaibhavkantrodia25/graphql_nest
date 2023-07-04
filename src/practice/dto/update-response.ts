import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UpdateResonse {
  @Field()
  code: number;

  @Field()
  msg: string;

  @Field()
  data?: User;
}
