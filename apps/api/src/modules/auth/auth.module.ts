import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User } from '../core/entities/user.entity';
import { Role } from '../core/entities/role.entity';
import { Permission } from '../core/entities/permission.entity';
import { UserRole } from '../core/entities/user-role.entity';
import { Audit } from '../core/entities/audit.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Permission, UserRole, Audit]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'afya-c-secret-key'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY', '15m') },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
