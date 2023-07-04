import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { DeleteResponse } from './dto/delete-response';
import { createReadStream, createWriteStream } from 'fs';
import { UserR } from './dto/userresolvers';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'graphql-upload';
import * as mimeTypes from 'mime-types';
import { PubSub } from 'graphql-subscriptions';
import { UserService } from './user.service';
const pubSub = new PubSub();

@Resolver((of) => User)
export class UserResolver {
  private pubSub: PubSub;
  constructor(private readonly userService: UserService) {
    this.pubSub = new PubSub();
  }

  @Mutation(() => UserR)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    const result = await this.userService.create(createUserInput);
    pubSub.publish('emailAdded', { emailAdded: result.email });
    return result;
  }

  @Subscription((returns) => String)
  emailAdded() {
    return pubSub.asyncIterator('emailAdded');
  }

  @Query(() => [UserR], { name: 'findAll' })
  async findAll(
    @Args('search_text', { type: () => String }) name: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.userService.findAll(name, page, limit);
  }

  @Query(() => UserR, { name: 'findOne' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => Boolean)
  async updatePractice(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.userService.update(id, input);
  }

  @Mutation(() => DeleteResponse)
  removePractice(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<DeleteResponse> {
    return this.userService.remove(id);
  }

  // single file
  @Mutation(() => String, { name: 'fileupload' })
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<string> {
    try {
      const fileStream = createReadStream();

      const mimeType = mimeTypes.lookup(filename);
      if (mimeType !== 'image/png') {
        throw new Error('Please choose a PNG file');
      }
      const writeStream = createWriteStream(
        `src/practice/uploads/${Date.now()}-${filename}`,
      );

      await fileStream.pipe(writeStream);

      return 'File uploaded successfully';
    } catch (error) {
      throw new Error('Please choose a PNG file');
    }
  }

  @Mutation(() => String, { name: 'fileuploads' })
  async uploadFiles(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: FileUpload[],
  ): Promise<string> {
    try {
      const resolvedFiles = await Promise.all(files);

      for (const file of resolvedFiles) {
        const { createReadStream, filename } = file;
        const fileStream = createReadStream();

        if (!filename.endsWith('.png')) {
          throw new Error('Please choose a png file');
        }

        const writeStream = createWriteStream(
          `src/practice/uploads/${Date.now()}-${filename}`,
        );

        await fileStream.pipe(writeStream);
      }
      return 'Files uploaded successfully';
    } catch (error) {
      throw new Error('Please choose a png file');
    }
  }
}
