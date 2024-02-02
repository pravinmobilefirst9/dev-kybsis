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


let categories = [
  {
    category_name  : "Clothing",
    category_ids : [
      '19012000', '19012001',
      '19012002', '19012003',
      '19012004', '19012005',
      '19012006', '19012007',
      '19012008'
    ]
  },
  {
    category_name: "Food and Drinks",
    category_ids : [
      '13000000', '13001000', '13001001', '13001002', '13001003',
      '13002000', '13003000', '13004000', '13004001', '13004002',
      '13004003', '13004004', '13004005', '13004006', '13005000',
      '13005001', '13005002', '13005003', '13005004', '13005005',
      '13005006', '13005007', '13005008', '13005009', '13005010',
      '13005011', '13005012', '13005013', '13005014', '13005015',
      '13005016', '13005017', '13005018', '13005019', '13005020',
      '13005021', '13005022', '13005023', '13005024', '13005025',
      '13005026', '13005027', '13005028', '13005029', '13005030',
      '13005031', '13005032', '13005033', '13005034', '13005035',
      '13005036', '13005037', '13005038', '13005039', '13005040',
      '13005041', '13005042', '13005043', '13005044', '13005045',
      '13005046', '13005047', '13005048', '13005049', '13005050',
      '13005051', '13005052', '13005053', '13005054', '13005055',
      '13005056', '13005057', '13005058', '13005059', '18021000',
      '18021001', '18021002', '18037005', '19025000', '19025001',
      '19025002', '19025003', '19025004'
    ]
  },
  {
    category_name: "Health",
    category_ids : [
      '14000000', '14001000', '14001001',
      '14001002', '14001003', '14001004',
      '14001005', '14001006', '14001007',
      '14001008', '14001009', '14001010',
      '14001011', '14001012', '14001013',
      '14001014', '14001015', '14001016',
      '14001017', '14002000', '14002001',
      '14002002', '14002003', '14002004',
      '14002005', '14002006', '14002007',
      '14002008', '14002009', '14002010',
      '14002011', '14002012', '14002013',
      '14002014', '14002015', '14002016',
      '14002017', '14002018', '14002019',
      '14002020', '19025002'
    ]
  },
  {
    category_name : "Home",
    category_ids : [
      '12002001', '18024000', '18024001',
      '18024002', '18024003', '18024004',
      '18024005', '18024006', '18024007',
      '18024008', '18024009', '18024010',
      '18024011', '18024012', '18024013',
      '18024014', '18024015', '18024016',
      '18024017', '18024018', '18024019',
      '18024020', '18024021', '18024022',
      '18024023', '18024024', '18024025',
      '18024026', '18024027', '19005003',
      '19027000'
    ]  
  },
  {
    category_name : "Groceries",
    category_ids : ['19047000']
  },
  {
    category_name : "Education",
    category_ids :  [
      '12008000', '12008001',
      '12008002', '12008003',
      '12008004', '12008005',
      '12008006', '12008007',
      '12008008', '12008009',
      '12008010', '12008011'
    ]
  },
  {
    category_name : "Entertainmet",
    category_ids : [
      '17001000', '17001001',
      '17001002', '17001003', '17001004',
      '17001005', '17001006', '17001007',
      '17001008', '17001009', '17001010',
      '17001011', '17001012', '17001013',
      '17001014', '17001015', '17001016',
      '17001017', '17001018', '17001019',
      '18018000', '18018001'
    ]
  },
  {
    category_name : "Travel",
    category_ids :  [
      '18067000', '22000000', '22001000',
      '22002000', '22003000', '22004000',
      '22005000', '22006000', '22006001',
      '22007000', '22008000', '22009000',
      '22010000', '22011000', '22012000',
      '22012001', '22012002', '22012003',
      '22012004', '22012005', '22012006',
      '22013000', '22014000', '22015000',
      '22016000', '22017000', '22018000'
    ]
  },
  {
    category_name : "Gifts",
    category_ids : ['19028000']
  }
]


