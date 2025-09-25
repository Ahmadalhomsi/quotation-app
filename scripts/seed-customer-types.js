const { PrismaClient } = require('../app/generated/prisma')

const prisma = new PrismaClient()

async function seedCustomerTypes() {
  try {
    console.log('🌱 Seeding customer status types...')

    // Default customer status types
    const defaultStatusTypes = [
      { name: 'Yeni Potansiyel', color: '#6B7280', description: 'Yeni potansiyel müşteri', sortOrder: 1 },
      { name: 'Arandı', color: '#F59E0B', description: 'Telefon ile arandı', sortOrder: 2 },
      { name: 'Demo Bekliyor', color: '#3B82F6', description: 'Demo sunumu bekliyor', sortOrder: 3 },
      { name: 'Demo Verildi', color: '#8B5CF6', description: 'Demo sunumu yapıldı', sortOrder: 4 },
      { name: 'Teklif Bekliyor', color: '#F97316', description: 'Teklif hazırlanması bekleniyor', sortOrder: 5 },
      { name: 'Teklif Verildi', color: '#EF4444', description: 'Teklif sunuldu', sortOrder: 6 },
      { name: 'Ziyaret Bekliyor', color: '#06B6D4', description: 'Yerinde ziyaret bekliyor', sortOrder: 7 },
      { name: 'Müşteri Oldu', color: '#10B981', description: 'Başarıyla müşteri oldu', sortOrder: 8 },
      { name: 'Kayıp', color: '#EF4444', description: 'Potansiyel kayboldu', sortOrder: 9 },
      { name: 'Pasif', color: '#6B7280', description: 'Pasif durumda', sortOrder: 10 },
    ]

    for (const statusType of defaultStatusTypes) {
      await prisma.customerStatusType.upsert({
        where: { name: statusType.name },
        update: {},
        create: statusType
      })
    }

    console.log('✅ Customer status types seeded successfully')

    // Default customer label types
    const defaultLabelTypes = [
      { name: 'VIP', color: '#F59E0B', description: 'VIP müşteri' },
      { name: 'Hızlı Karar', color: '#10B981', description: 'Hızlı karar veren müşteri' },
      { name: 'Fiyat Odaklı', color: '#EF4444', description: 'Fiyata çok duyarlı' },
      { name: 'Teknik Odaklı', color: '#3B82F6', description: 'Teknik detaylara önem veren' },
      { name: 'Büyük Firma', color: '#8B5CF6', description: 'Büyük ölçekli firma' },
      { name: 'Startup', color: '#06B6D4', description: 'Yeni kurulan firma' },
      { name: 'Referans', color: '#84CC16', description: 'Referans yoluyla gelen' },
      { name: 'Sorunlu', color: '#EF4444', description: 'Problemli müşteri' },
    ]

    for (const labelType of defaultLabelTypes) {
      await prisma.customerLabelType.upsert({
        where: { name: labelType.name },
        update: {},
        create: labelType
      })
    }

    console.log('✅ Customer label types seeded successfully')

  } catch (error) {
    console.error('❌ Error seeding customer types:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedCustomerTypes()
}

module.exports = seedCustomerTypes