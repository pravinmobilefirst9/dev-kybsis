import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const userSubscriptionSeedData = [
  {
    name: "Free",
    price: 0,
    description: "Includes Free features",
  },
  {
    name: "Basic",
    price: 19.99,
    description: "Includes basic features",
  },
  {
    name: "Premium",
    price: 39.99,
    description: "Access to premium features",
  },
];



const assetsData  = [
  {
    name: "Car",
    description: "Vehicles for personal use",
    assetSubType: [
      {
        name: "Auto", 
        description: "Four-door car with a closed roof",
        assetFields : [
         
        ]
      },
      {
        name: "Manual", 
        description: "Four-door car with a closed roof",
        assetFields : [
          
        ]
      }
    ]
  }
]

const assetFields = [
  // For car and its subtype it is same
  {name: "make", type: "text", label: "Make",order_id : 1},
  {name: "model", type: "text", label: "Model",order_id : 2},
  {name: "Year", type: "text", label: "Year",order_id : 3, options : ["2020","2022", "2023"]},
  {name: "value", type: "number", label : "Value", order_id : 5},
  {name: "location", type: "text", label : "Location",order_id : 6},
  {name: "description", type: "textarea", label : "Description", order_id : 7},
]




async function main() {
  // Seed UserSubscription data
  await prisma.subscriptions.deleteMany()
  for (const subscriptionData of userSubscriptionSeedData) {
    await prisma.subscriptions.create({
      data: subscriptionData,
    });
  }

  console.log('-----------------------------------');
  const totalSubscriptions = await prisma.subscriptions.count();
  console.log('-----------------------------------');
  console.log('Total Subscription -', totalSubscriptions);
  console.log('-----------------------------------');
  
  await prisma.assetFields.deleteMany()
  await prisma.assetSubType.deleteMany()
  await prisma.assetType.deleteMany()

  for (const asset of assetsData) {
    const {name, description, assetSubType} = asset;
    await prisma.assetType.create({
      data : {
        name,
        description,
        assetSubType : {
          create : assetSubType.map((subtype) => {
            const { assetFields,  description, name} = subtype;
            return {
              name,
              description
            };
          })
        }
      }
    })
  }
  
  for (let index = 0; index < 2; index++) {
    const fieldArr = assetFields.map((f) => {
      return {
        ...f,
        asset_id : 1,
        asset_sub_id : index + 1
      }
    })

    await prisma.assetFields.createMany({
      data : fieldArr
    })
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });