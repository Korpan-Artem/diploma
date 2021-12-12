const Sequelize = require("sequelize");
const sequelize = new Sequelize("project", "postgres", "1300", {
    dialect: "postgres",
    host: "localhost",
    port: 5001,
  });

class User extends Sequelize.Model {}

User.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: Sequelize.STRING, unique: true },
    password: { type: Sequelize.STRING },
    role: { type: Sequelize.STRING, defaultValues: "USER" },
  },
  { sequelize, modelName: "user" }
);

class Device extends Sequelize.Model {
  get image() {
    return this.getImage();
  }
}

Device.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.INTEGER, allowNull: false },
    isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false,allowNull: false },
    qty: { type: Sequelize.INTEGER,defaultValue: 1,allowNull: false},
  },
  { sequelize, modelName: "device" }
);

class Order extends Sequelize.Model {
    get user() {
      return this.getUser();
    }
}

Order.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  },
  { sequelize, modelName: "order" }
);

class OrderDevice extends Sequelize.Model {
  get order() {
    return this.getOrder();
  }

  get device() {
    return this.getDevice();
  }
}

OrderDevice.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    count: { type: Sequelize.INTEGER },
    price: { type: Sequelize.INTEGER },
  },
  { sequelize, modelName: "orderDevice" }
);

class Image extends Sequelize.Model {}

Image.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: Sequelize.STRING, allowNull: false },
    originalFileName: { type: Sequelize.STRING, allowNull: false },
  },
  { sequelize, modelName: "image" }
);

User.hasOne(Order);
Order.belongsTo(User);

Device.hasMany(OrderDevice);
OrderDevice.belongsTo(Device);

Order.hasMany(OrderDevice);
OrderDevice.belongsTo(Order);

Image.hasMany(Device);
Device.belongsTo(Image);

sequelize.sync();

module.exports = {User,Device,Order,OrderDevice,Image}