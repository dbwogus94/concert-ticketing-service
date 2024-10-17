import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
