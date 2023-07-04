import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/role.enum';

@ObjectType()
export class UserR {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  role?: Role;
}
