import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FirebaseService  {
  private readonly firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    
      if (!admin.apps.length) { // Check if any Firebase apps have been initialized
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY, // Ensure newlines are correctly processed
            projectId: process.env.FIREBASE_PROJECT_ID,
          })
        });
      } else {
        this.firebaseApp = admin.app(); // Use the already initialized default app
      }
    }
    
    async sendPushNotification(token: string, title: string, body: string) {
      const message = {
        notification: {
          title,
          body,
        },
        token,
      };
  
      try {
        await this.firebaseApp.messaging().send(message);
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  
  



  //to send Push Notification to the multiple devices, later use - Mehul

//   async sendBulkNotification({ tokens, title, body, data }: { tokens: string[], title: string, body: any, data: any }) {
//     try {
//         // Ensure tokens is an array
//         if (!Array.isArray(tokens)) {
//             throw new Error('Tokens must be an array of device registration tokens');
//         }

//         const notification = {
//             title,
//             body,
//         }

//         const response = await this.firebaseApp.messaging().sendEachForMulticast({
//             notification,
//             tokens,
//             data,
//         })

//         console.log(response);
//         // // {
//         // //     responses: [
//         // //       {
//         // //         success: true,
//         // //         messageId: 'projects/fir-project-5d3e7/messages/0:1702031458392894%2adaf2b12adaf2b1'
//         // //       }
//         // //     ],
//         // //     successCount: 1,
//         // //     failureCount: 0
//         // //   }
//         // return;

//     } catch (error) {
//         console.error('Error sending message:', error);
//         throw error;
//     }
// }


 //      this.sendPushNotification({
  //       data: {},
  //       title: `{fullName} wants to connect`,
  //       body: 'You have a new connection request',
  //       tokens: ['etK9E4x0SC-oK20MjZjBtF:APA91bHDIuzvHBWextRjwbL3qrS942CMMbMjB6vFPp0-Cp0MjK5GltsBNatTO4JnNFk4jID1aOx2VwhBSygYzyOgITNRoId7-wMJSYW7rFKOyJeX8IoGQ89wbEFJ6EmUK2RQhfKaKSgm']
  //     }).then(()=>{
  //       console.log("success");        
  // }).catch(()=>{
  //   console.log("error");
  // })
}