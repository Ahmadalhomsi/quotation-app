import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'
import { PdfExportData } from './types'

// Register fonts for better Turkish character support
Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 'bold',
    },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
    padding: 25,
    fontFamily: 'Open Sans',
    fontSize: 10,
  },
  header: {
    backgroundColor: '#FF6B35', // Simplified - no gradient support
    padding: 20,
    marginBottom: 20,
    marginLeft: -25,
    marginRight: -25,
    marginTop: -25,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 11,
    color: '#E8EEFF',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 9,
    color: '#FFE5CC',
    textAlign: 'right',
  },
  quotationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  quotationLeft: {
    flex: 1,
  },
  quotationRight: {
    flex: 1,
    textAlign: 'right',
  },
  quotationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 6,
  },
  quotationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  quotationDate: {
    fontSize: 10,
    color: '#666666',
    marginTop: 3,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    padding: 4,
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
    marginTop: 15,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  customerInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  customerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  customerText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#555555',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    padding: 10,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 35,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  productName: {
    flex: 3.5,
  },
  quantity: {
    flex: 1,
    textAlign: 'center',
  },
  unitPrice: {
    flex: 2,
    textAlign: 'right',
  },
  total: {
    flex: 2,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
    padding: 15,
    width: 200,
  },
  totalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 2,
  },
  totalsLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  totalsValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exchangeRate: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  termsSection: {
    marginTop: 15,
    marginBottom: 40,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF6B35',
  },
  termsText: {
    fontSize: 10,
    marginBottom: 10,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 10,
    marginBottom: 15,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 10,
  },
  productType: {
    fontSize: 8,
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
})

