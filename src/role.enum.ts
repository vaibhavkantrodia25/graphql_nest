import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  USER = 'user',
  AdMIN = 'admin',
}

registerEnumType(Role, {
  name: 'ROLE',
  description: 'roles',
});
