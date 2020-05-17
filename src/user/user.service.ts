import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async find() {
    const users = await this.userRepository.find();
    return { users };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();

    return { user };
  }

  async create(createUserDto: CreateUserDto) {
    const exists = await this.userRepository.findOne({ email: createUserDto.email });
    if (exists) throw new BadRequestException('User already exists');

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    delete user.password;

    return { user };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();

    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);

    return { user };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) throw new NotFoundException();

    await this.userRepository.remove(user);

    user.id = id;
    return { user };
  }

  async login(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async profile(id: number) {
    return await this.userRepository.findOne(id);
  }
}