interface QuotationPDFProps {
  data: PdfExportData
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ data }) => {
  const { quotation, companyInfo, exchangeRate } = data

  // Format price with Turkish locale
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('tr-TR')
  }

  // Safe exchange rate formatting
  const formatExchangeRate = (rate: number | string | undefined): string => {
    if (!rate) return '30.0000'
    const numRate = typeof rate === 'string' ? parseFloat(rate) : rate
    return isNaN(numRate) ? '30.0000' : numRate.toFixed(4)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text style={styles.companyTagline}>POS Sistemleri ve Teknoloji Çözümleri</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text>{companyInfo.phone}</Text>
              <Text>{companyInfo.email}</Text>
              <Text>{companyInfo.website}</Text>
            </View>
          </View>
        </View>

        {/* Quotation Info */}
        <View style={styles.quotationInfo}>
          <View style={styles.quotationLeft}>
            <Text style={styles.quotationTitle}>
              TEKLİF
            </Text>
            <Text style={styles.quotationNumber}>
              No: {quotation.quotationNumber}
            </Text>
            <Text style={styles.quotationDate}>
              Tarih: {formatDate(quotation.createdAt)}
            </Text>
            {quotation.validUntil && (
              <Text style={styles.quotationDate}>
                Geçerlilik: {formatDate(quotation.validUntil)}
              </Text>
            )}
          </View>
          <View style={styles.quotationRight}>
            <Text style={styles.statusTitle}>
              DURUM
            </Text>
            <Text style={styles.statusText}>
              {quotation.status === 'DRAFT' && 'Taslak'}
              {quotation.status === 'SENT' && 'Gönderildi'}
              {quotation.status === 'ACCEPTED' && 'Kabul Edildi'}
              {quotation.status === 'REJECTED' && 'Reddedildi'}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <Text style={styles.sectionTitle}>MÜŞTERİ BİLGİLERİ</Text>
        <View style={styles.customerInfo}>
          <Text style={styles.customerTitle}>{quotation.customer.companyName}</Text>
          <Text style={styles.customerText}>İletişim: {quotation.customer.contactName}</Text>
          <Text style={styles.customerText}>E-posta: {quotation.customer.email}</Text>
          {quotation.customer.phone && (
            <Text style={styles.customerText}>Telefon: {quotation.customer.phone}</Text>
          )}
          {quotation.customer.address && (
            <Text style={styles.customerText}>Adres: {quotation.customer.address}</Text>
          )}
          {quotation.customer.taxNumber && (
            <Text style={styles.customerText}>Vergi No: {quotation.customer.taxNumber}</Text>
          )}
          {quotation.customer.taxOffice && (
            <Text style={styles.customerText}>Vergi Dairesi: {quotation.customer.taxOffice}</Text>
          )}
        </View>

        {/* Quotation Title and Description */}
        <Text style={styles.sectionTitle}>{quotation.title}</Text>
        {quotation.description && (
          <Text style={styles.descriptionText}>
            {quotation.description}
          </Text>
        )}

        {/* Items Table */}
        <Text style={styles.sectionTitle}>ÜRÜNLER VE HİZMETLER</Text>
        
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.productName]}>ÜRÜN / HİZMET</Text>
          <Text style={[styles.tableHeaderText, styles.quantity]}>MİKTAR</Text>
          <Text style={[styles.tableHeaderText, styles.unitPrice]}>BİRİM FİYAT</Text>
          <Text style={[styles.tableHeaderText, styles.total]}>TOPLAM</Text>
        </View>

        {/* Table Rows */}
        {quotation.items.map((item, index) => (
          <View 
            key={item.id} 
            style={[
              styles.tableRow, 
              index % 2 === 0 ? styles.tableRowEven : {}
            ]}
          >
            <View style={styles.productName}>
              <Text style={styles.tableCellBold}>{item.product.name}</Text>
              <Text style={styles.productType}>
                {item.product.type === 'SOFTWARE' ? 'Yazılım' : 'Donanım'}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.quantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.unitPrice]}>
              {item.currency === 'TL' 
                ? `${formatPrice(item.unitPrice)} ₺`
                : `$${formatPrice(item.unitPrice)}`
              }
            </Text>
            <Text style={[styles.tableCellBold, styles.total]}>
              {item.currency === 'TL' 
                ? `${formatPrice(item.totalPrice)} ₺`
                : `$${formatPrice(item.totalPrice)}`
              }
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection} wrap={false}>
          <View style={styles.totalsBox}>
            <Text style={styles.totalsTitle}>TOPLAM TUTAR</Text>
            {quotation.totalTL && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Türk Lirası:</Text>
                <Text style={styles.totalsValue}>{formatPrice(quotation.totalTL)} ₺</Text>
              </View>
            )}
            {quotation.totalUSD && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>ABD Doları:</Text>
                <Text style={styles.totalsValue}>${formatPrice(quotation.totalUSD)}</Text>
              </View>
            )}
            {exchangeRate && quotation.totalUSD && (
              <Text style={styles.exchangeRate}>
                Döviz Kuru: {formatExchangeRate(exchangeRate)} TL/USD
              </Text>
            )}
          </View>
        </View>

        {/* Terms and Notes */}
        {(quotation.terms || quotation.notes) && (
          <View style={styles.termsSection} wrap={false}>
            {quotation.terms && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.termsTitle}>ŞARTLAR</Text>
                <Text style={styles.termsText}>{quotation.terms}</Text>
              </View>
            )}
            {quotation.notes && (
              <View>
                <Text style={styles.termsTitle}>NOTLAR</Text>
                <Text style={styles.termsText}>{quotation.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {companyInfo.name} - {companyInfo.address} - Tel: {companyInfo.phone} - {companyInfo.email}
          {companyInfo.taxNumber && ` - Vergi No: ${companyInfo.taxNumber}`}
          {companyInfo.taxOffice && ` - Vergi Dairesi: ${companyInfo.taxOffice}`}
        </Text>
      </Page>
    </Document>
  )
}

// Export functions for compatibility with existing code
export class ReactPdfGenerator {
  static async generateQuotationPdf(data: PdfExportData): Promise<Blob> {
    const doc = <QuotationPDF data={data} />
    const pdfBlob = await pdf(doc).toBlob()
    return pdfBlob
  }

  static async downloadQuotationPdf(data: PdfExportData, filename: string = 'teklif.pdf'): Promise<void> {
    const pdfBlob = await this.generateQuotationPdf(data)
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Simple function for direct PDF generation (compatibility with existing code)
export async function generatePDF(quotationData: PdfExportData['quotation']): Promise<void> {
  const data: PdfExportData = {
    quotation: quotationData,
    companyInfo: {
      name: 'MAPOS',
      address: 'İstanbul, Türkiye',
      phone: '+90 (555) 123-4567',
      email: 'info@mapos.com.tr',
      website: 'www.mapos.com.tr',
      taxNumber: '1234567890',
      taxOffice: 'Kadıköy'
    },
    exchangeRate: 30.0
  }
  
  await ReactPdfGenerator.downloadQuotationPdf(data, `teklif-${quotationData.quotationNumber}.pdf`)
}

export default QuotationPDF