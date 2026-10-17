const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Services ──────────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.upsert({ where: { id: 'svc-cleaning' }, update: {}, create: { id: 'svc-cleaning', name: 'Home Cleaning', description: 'Professional deep cleaning of your home including floors, bathrooms, kitchen', category: 'Cleaning', basePrice: 499, icon: '🧹' } }),
    prisma.service.upsert({ where: { id: 'svc-plumbing' }, update: {}, create: { id: 'svc-plumbing', name: 'Plumbing Repair', description: 'Fix leaks, pipe repairs, tap replacement, drainage issues', category: 'Plumbing', basePrice: 299, icon: '🔧' } }),
    prisma.service.upsert({ where: { id: 'svc-electrical' }, update: {}, create: { id: 'svc-electrical', name: 'Electrical Work', description: 'Wiring, switchboard repair, fan installation, meter issues', category: 'Electrical', basePrice: 349, icon: '⚡' } }),
    prisma.service.upsert({ where: { id: 'svc-carpentry' }, update: {}, create: { id: 'svc-carpentry', name: 'Carpentry & Furniture', description: 'Furniture assembly, repair, custom woodwork, door fixing', category: 'Carpentry', basePrice: 399, icon: '🪵' } }),
    prisma.service.upsert({ where: { id: 'svc-painting' }, update: {}, create: { id: 'svc-painting', name: 'Wall Painting', description: 'Interior and exterior painting, waterproofing, texture work', category: 'Painting', basePrice: 799, icon: '🎨' } }),
    prisma.service.upsert({ where: { id: 'svc-appliance' }, update: {}, create: { id: 'svc-appliance', name: 'Appliance Repair', description: 'AC, washing machine, refrigerator, geyser repair', category: 'Appliance Repair', basePrice: 449, icon: '🔌' } }),
    prisma.service.upsert({ where: { id: 'svc-pest' }, update: {}, create: { id: 'svc-pest', name: 'Pest Control', description: 'Cockroach, termite, rodent, bed bug control treatments', category: 'Pest Control', basePrice: 599, icon: '🐛' } }),
    prisma.service.upsert({ where: { id: 'svc-gardening' }, update: {}, create: { id: 'svc-gardening', name: 'Gardening', description: 'Garden maintenance, plant care, landscaping, lawn mowing', category: 'Gardening', basePrice: 299, icon: '🌿' } }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // ── Admin User ─────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { phone: '9000000001' },
    update: {},
    create: { name: 'Admin User', phone: '9000000001', email: 'admin@coopserve.in', role: 'ADMIN', isVerified: true },
  });
  console.log('✅ Admin user created:', admin.phone);

  // ── Customer Users ─────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.user.upsert({ where: { phone: '9100000001' }, update: {}, create: { name: 'Priya Sharma', phone: '9100000001', email: 'priya@example.com', role: 'CUSTOMER', isVerified: true } }),
    prisma.user.upsert({ where: { phone: '9100000002' }, update: {}, create: { name: 'Rahul Gupta', phone: '9100000002', email: 'rahul@example.com', role: 'CUSTOMER', isVerified: true } }),
    prisma.user.upsert({ where: { phone: '9100000003' }, update: {}, create: { name: 'Anita Verma', phone: '9100000003', email: 'anita@example.com', role: 'CUSTOMER', isVerified: true } }),
  ]);
  console.log(`✅ Created ${customers.length} customer users`);

  // ── Provider Users ─────────────────────────────────────────────
  const providerData = [
    { phone: '9200000001', name: 'Suresh Kumar', skills: '["Plumbing","Appliance Repair"]', city: 'Mumbai', lat: 19.076, lon: 72.877, rating: 4.8, jobs: 142 },
    { phone: '9200000002', name: 'Ramesh Patel', skills: '["Electrical","Carpentry"]', city: 'Mumbai', lat: 19.089, lon: 72.865, rating: 4.6, jobs: 98 },
    { phone: '9200000003', name: 'Mohan Singh', skills: '["Cleaning","Pest Control"]', city: 'Mumbai', lat: 19.064, lon: 72.892, rating: 4.9, jobs: 213 },
    { phone: '9200000004', name: 'Deepak Yadav', skills: '["Painting","Carpentry"]', city: 'Delhi', lat: 28.644, lon: 77.216, rating: 4.5, jobs: 67 },
    { phone: '9200000005', name: 'Arun Mishra', skills: '["Gardening","Cleaning"]', city: 'Bangalore', lat: 12.971, lon: 77.594, rating: 4.7, jobs: 89 },
  ];

  for (const pd of providerData) {
    const user = await prisma.user.upsert({
      where: { phone: pd.phone },
      update: {},
      create: { name: pd.name, phone: pd.phone, role: 'PROVIDER', isVerified: true },
    });
    await prisma.provider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id, skills: pd.skills, city: pd.city,
        latitude: pd.lat, longitude: pd.lon,
        rating: pd.rating, totalJobs: pd.jobs,
        isApproved: true, kycStatus: 'APPROVED',
        cooperativeMember: true,
        totalEarnings: pd.jobs * 350,
        welfareContribution: pd.jobs * 7,
      },
    });
  }
  console.log(`✅ Created ${providerData.length} provider profiles`);

  // ── Cooperative Vote ───────────────────────────────────────────
  await prisma.cooperativeVote.upsert({
    where: { id: 'vote-001' },
    update: {},
    create: {
      id: 'vote-001',
      title: 'Platform Service Fee Revision',
      description: 'The current platform fee is 10%. Should we reduce it to 8% for all cooperative members?',
      options: JSON.stringify(['Yes, reduce to 8%', 'Keep at 10%', 'Reduce to 7% for top-rated providers']),
      createdBy: admin.id,
      status: 'ACTIVE',
    },
  });

  await prisma.cooperativeVote.upsert({
    where: { id: 'vote-002' },
    update: {},
    create: {
      id: 'vote-002',
      title: 'New Service Category Addition',
      description: 'Should we add "Home Tutoring" as a new service category on the platform?',
      options: JSON.stringify(['Yes, add it', 'No, focus on existing services', 'Add after 6-month pilot']),
      createdBy: admin.id,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created cooperative votes');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📱 Demo Accounts:');
  console.log('  Admin:    9000000001');
  console.log('  Customer: 9100000001 (Priya Sharma)');
  console.log('  Provider: 9200000001 (Suresh Kumar)');
  console.log('  OTP: 123456 (hardcoded for demo)');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
