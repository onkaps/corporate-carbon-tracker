import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  employeeId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.employee.findUnique({
      where: { id: payload.sub },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user object (will be attached to request.user)
    return {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position,
      isAdmin: user.isAdmin,
      companyId: user.companyId,
      company: user.company,
    };
  }
}