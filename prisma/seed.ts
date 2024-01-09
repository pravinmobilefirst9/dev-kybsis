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
    // 1
    name: "Car",
    description: "Vehicles for personal use",
    assetSubType: [
      // 1
      {
        name: "Auto", 
        description: "Four-door car with a closed roof",
        assetFields : [
        ]
      },
      // 2
      {
        name: "Manual", 
        description: "Four-door car with a closed roof",
        assetFields : [ 
        ]
      }
    ]
  },
  {
    // 2
    name: "jwellary",
    description: "Precious ornaments and accessories",
    assetSubType: [
      // 3
      {
        name: "Necklace",
        description: "Ornamental chain worn around the neck",
        assetFields : [
        ]
      },
      // 4
      {
      name: "Ring",
      description: "Circular band worn on the finger",
        assetFields : [
          
        ]
      }
    ]
  },
  {
    // 3
    name: "Art",
    description: "Creative and expressive works of art",
    assetSubType: [
      // 5
      {
        name: "Painting",
        description: "Visual art created using pigments on a surface",
        assetFields : []
      },
      // 6
      {
        name: "Sculpture",
        description: "Three-dimensional artistic piece",
        assetFields : []
      },
    ]
  },
  {
    // 4
    "name": "Real Estate",
    "description": "Properties for personal or commercial use",
    "assetSubType": [
      // 7
    {
      "name": "Residential",
      "description": "Properties for personal living",
      assetFields : []
    },
    // 8
    {
      "name": "Commercial",
      "description": "Properties for business purposes",
      assetFields : []
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
const assetFieldsRealEstate = [
  // For car and its subtype it is same
  {name: "address", type: "text", label: "Address",order_id : 1},
  {name: "value", type: "text", label: "Value",order_id : 2},
  {name: "type", type: "text", label: "Type of Property",order_id : 3, options : ["Apartment","Townhouse", "Condominium", "Single-Family Home"]},
  {name: "value", type: "number", label : "Value", order_id : 4},
  {name: "year", type: "number", label : "Year of purchase",order_id : 5},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 6},
]

const assetFieldsJwellary = [
  // For car and its subtype it is same
  {name: "piece", type: "text", label: "Piece",order_id : 1},
  {name: "value", type: "text", label: "Value/Price",order_id : 2},
  {name: "location", type: "text", label : "Location", order_id : 3},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 4},
]

const assetFieldsArt = [
  // For car and its subtype it is same
  {name: "piece", type: "text", label: "Piece",order_id : 1},
  {name: "value", type: "text", label: "Value/Price",order_id : 2},
  {name: "location", type: "text", label : "Location", order_id : 3},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 4},
]

const investmentCategories = [
  {"name": "Stocks"},
  {"name": "Bonds"},
  {"name": "Real Estate"},
  {"name": "Mutual Funds"},
  {"name": "Exchange-Traded Funds (ETFs)"},
  {"name": "Cryptocurrencies"},
  {"name": "Commodities"},
  {"name": "Options"},
  {"name": "Retirement Accounts"},
  {"name": "Savings Accounts"}
]

const tableNames = ['Subscriptions', 'AssetFields', 'AssetSubType', 'AssetType', 'AssetFields', 'InvestmentCategories'];


async function main() {

  for (const tableName of tableNames) await prisma.$queryRawUnsafe(`Truncate "${tableName}" restart identity cascade;`);

  // Seed UserSubscription data
  // await prisma.subscriptions.deleteMany()
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
  
  // await prisma.assetFields.deleteMany()
  // await prisma.assetSubType.deleteMany()
  // await prisma.assetType.deleteMany()

  // Add asset types and assets subtypes
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
  
  // Add Assets data for Car
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

  // For jwellary
  for (let index = 2; index < 4; index++) {
    const fieldArr = assetFieldsJwellary.map((f) => {
      return {
        ...f,
        asset_id : 2,
        asset_sub_id : index + 1
      }
    })

    await prisma.assetFields.createMany({
      data : fieldArr
    })
  }

  // For Art
  for (let index = 4; index < 6; index++) {
    const fieldArr = assetFieldsArt.map((f) => {
      return {
        ...f,
        asset_id : 3,
        asset_sub_id : index + 1
      }
    })

    await prisma.assetFields.createMany({
      data : fieldArr
    })
  }
  // For Real Estate
  for (let index = 6; index < 8; index++) {
    const fieldArr = assetFieldsRealEstate.map((f) => {
      return {
        ...f,
        asset_id : 4,
        asset_sub_id : index + 1
      }
    })

    await prisma.assetFields.createMany({
      data : fieldArr
    })
  }

  await prisma.investmentCategories.deleteMany({})
  await prisma.investmentCategories.createMany({
    data : investmentCategories
  })
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });