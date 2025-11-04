import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer'
import { PdfExportData } from './types'

// Register fonts
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

// Create modern, compact styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30, // Add extra bottom padding for footer space
    fontFamily: 'Open Sans',
    fontSize: 9,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 20, // Ensure content doesn't overlap with footer
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 15,
    marginBottom: 15,
    marginHorizontal: -20,
    marginTop: -20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 10,
    color: '#E8EEFF',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 8,
    color: '#E8EEFF',
    textAlign: 'right',
  },
  quotationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    minHeight: 120,
  },
  quotationLeft: {
    flex: 1,
  },
  quotationRight: {
    flex: 1,
    textAlign: 'right',
    paddingLeft: 12,
  },
  quotationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  quotationNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 3,
  },
  quotationDate: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  statusTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    padding: 3,
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
    textAlign: 'center',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    marginTop: 12,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
  },
  customerInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
  },
  customerText: {
    fontSize: 9,
    marginBottom: 2,
    color: '#6B7280',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    padding: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  productName: {
    flex: 3.5,
    flexDirection: 'row',
  },
  productInfo: {
    flex: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
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
    marginTop: 15,
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  totalsBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    width: 200,
    borderRadius: 4,
  },
  totalsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 1,
  },
  totalsLabel: {
    fontSize: 9,
    color: '#374151',
    fontWeight: 'bold',
    flex: 1,
  },
  totalsValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
    flex: 0.8,
  },
  exchangeRate: {
    fontSize: 7,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  termsSection: {
    marginTop: 12,
    marginBottom: 30,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#FF6B35',
  },
  termsText: {
    fontSize: 9,
    marginBottom: 8,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 9,
    marginBottom: 12,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
  },
  productType: {
    fontSize: 7,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7,
    color: '#6B7280',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    lineHeight: 1.4,
    backgroundColor: '#FFFFFF', // Add background to ensure it doesn't get overlapped
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
        <View style={styles.contentContainer}>
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
              {quotation.title}
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
            
            {/* Customer Information */}
            <Text style={[styles.statusTitle, { marginTop: 12 }]}>
              MÜŞTERİ BİLGİLERİ
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.customerText, { fontSize: 8, fontWeight: 'bold', color: '#374151' }]}>
                {quotation.customer.companyName}
              </Text>
              <Text style={[styles.customerText, { fontSize: 7 }]}>
                {quotation.customer.contactName}
              </Text>
              <Text style={[styles.customerText, { fontSize: 7 }]}>
                {quotation.customer.email}
              </Text>
              {quotation.customer.phone && (
                <Text style={[styles.customerText, { fontSize: 7 }]}>
                  {quotation.customer.phone}
                </Text>
              )}
              {quotation.customer.address && (
                <Text style={[styles.customerText, { fontSize: 7 }]}>
                  {quotation.customer.address}
                </Text>
              )}
              {quotation.customer.taxNumber && (
                <Text style={[styles.customerText, { fontSize: 7 }]}>
                  Vergi No: {quotation.customer.taxNumber}
                </Text>
              )}
              {quotation.customer.taxOffice && (
                <Text style={[styles.customerText, { fontSize: 7 }]}>
                  V.D: {quotation.customer.taxOffice}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Quotation Description */}
        {quotation.description && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>AÇIKLAMA</Text>
            <Text style={styles.descriptionText}>
              {quotation.description}
            </Text>
          </View>
        )}

        {/* Items Table */}
        <Text style={styles.sectionTitle}>ÜRÜNLER VE HİZMETLER</Text>
        
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.productName]}>ÜRÜN / HİZMET</Text>
          <Text style={[styles.tableHeaderText, styles.quantity]}>MİKTAR</Text>
          <Text style={[styles.tableHeaderText, styles.unitPrice]}>BİRİM FİYAT</Text>
          <Text style={[styles.tableHeaderText, styles.unitPrice]}>İSKONTO</Text>
          <Text style={[styles.tableHeaderText, styles.quantity]}>KDV</Text>
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
            wrap={false}
          >
            <View style={styles.productName}>
              {item.product.photoUrl && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image 
                  style={styles.productImage} 
                  src={item.product.photoUrl}
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.tableCellBold}>{item.product.name}</Text>
                {item.product.description && (
                  <Text style={[styles.productType, { marginTop: 2 }]}>
                    {item.product.description}
                  </Text>
                )}
              </View>
            </View>
            <Text style={[styles.tableCell, styles.quantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.unitPrice]}>
              {item.currency === 'TL' 
                ? `${formatPrice(item.unitPrice)} TL`
                : `$${formatPrice(item.unitPrice)}`
              }
            </Text>
            <Text style={[styles.tableCell, styles.unitPrice]}>
              {item.discount ? `%${item.discount}` : '-'}
            </Text>
            <Text style={[styles.tableCell, styles.quantity]}>
              %{item.kdvRate || 20}
            </Text>
            <Text style={[styles.tableCellBold, styles.total]}>
              {item.currency === 'TL' 
                ? `${formatPrice(item.totalPrice)} TL`
                : `$${formatPrice(item.totalPrice)}`
              }
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection} wrap={false}>
          <View style={styles.totalsBox}>
            <Text style={styles.totalsTitle}>TOPLAM TUTAR</Text>
            
            {/* Show subtotals if KDV is enabled */}
            {quotation.kdvEnabled && (
              <>
                {quotation.totalTL && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Ara Toplam (TL):</Text>
                    <Text style={styles.totalsValue}>
                      {formatPrice(quotation.totalTL / (1 + (quotation.kdvRate || 20) / 100))} TL
                    </Text>
                  </View>
                )}
                {quotation.totalUSD && (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Ara Toplam (USD):</Text>
                    <Text style={styles.totalsValue}>
                      ${formatPrice(quotation.totalUSD / (1 + (quotation.kdvRate || 20) / 100))}
                    </Text>
                  </View>
                )}
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>KDV (%{quotation.kdvRate || 20}):</Text>
                  <Text style={styles.totalsValue}>
                    {formatPrice((quotation.totalTL || 0) - (quotation.totalTL || 0) / (1 + (quotation.kdvRate || 20) / 100))} TL
                  </Text>
                </View>
              </>
            )}
            
            {quotation.totalTL && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  {quotation.kdvEnabled ? 'KDV Dahil Toplam (TL):' : 'Toplam (TL):'}
                </Text>
                <Text style={styles.totalsValue}>{formatPrice(quotation.totalTL)} TL</Text>
              </View>
            )}
            {quotation.totalUSD && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  {quotation.kdvEnabled ? 'KDV Dahil Toplam (USD):' : 'Toplam (USD):'}
                </Text>
                <Text style={styles.totalsValue}>${formatPrice(quotation.totalUSD)}</Text>
              </View>
            )}
            
            {/* KDV Warning if disabled */}
            {!quotation.kdvEnabled && (
              <Text style={[styles.exchangeRate, { color: '#DC2626', fontWeight: 'bold', marginTop: 8 }]}>
                ⚠️ KDV DAHİL DEĞİLDİR
              </Text>
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
              <View style={{ marginBottom: 8 }}>
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
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          MAPOS - Yeşilove Mah. 2602. Sk. No:3/A Küçükçekmece / İSTANBUL - Tel: +90 537 204 99 81 - info@mapos.com.tr
          {'\n'}Vergi No: 4810571592 - Küçükçekmece V.D
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

  static async downloadQuotationPdf(data: PdfExportData, filename?: string): Promise<void> {
    const pdfBlob = await this.generateQuotationPdf(data)
    
    // Generate default filename if not provided
    let finalFilename = filename
    if (!finalFilename) {
      const customerName = sanitizeFilename(data.quotation.customer.contactName)
      const companyName = sanitizeFilename(data.quotation.customer.companyName)
      finalFilename = `${customerName}_${companyName}.pdf`
    }
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Helper function to sanitize filename
const sanitizeFilename = (str: string): string => {
  // First convert Turkish characters to English equivalents
  const turkishToEnglish = (text: string): string => {
    const turkishChars: Record<string, string> = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'I': 'I',
      'İ': 'I', 'i': 'i',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    }
    
    return text.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, (match) => turkishChars[match] || match)
  }
  
  return turkishToEnglish(str)
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Simple function for direct PDF generation (compatibility with existing code)
export async function generatePDF(quotationData: PdfExportData['quotation']): Promise<void> {
  const data: PdfExportData = {
    quotation: quotationData,
    companyInfo: {
      name: 'MAPOS',
      address: 'İstanbul, Türkiye',
      phone: '+90 537 204 99 81',
      email: 'info@mapos.com.tr',
      website: 'www.mapos.com.tr',
      taxNumber: '4810571592',
      taxOffice: 'Küçükçekmece V.D'
    },
    exchangeRate: 30.0
  }
  
  // Create filename with customer name and company name
  const customerName = sanitizeFilename(quotationData.customer.contactName)
  const companyName = sanitizeFilename(quotationData.customer.companyName)
  const filename = `${customerName}_${companyName}.pdf`
  
  await ReactPdfGenerator.downloadQuotationPdf(data, filename)
}

export default QuotationPDF