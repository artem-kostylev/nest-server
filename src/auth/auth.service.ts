import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userService.login(loginAuthDto.email);
    if (!user) throw new BadRequestException('Email or password is incorrect');

    const checkPassword = await compare(loginAuthDto.password, user.password);
    if (!checkPassword) throw new BadRequestException('Email or password is incorrect');

    delete user.password;

    const token = this.jwtService.sign({ id: user.id });

    return { user, token };
  }

  async profile(id: number) {
    const user = await this.userService.profile(id);
    if (!user) throw new UnauthorizedException();

    return { user };
  }
}
