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
import * as nodeMailer from 'nodemailer';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgetPassword } from './dto/forget-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ProfileAddDto } from './dto/profile-add.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEventPayload } from 'src/event-emittors/types/user-created.event';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private stripeService : StripeService,
    private eventEmitter : EventEmitter2,
    private firebaseServices : FirebaseService
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
        throw new HttpException('Email already exist, We can help you with login', HttpStatus.CONFLICT);
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
          user_otp_createdAt: new Date(),
          device_token: createUserDto.device_token,
        },
      });
      
      this.eventEmitter.emit("user.created", new UserCreatedEventPayload(user, otp));

      // await this.sendEmail(
      //   user,
      //   'Welcome and verify your email.',
      //   `Thank you for joining Kybsis! We're excited to have you on board.
        
      //   To complete your signup, please verify your email address by entering the following code in the app:
        
      //   Verification Code: ${otp}
        
      //   This code will expire in 10 minutes.
        
      //   If you didn't request this code, please ignore this email.
        
      //   We're looking forward to seeing you in the app!
        
      //   Sincerely,
      //   The Kybsis Team`,
      //   otp,
      // );
      
      delete user.password;
      delete user.user_otp;
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "User registered successfully",
        data: user
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendEmail(user: any, subject: string, message: string, otp: number) {
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
      to: user.email !== undefined && user.email !== null ? user.email : user,
      subject: subject,
      text: message,
    };

    // emailOptions.text += ' Your Notification Code is : ' + otp;

    await transporter.sendMail(emailOptions);

    // send Push Notification
    const welcomeTitle = 'Welcome to Kybsis!';
    const welcomeBody = 'Thank you for registering. OTP has been sent successfully to your Email!';
    const deviceToken = 'etK9E4x0SC-oK20MjZjBtF:APA91bHDIuzvHBWextRjwbL3qrS942CMMbMjB6vFPp0-Cp0MjK5GltsBNatTO4JnNFk4jID1aOx2VwhBSygYzyOgITNRoId7-wMJSYW7rFKOyJeX8IoGQ89wbEFJ6EmUK2RQhfKaKSgm';
    await this.firebaseServices.sendPushNotification(deviceToken, welcomeTitle, welcomeBody);

  }


  async loginUser(payload: LoginUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
        select: {
          id: true,
          user_role: true,
          email: true,
          active: true,
          password: true,

        }
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const passwordMatches = await bcrypt.compare(payload.password, user.password);
      if (!passwordMatches) {
        throw new HttpException('Invalid email or password',
        HttpStatus.UNAUTHORIZED // 401 - Unauthorized
        );
      }
      
      if (!user.active) {
        throw new HttpException({
          message : 'User email is not verified. Please verify your email before login.',
          data : {
            active : false
          }
        }, HttpStatus.FORBIDDEN);
      }
      const jwtPayload = {
        user_id: user.id, role: user.user_role
      };

      const token = await this.jwtService.signAsync(jwtPayload);
      const { password: userPassword, ...userData } = user;

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: {
          ...userData,
          token,
        },
        message: "Login successfull"

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
        'Forgot password',
        `
        Here's a new verification code to complete your password reset:

        Verification Code: ${otp}
        
        This code will expire in 10 minutes.
        
        Please enter this code in the app to verify your email address.
                
        Thanks,
        The Kybsis Team`,
        otp,
      );
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Email sent with OTP for password reset',
        data: null,
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

      if (!user.user_otp_createdAt) {
        throw new HttpException(
          'OTP is expired',
          HttpStatus.NOT_ACCEPTABLE
        )
      }

      if (user.user_otp !== parseInt(otp)) {
        throw new HttpException(
          'Invalid OTP',
          HttpStatus.NOT_ACCEPTABLE
        )
      }



      const otpCreatedAt = new Date(user.user_otp_createdAt);
      const timeDifference = new Date().getTime() - otpCreatedAt.getTime();
      const otpValidityDuration = 10 * 60 * 1000;

      if (timeDifference > otpValidityDuration) {
        throw new HttpException("OTP expired", HttpStatus.NOT_ACCEPTABLE);
      }

      // Update user as OTP is verified
      await this.prisma.user.update({
        where: { email },
        data: { otp_verified: true },
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: { user_id: user.id },
        message: 'OTP verified successfully'

      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verifyLoginOTP (email : string, otp : string){
    try {
      const user = await this.prisma.user.findUnique({ where: { email },
        select : {
          id : true,
          user_role: true,
          email: true,
          active: true,
          user_otp_createdAt : true,
          user_otp : true,
          device_token : true
        }
      });
      
      if (!user) {
        throw new HttpException(
          "User not found"
          ,
          HttpStatus.NOT_FOUND
        )
      }

      if (!user.user_otp_createdAt) {
        throw new HttpException(
          'OTP is expired',
          HttpStatus.NOT_ACCEPTABLE
        )
      }

      if (user.user_otp !== parseInt(otp)) {
        throw new HttpException(
          'Invalid OTP',
          HttpStatus.NOT_ACCEPTABLE
        )
      }

      
      const otpCreatedAt = new Date(user.user_otp_createdAt);
      const timeDifference = new Date().getTime() - otpCreatedAt.getTime();
      const otpValidityDuration = 10 * 60 * 1000;

      if (timeDifference > otpValidityDuration) {
        throw new HttpException("OTP is expired", HttpStatus.NOT_ACCEPTABLE);
      }

      // Update user as OTP is verified
      await this.prisma.user.update({
        where: { email },
        data: { otp_verified: true, active: true },
      });

      const jwtPayload = {
        user_id: user.id, role: user.user_role
      };


       const token = await this.jwtService.signAsync(jwtPayload);

       delete user.user_otp_createdAt
       delete user.user_otp
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: {
          ...user,
          token,
        },
        message: "Login successfull"
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
        data: { user_otp: otp, otp_verified: false, user_otp_createdAt: new Date() },
      });

      await this.sendEmail(
        user,
        'OTP Resend',
        `
        Here's a new verification code to continue:

        Verification Code: ${otp}

        This code will expire in 10 minutes.

        Thanks,
        The Kybsis Team
        `,
        otp,
      );

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Email resent with OTP',
        data: null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changePassword({ email, otp, password, user_id }: UpdatePasswordDTO) {
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
        data: { password: hashedPassword, otp_verified: false },
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
          "User not found",
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
          zipcode : profileData.zipcode,
          user: { connect: { id: user_id } }, // Optional: Connect user_id to UserDetails
        },
        update: {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          dateofbirth: new Date(profileData.date_of_birth),
          gender: profileData.gender,
          zipcode : profileData.zipcode,
          phonenumber: profileData.phone_number,
        },
      });

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: "profile added succssfully",
        data: newProfile,

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
          message: "User details fetched successfully",
          data: userDetails,

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
        message: "profile updated successfully",
        data: updatedProfile,

      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllSubscriptions() {
    try {
      const data = await this.prisma.userSubscription.findMany({});

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: "Subscriptions fetched successfully",
        data: data,

      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async create(createUserDto: RegisterUserDto) {

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