const assetsData  = [
  {
    // 1
    name: "Car",
    description: "Vehicles for personal use",
    hasSubType : false,
    assetSubType: [
      // 1
      {
        name: "Default", 
        description: "All",
        assetFields : [
        ]
      },
    ]
  },
  {
    // 2
    name: "Jewellery",
    description: "Precious ornaments and accessories",
    hasSubType : false,
    assetSubType: [
      // 2
      {
        name: "Default",
        description: "All",
        assetFields : [
        ]
      },
    ]
  },
  {
    // 3
    name: "Art",
    description: "Creative and expressive works of art",
    hasSubType : false,
    assetSubType: [
      // 3
      {
        name: "Default",
        description: "All",
        assetFields : []
      },
    ]
  },
  {
    // 4
    "name": "Real Estate",
    "description": "Properties for personal or commercial use",
    "assetSubType": [
      // 4
    {
      "name": "Residential",
      "description": "Properties for personal living",
      assetFields : []
    },
    // 5
    {
      "name": "Commercial",
      "description": "Properties for business purposes",
      assetFields : []
    }
  ]
  },
  {
    // 5
    "name": "Cash",
    "description": "Liquid assets in the form of cash",
    "assetSubType": [
      // 6
      {
        "name": "Physical Cash",
        "description": "Actual physical currency notes and coins",
        "assetFields": []
      },
      // 7
      {
        "name": "Bank Deposits",
        "description": "Cash held in bank accounts",
        "assetFields": []
      }
    ]
  }
  
]

let years = Array.from({ length: 11 }, (_, index) => (2013 + index).toString());


const assetFields = [
  // For car and its subtype it is same
  {name: "make", type: "text", label: "Make",order_id : 1},
  {name: "model", type: "text", label: "Model",order_id : 2},
  {name: "Year", type: "options", label: "Year",order_id : 3, options : years},
  {name: "value", type: "number", label : "Value", order_id : 5},
  {name: "location", type: "text", label : "Location",order_id : 6},
  {name: "description", type: "textarea", label : "Description", order_id : 7},
]
const assetFieldsRealEstate = [
  // For car and its subtype it is same
  {name: "address", type: "text", label: "Address",order_id : 1},
  {name: "type", type: "options", label: "Type of Property",order_id : 2, options : ["Apartment","Townhouse", "Condominium", "Single-Family Home"]},
  {name: "value", type: "number", label : "Value", order_id : 3},
  {name: "year", type: "date", label : "Date of purchase",order_id : 4},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 5},
]

const assetFieldsJwellary = [
  // For car and its subtype it is same
  {name: "piece", type: "text", label: "Piece",order_id : 1},
  {name: "value", type: "number", label: "Value/Price",order_id : 2},
  {name: "location", type: "text", label : "Location", order_id : 3},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 4},
]

const assetFieldsArt = [
  // For car and its subtype it is same
  {name: "piece", type: "text", label: "Piece",order_id : 1},
  {name: "value", type: "number", label: "Value/Price",order_id : 2},
  {name: "location", type: "text", label : "Location", order_id : 3},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 4},
]

const cashAssetsFieldsPhysical = [
  {name: "value", type: "number", label: "Amount",order_id : 1},
  {name: "details", type: "textarea", label : "Additional Details", order_id : 2},

]
const cashAssetFieldsBankDeposit = [
    {name: "bank_name", type: "text", label: "Bank Name",order_id : 1},
    {name: "account_number", type: "text", label: "Account Number",order_id : 2},
    {name: "value", type: "number", label: "Amount",order_id : 3},
    {name: "description", type: "textarea", label : "Description", order_id : 4},

]

