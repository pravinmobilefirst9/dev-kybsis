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

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // async registerUser(createUserDto: RegisterUserDto) {

  //   if (!createUserDto) {
  //     throw new HttpException("User registration details are missing", HttpStatus.BAD_REQUEST)
  //   }

  //   const alreadyExists = await this.prisma.user.findUnique({ where: { email: createUserDto.email } })

  //   if (alreadyExists) {
  //     throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST)
  //   }

  //   const hash_password = await bcrypt.hash(createUserDto.password, 10);

  //   const otp = Math.floor(1000 + Math.random() * 9000);

  //   const user = await this.prisma.user.create({
  //     data: {
  //       email: createUserDto.email,
  //       password: hash_password,
  //       otp_verified: false,
  //       active: false,
  //       user_otp: otp,
  //       device_token: createUserDto.device_token
  //     }
  //   })

  //   await this.sendEmail(user, "Welcome and verify your email.", "Thank for joining us please verify email with code", otp);

  //   delete user.password
  //   return user;
  // }
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
        return {
          status: 'failure',
          data: { message: 'Email already exists' },
        };
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
        status: 'success',
        data: user,
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message:
            'An error occurred during registration, please try again later',
        },
      };
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

  // async loginUser(payload: LoginUserDto) {
  //   // Check if the email exists in the database
  //   const user = await this.prisma.user.findUnique({ where: { email: payload.email } });

  //   if (!user) {
  //     throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  //   }

  //   // Check if the provided password matches the hashed password in the database
  //   const passwordMatches = await bcrypt.compare(payload.password, user.password);

  //   if (!passwordMatches) {
  //     throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  //   }

  //   const jwtPayload = {
  //     user_id: user.id
  //   };
  //   const token = await this.jwtService.signAsync(jwtPayload);
  //   // If the email and password are correct, return the user data (without sensitive info)
  //   const { password: userPassword, ...userData} = user;

  //   return {...userData, token};
  // }
  async loginUser(payload: LoginUserDto) {
    try {
      // Check if the email exists in the database
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return {
          status: 'failure',
          data: { message: 'Invalid email or password' },
        };
      }
            
      if (!user.otp_verified) {
        return {
          status: 'failure',
          data: { message: 'User email is not verified, Please try again' },
        };
      }

      // Check if the provided password matches the hashed password in the database
      const passwordMatches = await bcrypt.compare(
        payload.password,
        user.password,
      );

      if (!passwordMatches) {
        return {
          status: 'failure',
          data: { message: 'Invalid email or password' },
        };
      }

      const jwtPayload = {
        user_id: user.id,
      };

      const token = await this.jwtService.signAsync(jwtPayload);
      const { password: userPassword, ...userData } = user;
      return {
        status: 'success',
        data: {
          ...userData,
          token,
        },
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message: 'An error occurred during login, please try again later',
        },
      };
    }
  }

  async forgetPassword(payload: ForgetPassword) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return {
          status: 'failure',
          data: { message: 'Invalid email' },
        };
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await this.prisma.user.update({
        where: { email: payload.email },
        data: { user_otp: otp },
      });

      await this.sendEmail(
        user,
        'Password Reset',
        'Password reset OTP is ',
        otp,
      );
      return {
        status: 'success',
        data: { message: 'Email sent with OTP for password reset' },
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message:
            'An error occurred during password reset request, please try again later',
        },
      };
    }
  }

  async verifyOTP(email: string, otp: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        return {
          status: 'failure',
          data: { message: 'User not found' },
        };
      }

      if (user.user_otp !== parseInt(otp)) {
        return {
          status: 'failure',
          data: { message: 'Invalid OTP' },
        };
      }

      // Update user as OTP is verified
      await this.prisma.user.update({
        where: { email },
        data: { otp_verified: true, user_otp: parseInt(otp) }, // Clear OTP after verification
      });

      return {
        status: 'success',
        data: { message: 'OTP verified successfully', user_id: user.id },
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: { message: 'An error occurred while otp verification' },
      };
    }
  }
  async resendOTP(email : string) {
    try {
      const user = await this.prisma.user.findUnique({ where: {email} });

      if (!user) {
        return {
          status: 'failure',
          data: { message: 'User not found' },
        };
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await this.prisma.user.update({
        where: { email: email },
        data: { user_otp: otp },
      });

      await this.sendEmail(
        user,
        'Password Reset',
        'Password reset OTP is ',
        otp,
      );

      return {
        status: 'success',
        data: { message: 'Email sent with OTP for password reset' },
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: { message: 'An error occurred while resend otp' },
      };
    }
  }

  async changePassword(email: string, user_id: number, password: string) {
    try {
      if (!email || !user_id || !password) {
        return {
          status: 'failure',
          data: { message: 'Missing required fields' },
        };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: user_id, email },
      });

      if (!user) {
        return {
          status: 'failure',
          data: { message: 'User not found' },
        };
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      await this.prisma.user.update({
        where: { id: user_id, email },
        data: { password: hashedPassword },
      });

      return {
        status: 'success',
        data: { message: 'Password updated successfully' },
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message:
            'An error occurred during password change, please try again later',
        },
      };
    }
  }

  async addProfile(profileData: ProfileAddDto, user_id: number) {
    try {
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!isUserExists) {
        return {
          status: 'failure',
          data: { message: 'User not found' },
        };
      }

      const newProfile = await this.prisma.userDetails.create({
        data: {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          dateofbirth: new Date(profileData.date_of_birth),
          gender: profileData.gender,
          phonenumber: profileData.phone_number,
          user_id,
        },
      });

      return {
        status: 'success',
        data: newProfile,
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message:
            'An error occurred during profile creation, please try again later',
        },
      };
    }
  }

  async getProfileDetails(user_id: number) {
    try {
      const userDetails = await this.prisma.userDetails.findUnique({
        where: { user_id },
      });

      if (userDetails) {
        return {
          status: 'success',
          data: userDetails,
        };
      } else {
        return {
          status: 'success',
          data: { message: 'Profile details not found' },
        };
      }
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: { message: 'An error occurred while retrieving profile details' },
      };
    }
  }

  async updateProfile(profileData: UpdateProfileDto, user_id: number) {
    try {
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!isUserExists) {
        return {
          status: 'failure',
          data: { message: 'User not found' },
        };
      }

      const userDetails = await this.prisma.userDetails.findUnique({
        where: { user_id },
      });

      if (!userDetails) {
        return {
          status: 'failure',
          data: { message: 'Profile details not found' },
        };
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
        status: 'success',
        data: updatedProfile,
      };
    } catch (error) {
      // Handle specific errors with specific messages or codes
      // Here, we are just returning a generic error message
      return {
        status: 'failure',
        data: {
          message:
            'An error occurred during profile update, please try again later',
        },
      };
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
