import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgetPassword } from './dto/forget-password.dto';
import { ProfileAddDto } from './dto/profile-add.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { VerifyOtpDTO } from './dto/verify-otp.dto';
import { ResendOTP } from './dto/resend-otp.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';

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
  async verifyOTP(@Body() body: VerifyOtpDTO) {
    try {
      const { email, otp } = body;
      const result = await this.usersService.verifyOTP(email, otp);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('resend_otp')
  async resendOTP(@Body() body: ResendOTP) {
    try {
      const result = await this.usersService.resendOTP(body.email);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('update_password')
  async updatePassword(@Body() body: UpdatePasswordDTO) {
    try {
      const { password, userId, email} = body;
      const result = await this.usersService.changePassword(email, userId, password);
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
      const {user_id} = req.auth     
      const result = await this.usersService.addProfile(profileData, user_id);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('get_profile_details')
  @UseGuards(AuthGuard)
  async getProfileDetails(@Req() req : any) {   
    const {user_id} = req.auth 
    try {         
      const result = await this.usersService.getProfileDetails(user_id);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Put('update_profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Body() updateProfileDto : UpdateProfileDto,  @Req() req : any) {
    try {
      const {user_id} = req.auth     
      const result = await this.usersService.updateProfile(updateProfileDto, user_id);
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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateProfileDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
