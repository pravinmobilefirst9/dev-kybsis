import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgetPassword } from './dto/forget-password.dto';
import { ProfileAddDto } from './dto/profile-add.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('user_registration')
  registerUser(@Body() createUserDto: RegisterUserDto) {
    return this.usersService.registerUser(createUserDto);
  }


  @Post('login')
  loginUser(@Body() createUserDto: LoginUserDto) {
    return this.usersService.loginUser(createUserDto);
  }  
 
  @Post('forgot_password')
  forgetPassword(@Body() forgotPasswordDTO: ForgetPassword) {
    return this.usersService.forgetPassword(forgotPasswordDTO);
  }  
 
  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string, otp: string }) {
    try {
      const { email, otp } = body;
      const result = await this.usersService.verifyOTP(email, otp);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('update_password')
  async updatePassword(@Body() body: { email : string, user_id: number, password : string }) {
    try {
      const { password, user_id, email} = body;
      const result = await this.usersService.changePassword(email, user_id, password);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  
  @Post('add_profile_details')
  @UseGuards(AuthGuard)
  async profileAdd(
    @Body() profileData : ProfileAddDto, @Req() req : any
  ){
    try {
      console.log(req.body);
      
      const result = await this.usersService.addProfile(profileData);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  @Post()
  create(@Body() createUserDto: RegisterUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
