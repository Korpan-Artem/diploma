const {User,Device,Order,OrderDevice,Image} = require("../models");

const resolvers = {
    async getAllDevice() {
      return await Device.findAll({ where: { isDeleted: false } });
    },
    async getAllDeviceAdmin() {
      return await Device.findAll();
    },
  
    async login({ email, password }) {
      if (!email || !password) return null;
      const user = await User.findOne({ where: { email, password } });
      console.log(user);
      if (!user) return null;
      const token = jwt.sign(
        {
          sub: email,
          role: user.role,
        },
        SECRET
      );
      return token;
    },
  
    async register ({email, password}) {
      if(!email || !password) return null;
      const oldUser = await User.findOne({where: {email}});
      if(oldUser) return null;
      const input = {email,password};
      const user = await User.create(input);
      const token = jwt.sign({
          sub:email, role: user.role
      }, SECRET)
      return token;
    },
  
    async AdUpsert({ name, price, description, imageId }) {
      const input = { name, price, description, imageId };
      const device = await Device.create(input);
    },
  
    async deleteOrRestoreDevice({ id, isDeleted }) {
      const device = await Device.findOne({ where: { id } });
      if (!device) return null;
      device.isDeleted = isDeleted;
      return await device.save();
    },
  
    async getDevice({ id }) {
      const device = await Device.findByPk(id);
      return await device;
    },
  
    async newOrder({order}, {thisUser}) {
        const dbOrder = await thisUser.createOrder();  
        await Promise.all(order.orderDevices.map(od => dbOrder.createOrderDevice(od)));
        return dbOrder;
    }
    
  };

  module.exports = resolvers;