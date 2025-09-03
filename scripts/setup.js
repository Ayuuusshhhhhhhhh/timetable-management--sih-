const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Timetable Management System...\n');

// Function to run command and log output
const runCommand = (command, cwd = process.cwd()) => {
  console.log(`📦 Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log(`✅ Completed: ${command}\n`);
  } catch (error) {
    console.error(`❌ Failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
};

// Check if .env file exists, if not copy from example
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created\n');
} else {
  console.log('📋 .env file already exists\n');
}

// Install backend dependencies
console.log('🔧 Installing backend dependencies...');
runCommand('npm install', path.join(__dirname, '../backend'));

// Install frontend dependencies
console.log('🔧 Installing frontend dependencies...');
runCommand('npm install', path.join(__dirname, '../frontend'));

// Run database migrations
console.log('🗄️  Running database migrations...');
runCommand('npm run migrate', path.join(__dirname, '../backend'));

// Seed database with initial data
console.log('🌱 Seeding database with initial data...');
runCommand('npm run seed', path.join(__dirname, '../backend'));

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update .env file with your configuration');
console.log('2. Start backend: cd backend && npm run dev');
console.log('3. Start frontend: cd frontend && npm start');
console.log('4. Open http://localhost:3000 in your browser');
console.log('5. Login with admin@example.com / admin123');
console.log('\n📚 Check README.md for detailed instructions.');
