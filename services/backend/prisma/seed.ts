import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a company
  const company = await prisma.company.upsert({
    where: { name: 'GreenTech Solutions' },
    update: {},
    create: {
      name: 'GreenTech Solutions',
      industry: 'Technology',
    },
  });

  console.log(`✅ Company created: ${company.name} (ID: ${company.id})`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@greentech.com' },
    update: {},
    create: {
      employeeId: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@greentech.com',
      password: adminPassword,
      department: 'Management',
      position: 'System Administrator',
      isAdmin: true,
      companyId: company.id,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create test employees
  const testPassword = await bcrypt.hash('test123', 10);

  const employees = [
    {
      employeeId: 'EMP001',
      name: 'John Doe',
      email: 'john@greentech.com',
      password: testPassword,
      department: 'Engineering',
      position: 'Software Developer',
      isAdmin: false,
      companyId: company.id,
    },
    {
      employeeId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane@greentech.com',
      password: testPassword,
      department: 'Sales',
      position: 'Sales Manager',
      isAdmin: false,
      companyId: company.id,
    },
    {
      employeeId: 'EMP003',
      name: 'Bob Johnson',
      email: 'bob@greentech.com',
      password: testPassword,
      department: 'Engineering',
      position: 'DevOps Engineer',
      isAdmin: false,
      companyId: company.id,
    },
  ];

  for (const employeeData of employees) {
    const employee = await prisma.employee.upsert({
      where: { email: employeeData.email },
      update: {},
      create: employeeData,
    });
    console.log(`✅ Employee created: ${employee.email}`);
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('='.repeat(50));
  console.log('Admin:');
  console.log('  Email: admin@greentech.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('Test Users:');
  console.log('  Email: john@greentech.com');
  console.log('  Email: jane@greentech.com');
  console.log('  Email: bob@greentech.com');
  console.log('  Password (all): test123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });