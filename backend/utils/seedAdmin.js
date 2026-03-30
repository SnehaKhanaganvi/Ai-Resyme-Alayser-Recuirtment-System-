const User = require('../models/User');

module.exports = async function seedAdmin() {
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    await User.create({ name: 'Super Admin', email: 'admin@recruit.com', password: 'Admin@123', role: 'admin' });
    console.log('Default admin created: admin@recruit.com / Admin@123');
  }
};
