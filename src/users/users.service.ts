import {
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import * as nodeMailer from 'nodemailer';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgetPassword } from './dto/forget-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ProfileAddDto } from './dto/profile-add.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async registerUser(createUserDto: RegisterUserDto) {
    try {
      if (!createUserDto) {
        throw new HttpException(
          'User registration details are missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      const alreadyExists = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (alreadyExists) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const hash_password = await bcrypt.hash(createUserDto.password, 12);

      const otp = Math.floor(1000 + Math.random() * 9000);

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hash_password,
          otp_verified: false,
          active: false,
          user_otp: otp,
          device_token: createUserDto.device_token,
        },
      });

      await this.sendEmail(
        user,
        'Welcome and verify your email.',
        'Thank for joining us please verify email with code',
        otp,
      );

      delete user.password;
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data: user,
        message: "User registered successfully"
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
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
    });

    const emailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: subject,
      text: message,
    };

    emailOptions.text += ' Your Notification Code is : ' + otp;

    await transporter.sendMail(emailOptions);
  }


  async loginUser(payload: LoginUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!user) {
        throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
      }
      if (!user.active) {
        throw new HttpException('User email is not verified. Please verify your email before login.', HttpStatus.FORBIDDEN);
      }
      const passwordMatches = await bcrypt.compare(payload.password, user.password);
      if (!passwordMatches) {
        throw new HttpException('Invalid email or password',
          HttpStatus.UNAUTHORIZED // 401 - Unauthorized
        );
      }

      const jwtPayload = {
        user_id: user.id,
      };

      const token = await this.jwtService.signAsync(jwtPayload);
      const { password: userPassword, ...userData } = user;

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Login successfull",
        data: {
          ...userData,
          token,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async forgetPassword(payload: ForgetPassword) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST)
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await this.prisma.user.update({
        where: { email: payload.email },
        data: { user_otp: otp, otp_verified: false, user_otp_createdAt: new Date() }
      });

      await this.sendEmail(
        user,
        'Password Reset',
        'Password reset OTP is ',
        otp,
      );
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Email sent with OTP for password reset',
        data: null
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verifyOTP(email: string, otp: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }

      if (user.user_otp !== parseInt(otp)) {
        throw new HttpException(
          'Invalid OTP',
          HttpStatus.NOT_ACCEPTABLE
        )
      }

      const otpCreatedAt = user.user_otp_createdAt;
      const timeDifference = new Date().getTime() - otpCreatedAt.getTime();
      const otpValidityDuration = 1 * 60 * 1000;

      if (timeDifference > otpValidityDuration) {
        throw new HttpException("OTP expired", HttpStatus.NOT_ACCEPTABLE);
      }

      // Update user as OTP is verified
      await this.prisma.user.update({
        where: { email },
        data: { otp_verified: true, active : true},
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'OTP verified successfully',
        data: { user_id: user.id },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async resendOTP(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await this.prisma.user.update({
        where: { email: email },
        data: { user_otp: otp, otp_verified: false, user_otp_createdAt : new Date() },
      });

      await this.sendEmail(
        user,
        'Password Reset',
        'Password reset OTP is ',
        otp,
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Email resent with OTP for password reset',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changePassword({email, otp, password, user_id} : UpdatePasswordDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id, email },
      });


      if (!user) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }
      
      if (user.user_otp !== parseInt(otp)) {
        throw new HttpException(
          'Invalid OTP',
          HttpStatus.UNAUTHORIZED
        )
      }

      if (user.otp_verified === false) {
        throw new HttpException(
          'OTP is not verified',
          HttpStatus.UNAUTHORIZED
        )
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      await this.prisma.user.update({
        where: { id: user_id, email },
        data: { password: hashedPassword, otp_verified : false},
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Password updated successfully',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async addProfile(profileData: ProfileAddDto, user_id: number) {
    try {
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: user_id },
      });


      if (!isUserExists) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }

      const newProfile = await this.prisma.userDetails.upsert({
        where: { user_id },
        create: {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          dateofbirth: new Date(profileData.date_of_birth),
          gender: profileData.gender,
          phonenumber: profileData.phone_number,
          user: { connect: { id: user_id } }, // Optional: Connect user_id to UserDetails
        },
        update: {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          dateofbirth: new Date(profileData.date_of_birth),
          gender: profileData.gender,
          phonenumber: profileData.phone_number,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        data: newProfile,
        message: "profile added succssfully"
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getProfileDetails(user_id: number) {
    try {
      const userDetails = await this.prisma.userDetails.findUnique({
        where: { user_id },
      });

      if (userDetails) {
        return {
          success: true,
          statusCode: HttpStatus.OK,
          data: userDetails,
          message: "User details fetched successfully"
        };
      } else {
        throw new HttpException(
          'Profile details not found',
          HttpStatus.NOT_FOUND
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateProfile(profileData: UpdateProfileDto, user_id: number) {
    try {
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!isUserExists) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }

      const userDetails = await this.prisma.userDetails.findUnique({
        where: { user_id },
      });

      if (!userDetails) {
        throw new HttpException(
          'Profile details not found',
          HttpStatus.NOT_FOUND
        )
      }

      const updatedProfile = await this.prisma.userDetails.update({
        where: { user_id },
        data: {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          dateofbirth: new Date(profileData.date_of_birth),
          gender: profileData.gender,
          phonenumber: profileData.phone_number,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: updatedProfile,
        message: "profile updated successfully"
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
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
