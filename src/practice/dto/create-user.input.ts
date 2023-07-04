import { InputType, Field, Directive, Extensions } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { Role } from "src/role.enum";

@InputType()
export class CreateUserInput {
  @Directive("@lowercase")
  @Field({ nullable: false })
  @IsString()
  name: string;

  @Field()
  @IsString()
  email: string;

  @Extensions({ default: Role.USER })
  @Field()
  @IsOptional()
  role?: Role;

  // @Extensions({ default: Role.USER })
  // @Field()
  // @IsOptional()
  // role?: Role;
}
