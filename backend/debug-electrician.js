const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/electrician-db')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Define schema
    const electricianSchema = new mongoose.Schema({}, { strict: false });
    const Electrician = mongoose.model('Electrician', electricianSchema, 'electricians');
    
    // Find all electricians
    const electricians = await Electrician.find({}).lean();
    
    console.log('\n=== ALL ELECTRICIANS ===\n');
    electricians.forEach((elec, idx) => {
      console.log(`Electrician #${idx + 1}:`);
      console.log(`  userId: ${elec.userId}`);
      console.log(`  isVerified: ${elec.isVerified}`);
      console.log(`  availabilityStatus: ${elec.availabilityStatus}`);
      console.log(`  currentLocation:`, elec.currentLocation);
      console.log(`  lastActiveAt: ${elec.lastActiveAt}`);
      console.log('');
    });
    
    console.log(`\nTotal: ${electricians.length} electrician(s)\n`);
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
