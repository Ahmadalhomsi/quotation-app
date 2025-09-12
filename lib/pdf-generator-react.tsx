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
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Open Sans',
  },
  header: {
    backgroundColor: '#FF8C00',
    padding: 20,
    marginBottom: 20,
    marginLeft: -20,
    marginRight: -20,
    marginTop: -20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 9,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  quotationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  quotationLeft: {
    flex: 1,
  },
  quotationRight: {
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10,
    marginTop: 15,
  },
  customerInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  customerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerText: {
    fontSize: 10,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FF8C00',
    padding: 8,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableRowEven: {
    backgroundColor: '#F8F9FA',
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  productName: {
    flex: 3,
  },
  quantity: {
    flex: 1,
    textAlign: 'center',
  },
  unitPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  currency: {
    flex: 1,
    textAlign: 'center',
  },
  total: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsBox: {
    backgroundColor: '#F8F9FA',
    border: '2px solid #FF8C00',
    padding: 15,
    width: 200,
    borderRadius: 5,
  },
  totalsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalsLabel: {
    fontSize: 10,
  },
  totalsValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  exchangeRate: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  termsSection: {
    marginTop: 30,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF8C00' }}>
              TEKLİF
            </Text>
            <Text style={{ fontSize: 14, marginTop: 5 }}>
              No: {quotation.quotationNumber}
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>
              Tarih: {formatDate(quotation.createdAt)}
            </Text>
            {quotation.validUntil && (
              <Text style={{ fontSize: 10, marginTop: 2 }}>
                Geçerlilik: {formatDate(quotation.validUntil)}
              </Text>
            )}
          </View>
          <View style={styles.quotationRight}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
              DURUM
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>
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
          <Text style={{ fontSize: 10, marginBottom: 15, lineHeight: 1.4 }}>
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
          <Text style={[styles.tableHeaderText, styles.currency]}>P.B.</Text>
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
              <Text style={{ fontSize: 8, color: '#666' }}>
                {item.product.type === 'SOFTWARE' ? 'Yazılım' : 'Donanım'}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.quantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.unitPrice]}>
              {formatPrice(item.unitPrice)}
            </Text>
            <Text style={[styles.tableCell, styles.currency]}>{item.currency}</Text>
            <Text style={[styles.tableCellBold, styles.total]}>
              {item.currency === 'TL' 
                ? `${formatPrice(item.totalPrice)} ₺`
                : `$${formatPrice(item.totalPrice)}`
              }
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <Text style={styles.totalsTitle}>TOPLAM TUTAR</Text>
            {quotation.totalTL && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TL:</Text>
                <Text style={styles.totalsValue}>{formatPrice(quotation.totalTL)} ₺</Text>
              </View>
            )}
            {quotation.totalUSD && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>USD:</Text>
                <Text style={styles.totalsValue}>${formatPrice(quotation.totalUSD)}</Text>
              </View>
            )}
            {exchangeRate && quotation.totalUSD && (
              <Text style={styles.exchangeRate}>
                Döviz Kuru: {exchangeRate.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {/* Terms and Notes */}
        {(quotation.terms || quotation.notes) && (
          <View style={styles.termsSection}>
            {quotation.terms && (
              <View>
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
export async function generatePDF(quotationData: any): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: PdfExportData = {
    quotation: quotationData as any, // Type assertion for compatibility
    companyInfo: {
      name: 'MAPOS',
      address: 'İstanbul, Türkiye',
      phone: '+90 (555) 123-4567',
      email: 'info@mapos.com.tr',
      website: 'www.mapos.com.tr',
      taxNumber: '1234567890',
      taxOffice: 'Kadıköy'
    },
    exchangeRate: quotationData.exchangeRate || 30.0
  }
  
  await ReactPdfGenerator.downloadQuotationPdf(data, `teklif-${quotationData.quotationNumber}.pdf`)
}

export default QuotationPDF