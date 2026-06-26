import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../core/entities/user.entity';
import { Role } from '../../core/entities/role.entity';
import { Permission } from '../../core/entities/permission.entity';
import { UserRole } from '../../core/entities/user-role.entity';
import { Audit } from '../../core/entities/audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, UserRole, Audit]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'afya-c-secret-key'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY', '15m') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class CoreModule {}
