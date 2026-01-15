const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/electrician-db')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Define schemas
    const userSchema = new mongoose.Schema({}, { strict: false });
    const electricianSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.model('User', userSchema, 'users');
    const Electrician = mongoose.model('Electrician', electricianSchema, 'electricians');
    
    // Find all users with electrician role
    const electricianUsers = await User.find({ role: 'electrician' }).lean();
    console.log('\n=== ELECTRICIAN USERS ===\n');
    electricianUsers.forEach((user, idx) => {
      console.log(`User #${idx + 1}:`);
      console.log(`  _id: ${user._id}`);
      console.log(`  name: ${user.name}`);
      console.log(`  email: ${user.email}`);
      console.log(`  role: ${user.role}`);
      console.log('');
    });
    
    // Find all electrician profiles
    const electricians = await Electrician.find({}).lean();
    console.log('=== ELECTRICIAN PROFILES ===\n');
    electricians.forEach((elec, idx) => {
      console.log(`Electrician Profile #${idx + 1}:`);
      console.log(`  userId: ${elec.userId}`);
      console.log(`  isVerified: ${elec.isVerified}`);
      console.log(`  availabilityStatus: ${elec.availabilityStatus}`);
      console.log(`  currentLocation:`, elec.currentLocation);
      console.log(`  skills:`, elec.skills);
      console.log(`  lastActiveAt: ${elec.lastActiveAt}`);
      console.log('');
    });
    
    console.log(`\nTotal: ${electricianUsers.length} electrician user(s), ${electricians.length} profile(s)\n`);
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
