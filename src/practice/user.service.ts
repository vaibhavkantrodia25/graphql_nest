import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { error } from 'console';
import { DeleteResponse } from './dto/delete-response';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userTable: Repository<User>,
  ) {}

  create(createUserInput: CreateUserInput) {
    const newP = this.userTable.create({
      name: createUserInput.name,
      email: createUserInput.email,
    });

    return this.userTable.save(newP);
  }

  async findAll(name: string, page?: number, limit?: number) {
    try {
      limit = limit || 1;
      const skip = page ? (page - 1) * limit : 0;

      const getPP = this.userTable
        .createQueryBuilder('user')
        .select(['user.id', 'user.name', 'user.role']);

      if (name) {
        getPP.where('user.name LIKE :name', { name: `%${name}%` });
      }

      if (page) {
        getPP.skip(skip).take(limit);
      }

      const results = await getPP.getMany();

      if (results.length === 0) {
        throw new Error('Name not found');
      }

      return results;
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: number) {
    const getOne = this.userTable.findOneBy({ id });
    if (!getOne) {
      throw new HttpException('not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return getOne;
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    const getOne = await this.userTable.findOneBy({ id }); // Await the result of findOneBy

    if (!getOne) {
      throw new NotFoundException('User not found'); // Throw NotFoundException instead of HttpException
    }

    const user = new User();
    user.name = updateUserInput.name;
    user.email = updateUserInput.email;

    const newName = await this.userTable.update(id, user);
    console.log(newName);

    return newName ? true : false;
  }

  async remove(id: number): Promise<DeleteResponse> {
    const getOne = await this.userTable.findOneBy({ id });
    const delOne = await this.userTable.delete({ id });
    console.log(delOne);

    return {
      message: 'Deleted',
    };
  }
}
