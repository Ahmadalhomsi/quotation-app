const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function migrateToUnifiedTypes() {
  console.log('🚀 Starting customer types migration...');

  try {
    // Create default customer types combining previous status types and label types
    const defaultTypes = [
      // Status-based types
      { name: 'Yeni Potansiyel', color: '#10B981', category: 'status', description: 'Yeni potansiyel müşteri' },
      { name: 'Aktif Müşteri', color: '#3B82F6', category: 'status', description: 'Aktif olarak çalışılan müşteri' },
      { name: 'Kaybedilen', color: '#EF4444', category: 'status', description: 'Kaybedilen müşteri' },
      { name: 'Beklemede', color: '#F59E0B', category: 'status', description: 'Beklemede olan müşteri' },
      { name: 'Tamamlanan', color: '#6B7280', category: 'status', description: 'İş tamamlanan müşteri' },
      
      // Priority-based types
      { name: 'VIP Müşteri', color: '#DC2626', category: 'priority', description: 'Yüksek öncelik' },
      { name: 'Önemli', color: '#F59E0B', category: 'priority', description: 'Orta öncelik' },
      { name: 'Normal', color: '#6B7280', category: 'priority', description: 'Normal öncelik' },
      
      // Source-based types
      { name: 'Website', color: '#8B5CF6', category: 'source', description: 'Website üzerinden gelen' },
      { name: 'Referans', color: '#06B6D4', category: 'source', description: 'Referans ile gelen' },
      { name: 'Reklam', color: '#EC4899', category: 'source', description: 'Reklam kampanyası' },
      { name: 'Sosyal Medya', color: '#10B981', category: 'source', description: 'Sosyal medya' },
      
      // Behavior-based types
      { name: 'Hızlı Karar', color: '#059669', category: 'behavior', description: 'Hızlı karar veren' },
      { name: 'Detaylı İnceleme', color: '#7C3AED', category: 'behavior', description: 'Detaylı inceleme yapan' },
      { name: 'Fiyat Odaklı', color: '#DC2626', category: 'behavior', description: 'Fiyat odaklı müşteri' },
    ];

    console.log('📝 Creating default customer types...');
    
    for (const type of defaultTypes) {
      try {
        await prisma.customerType.upsert({
          where: { name: type.name },
          update: {}, // Don't update if exists
          create: type
        });
        console.log(`✅ Created/verified type: ${type.name}`);
      } catch (error) {
        console.log(`⚠️  Type ${type.name} already exists or error: ${error.message}`);
      }
    }

    // Note: Existing customer data migration would need to be handled manually
    // since we're changing the structure significantly
    console.log('⚠️  NOTE: Existing customer status and label data will need to be manually migrated.');
    console.log('   You can assign new types to customers through the UI.');

    console.log('✅ Customer types migration completed!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateToUnifiedTypes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });