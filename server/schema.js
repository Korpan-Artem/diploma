const { buildSchema } = require("graphql");

const schema = buildSchema(`
type Query {
    getAllDevice: [Device],
    getAllDeviceAdmin: [Device],
    getDevice(id: ID): Device,
    login(email: String!,password: String!): String,
    getAllOrderAdmin: [OrderDevice]
    getOrder: [Order]
    getImage: [Image]
}

type Mutation {
    register(email: String!, password: String!): String,
    deleteOrRestoreDevice(id: ID, isDeleted: Boolean!): Device,
    uploadImage(url: String, originalFileName: String): Image!
    AdUpsert(name: String, description: String, price: Int, imageId: Int): Device,
    newOrder(order: OrderInput): Order,
}

input OrderInput{
    orderDevices: [OrderDeviceInput]
}

input OrderDeviceInput {
    deviceId: ID,
    count: Int,
    price:Int,
}

type User {
    id: ID,
    email: String,
    password: String,
    role: String
    createdAt: String,
    updatedAt: String,
}

type Order {
    id: ID,
    user: User
    createdAt: String,
    updatedAt: String,
}

type OrderDevice{
    id: ID,
    count:Int,
    price: Int,
    device: Device
    order: Order
}

type Image {
    id: ID, 
    url: String,
    device: Device,
    originalFileName: String,
    createdAt: String,
}

type Device {
    id: ID,
    name: String,
    price: Int,
    description: String,    
    isDeleted: Boolean,
    image: [Image],
    qty: Int,
    user: User
}
`);

module.exports = schema;