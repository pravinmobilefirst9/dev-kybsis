import { Body, HttpException, HttpStatus, Injectable, Post, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client';
import * as nodeMailer from 'nodemailer'
import otpGenerator from 'otp-generator';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgetPassword } from './dto/forget-password.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/auth.guard';
import { ProfileAddDto } from './dto/profile-add.dto';

@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    ) { }


  async registerUser(createUserDto: RegisterUserDto) {

    if (!createUserDto) {
      throw new HttpException("User registration details are missing", HttpStatus.BAD_REQUEST)
    }

    const alreadyExists = await this.prisma.user.findUnique({ where: { email: createUserDto.email } })

    if (alreadyExists) {
      throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST)
    }

    const hash_password = await bcrypt.hash(createUserDto.password, 10);

    const otp = Math.floor(1000 + Math.random() * 9000);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hash_password,
        otp_verified: false,
        active: false,
        user_otp: otp,
        device_token: createUserDto.device_token
      }
    })


    await this.sendEmail(user, "Welcome and verify your email.", "Thank for joining us please verify email with code", otp);

    delete user.password
    return user;
  }

  async sendEmail(user: User, subject: string, message: string, otp: number) {

    const transporter = nodeMailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      // secure: true, // Convert to boolean if needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const emailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: subject,
      text: message
    };

    emailOptions.text += " Your Notification Code is : " + otp;

    await transporter.sendMail(emailOptions)
  }

  async loginUser(payload: LoginUserDto) {
    // Check if the email exists in the database
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check if the provided password matches the hashed password in the database
    const passwordMatches = await bcrypt.compare(payload.password, user.password);

    if (!passwordMatches) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const jwtPayload = {
      user_id: user.id
    };
    const token = await this.jwtService.signAsync(jwtPayload);
    // If the email and password are correct, return the user data (without sensitive info)
    const { password: userPassword, ...userData} = user;
    
    return {...userData, token};
  }

  async forgetPassword(payload: ForgetPassword) {
    // Check if the email exists in the database
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    const otp = Math.floor(1000 + Math.random() * 9000);

    if (!user) {
      throw new HttpException('Invalid email', HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.user.update({
      where: { email: payload.email },
      data: {
        user_otp: otp
      }
    })

    await this.sendEmail(user, "Password Reset", "Password reset OTP is ", otp);
    return true;
  }

  async verifyOTP(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.user_otp !== parseInt(otp)) {
      throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
    }

    // Update user as OTP is verified
    await this.prisma.user.update({
      where: { email },
      data: { otp_verified: true, user_otp: parseInt(otp)}, // Clear OTP after verification
    });

    return {message : 'OTP verified successfully', user_id : user.id };
  }

  async changePassword(email : string, user_id: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id : user_id, email} });

    if (!email || !user_id || !password) {
      throw new HttpException('All fields are mendetory', HttpStatus.BAD_REQUEST); 
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    await this.prisma.user.update({
      where: { id : user_id, email},
      data: { password: hashedPassword },
    });

    return 'Password updated successfully';
  }

  async addProfile(profileData : ProfileAddDto, user_id : number){
    const isUserExists = await this.prisma.user.findUnique({where : {id : user_id}})

    if (!isUserExists) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    try {

      const newProfile = await this.prisma.userDetails.create({
        data : {
          firstname : profileData.firstname,
          lastname : profileData.lastname,
          dateofbirth : new Date(profileData.date_of_birth),
          gender : profileData.gender,
          phonenumber : profileData.phone_number,
          user_id : user_id
        }
      })
        return newProfile
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProfileDetails(user_id : number){
    const isUserExists = await this.prisma.userDetails.findUnique({
      where : {
        user_id
      }
    })
    
    if (isUserExists) {
      return {message: "profile details already exists", user : isUserExists}
    }
    else{
      return {message : "profile details does not exists"}
    }
  }


  async updateProfile(profileData : UpdateProfileDto, user_id : number){
    const isUserExists = await this.prisma.user.findUnique({where : {id : user_id}})

    if (!isUserExists) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      const userDetails = await this.prisma.userDetails.findUnique({
        where : {
          user_id : user_id
        }
      })

      if (!userDetails) {
        throw new HttpException('User details not found', HttpStatus.NOT_FOUND);
      }

      const updatedProfile = await this.prisma.userDetails.update({
        where:{
          user_id : user_id
        },
        data : {
          firstname : profileData.firstname,
          lastname : profileData.lastname,
          dateofbirth : new Date(profileData.date_of_birth),
          gender : profileData.gender,
          phonenumber : profileData.phone_number,
          user_id : user_id
        }
      })
        return updatedProfile
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }








  create(createUserDto: RegisterUserDto) {
    return createUserDto;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateProfileDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