const investmentCategories = [
  {"name": "Mutual Fund"},
  {"name": "Equity"},
  {"name": "ETFs(Exchange-Traded Funds)"},
  {"name": "Cash"},
  {"name": "Private Equity"},
  {"name": "Hedge Funds"},
  {"name": "Annuities"},
  {"name": "Whole Life Insurance"}
]

const widgets = [
  {name : "Income", default : true, role : "BASIC"},
  {name : "Expense", default : true, role : "BASIC"},
  {name : "Plaid Investment", default : false, role : "PREMIUM"},
  {name : "Manual Investment", default : false, role : "PREMIUM"},
  {name : "Total Investment", default : false, role : "PREMIUM"},
  {name : "Budget", default : false, role : "PREMIUM"},
  {name : "Houshold", default : false, role : "PREMIUM"},
  {name : "Plaid Assets", default : false, role : "PREMIUM"},
  {name : "Manual Assets", default : false, role : "PREMIUM"},
]

const tableNames = ['Subscriptions', 'AssetFields', 'AssetSubType', 'AssetType', 'AssetFields', 'InvestmentCategories','BudgetCategories', 'Widgets'];


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
    const {name, description, assetSubType, hasSubType} = asset;
    await prisma.assetType.create({
      data : {
        name,
        description,
        hasSubType,
        assetSubType : {
          create : assetSubType.map((subtype) => {
            const { description, name} = subtype;
            return {
              name,
              description
            };
          })
        }
      }
    })
  }
  
  const assetSubTypes = await prisma.assetSubType.findMany({
    select : {
      id : true,
      name : true,
      asset : {
        select : {
          id : true,
          name : true
        }
      }
    }
  })

  assetSubTypes.forEach(async (subType) => {
    let fieldArr = []
    switch (subType.asset.name) {
      case "Car":
        fieldArr = assetFields.map((f) => {
          return {
            ...f,
            asset_type_id : subType.asset.id,
            asset_sub_id : subType.id
          }
        })
    
        await prisma.assetFields.createMany({
          data : fieldArr
        })
        break;

      case "Jewellery":
        fieldArr = assetFieldsJwellary.map((f) => {
          return {
            ...f,
            asset_type_id : subType.asset.id,
            asset_sub_id : subType.id
          }
        })
    
        await prisma.assetFields.createMany({
          data : fieldArr
        })
      break;

      case "Art":
        fieldArr = assetFieldsArt.map((f) => {
          return {
            ...f,
            asset_type_id : subType.asset.id,
            asset_sub_id : subType.id
          }
        })
    
        await prisma.assetFields.createMany({
          data : fieldArr
        })
      break;

      case "Real Estate":
        fieldArr = assetFieldsRealEstate.map((f) => {
          return {
            ...f,
            asset_type_id : subType.asset.id,
            asset_sub_id : subType.id
          }
        })
    
        await prisma.assetFields.createMany({
          data : fieldArr
        })
      break;

      case "Cash":
        switch (subType.name) {
          case "Physical Cash":
            fieldArr = cashAssetsFieldsPhysical.map((f) => {
              return {
                ...f,
                asset_type_id : subType.asset.id,
                asset_sub_id : subType.id
              }
            })
        
            await prisma.assetFields.createMany({
              data : fieldArr
            })
            break;
          
          case "Bank Deposits":
            fieldArr = cashAssetFieldsBankDeposit.map((f) => {
              return {
                ...f,
                asset_type_id : subType.asset.id,
                asset_sub_id : subType.id
              }
            })
        
            await prisma.assetFields.createMany({
              data : fieldArr
            })
          break;
        
          default:
            break;
        }
        
      break;
    
      default:
        break;
    }
  })

  await prisma.investmentCategories.createMany({
    data : investmentCategories
  })

  await prisma.budgetCategories.createMany({
    data : categories
  })


  await prisma.widgets.createMany({
    data : widgets.map((w) => ({
      default : w.default,
      name : w.name,
      role : w.role === "BASIC" ? "BASIC" : "PREMIUM"
    }))
  })


}



main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });