import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client';
import * as nodeMailer from 'nodemailer'
import otpGenerator from 'otp-generator';

@Injectable()
export class UsersService {

  constructor (private readonly prisma : PrismaService){}


  async registerUser(createUserDto: RegisterUserDto) {
    
    if (!createUserDto) {
      throw new HttpException("User registration details are missing", HttpStatus.BAD_REQUEST)
    } 
    
    const alreadyExists = await this.prisma.user.findUnique({where : {email : createUserDto.email}})
    
    if (alreadyExists) {
      throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST)
    }

    const hash_password = await bcrypt.hash(createUserDto.password, 10);
    
    const otp = Math.floor(1000 + Math.random() * 9000);
        
    const user = await this.prisma.user.create({
      data : {
        email : createUserDto.email,
        password:  hash_password,
        otp_verified : false,
        active : false,
        user_otp : otp,
        device_token : createUserDto.device_token
      }
    }) 
    

    await this.sendEmail(user, "Welcome and verify your email.", "Thank for joining us please verify email with code", otp);
    
    delete user.password
    return user;
  }

  async sendEmail(user : User, subject : string, message : string, otp : number){

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
















  create(createUserDto: RegisterUserDto) {
    return createUserDto;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
