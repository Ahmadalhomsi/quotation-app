/* eslint-disable @typescript-eslint/no-explicit-any */
import { PdfExportData } from './types'
import { ReactPdfGenerator } from './pdf-generator-react'

// Legacy jsPDF implementation kept for fallback
import { jsPDF } from 'jspdf'

export class PdfGenerator {
  private static instance: PdfGenerator

  static getInstance(): PdfGenerator {
    if (!PdfGenerator.instance) {
      PdfGenerator.instance = new PdfGenerator()
    }
    return PdfGenerator.instance
  }

  /**
   * Use React-PDF for better Turkish character support
   */
  async generateQuotationPdf(data: PdfExportData): Promise<Blob> {
    try {
      return await ReactPdfGenerator.generateQuotationPdf(data)
    } catch (error) {
      console.warn('React-PDF failed, falling back to jsPDF:', error)
      return this.generateLegacyPdf(data)
    }
  }

  async downloadQuotationPdf(data: PdfExportData, filename: string = 'teklif.pdf'): Promise<void> {
    try {
      await ReactPdfGenerator.downloadQuotationPdf(data, filename)
    } catch (error) {
      console.warn('React-PDF failed, falling back to jsPDF:', error)
      const blob = await this.generateLegacyPdf(data)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Legacy jsPDF implementation (fallback)
   */
  private async generateLegacyPdf(data: PdfExportData): Promise<Blob> {
    const { quotation, exchangeRate } = data
    
    // A4 PDF oluştur
    const pdf = new jsPDF()
    
    // Sayfa boyutları
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    const margin = 20
    
    let yPosition = 20

    // HEADER SECTION
    pdf.setFillColor(255, 140, 0) // Turuncu renk
    pdf.rect(0, 0, pageWidth, 50, 'F')
    
    // Şirket adı - büyük ve beyaz
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MAPOS', margin, 25)
    
    // Alt başlık
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('POS Sistemleri ve Teknoloji Cozumleri', margin, 35)
    
    // İletişim bilgileri - sağ üst
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    pdf.text('+90 (555) 123-4567', pageWidth - margin - 50, 20, { align: 'right' })
    pdf.text('info@mapos.com.tr', pageWidth - margin - 50, 28, { align: 'right' })
    pdf.text('www.mapos.com.tr', pageWidth - margin - 50, 36, { align: 'right' })

    yPosition = 70

    // TEKLIF BILGILERI
    pdf.setFillColor(248, 249, 250)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F')
    
    pdf.setTextColor(255, 140, 0)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TEKLIF', margin + 10, yPosition + 15)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.text(`No: ${quotation.quotationNumber}`, margin + 10, yPosition + 25)
    
    pdf.setFontSize(10)
    const createdDate = new Date(quotation.createdAt).toLocaleDateString('tr-TR')
    pdf.text(`Tarih: ${createdDate}`, margin + 10, yPosition + 32)

    // Sağ taraf - durum
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DURUM', pageWidth - margin - 60, yPosition + 15)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const statusText = this.getStatusText(quotation.status)
    pdf.text(statusText, pageWidth - margin - 60, yPosition + 25)

    yPosition += 50

    // MUSTERI BILGILERI
    pdf.setTextColor(255, 140, 0)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MUSTERI BILGILERI', margin, yPosition)
    
    yPosition += 10
    
    pdf.setFillColor(248, 249, 250)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F')
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(quotation.customer.companyName, margin + 10, yPosition + 10)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Yetkili: ${quotation.customer.contactName}`, margin + 10, yPosition + 18)
    pdf.text(`E-posta: ${quotation.customer.email}`, margin + 10, yPosition + 25)
    
    if (quotation.customer.phone) {
      pdf.text(`Tel: ${quotation.customer.phone}`, pageWidth - margin - 80, yPosition + 18)
    }

    yPosition += 45

    // TEKLIF BASLIGI VE ACIKLAMA
    if (quotation.title) {
      pdf.setTextColor(255, 140, 0)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(quotation.title, margin, yPosition)
      yPosition += 15
    }
    
    if (quotation.description) {
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const descLines = pdf.splitTextToSize(quotation.description, pageWidth - 2 * margin)
      pdf.text(descLines, margin, yPosition)
      yPosition += descLines.length * 5 + 10
    }

    // URUNLER TABLOSU
    pdf.setTextColor(255, 140, 0)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('URUNLER VE HIZMETLER', margin, yPosition)
    
    yPosition += 15

    // Tablo başlıkları
    pdf.setFillColor(255, 140, 0)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    const col1X = margin + 5
    const col2X = margin + 90
    const col3X = margin + 115
    const col4X = margin + 140
    const col6X = pageWidth - margin - 5
    
    pdf.text('URUN / HIZMET', col1X, yPosition + 8)
    pdf.text('MIKTAR', col2X, yPosition + 8)
    pdf.text('BIRIM', col3X, yPosition + 8)
    pdf.text('P.B.', col4X, yPosition + 8)
    pdf.text('TOPLAM', col6X, yPosition + 8, { align: 'right' })
    
    yPosition += 12
    pdf.setTextColor(0, 0, 0)

    // Ürün satırları
    quotation.items.forEach((item, index) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 30
      }

      // Zebra efekti
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250)
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F')
      }

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.product.name, col1X, yPosition + 8)
      
      // Ürün tipi
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const typeText = item.product.type === 'SOFTWARE' ? 'Yazilim' : 'Donanim'
      pdf.text(typeText, col1X, yPosition + 15)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.text(item.quantity.toString(), col2X, yPosition + 8)
      pdf.text(this.formatPrice(item.unitPrice), col3X, yPosition + 8)
      pdf.text(item.currency, col4X, yPosition + 8)
      
      // Toplam - kalın ve sağa yaslı
      pdf.setFont('helvetica', 'bold')
      const totalText = item.currency === 'TL' ? 
        `${this.formatPrice(item.totalPrice)} TL` : 
        `$${this.formatPrice(item.totalPrice)}`
      pdf.text(totalText, col6X, yPosition + 8, { align: 'right' })

      yPosition += 20
    })

    // TOPLAM TUTARLAR
    yPosition += 10
    
    // Toplam kutusu
    const totalBoxHeight = 40
    pdf.setFillColor(248, 249, 250)
    pdf.rect(pageWidth - margin - 100, yPosition, 100, totalBoxHeight, 'F')
    pdf.setDrawColor(255, 140, 0) // Turuncu kenarlık
    pdf.setLineWidth(1)
    pdf.rect(pageWidth - margin - 100, yPosition, 100, totalBoxHeight)
    
    let totalY = yPosition + 10
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 140, 0) // Turuncu başlık
    pdf.text('TOPLAM TUTAR', pageWidth - margin - 95, totalY)
    
    totalY += 10
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    
    if (quotation.totalTL) {
      pdf.text(`TL: ${this.formatPrice(quotation.totalTL)} TL`, pageWidth - margin - 95, totalY)
      totalY += 8
    }
    
    if (quotation.totalUSD) {
      pdf.text(`USD: $${this.formatPrice(quotation.totalUSD)}`, pageWidth - margin - 95, totalY)
    }
    
    // Döviz kuru bilgisi
    if (exchangeRate && quotation.totalUSD) {
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      const rateNumber = typeof exchangeRate === 'number' ? exchangeRate : parseFloat(String(exchangeRate))
      const rateText = Number.isFinite(rateNumber) ? rateNumber.toFixed(4) : String(exchangeRate)
      pdf.text(`Kur: ${rateText}`, pageWidth - margin - 95, yPosition + totalBoxHeight - 5)
    }
    
    yPosition += totalBoxHeight + 20

    // SARTLAR VE NOTLAR
    if (quotation.terms || quotation.notes) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 30
      }

      if (quotation.terms) {
        pdf.setTextColor(255, 140, 0)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('SARTLAR', margin, yPosition)
        
        yPosition += 8
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const termsLines = pdf.splitTextToSize(quotation.terms, pageWidth - 2 * margin)
        pdf.text(termsLines, margin, yPosition)
        yPosition += termsLines.length * 5 + 10
      }

      if (quotation.notes) {
        pdf.setTextColor(255, 140, 0)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('NOTLAR', margin, yPosition)
        
        yPosition += 8
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const notesLines = pdf.splitTextToSize(quotation.notes, pageWidth - 2 * margin)
        pdf.text(notesLines, margin, yPosition)
      }
    }

    // FOOTER
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(
      'MAPOS - Istanbul, Turkiye - Tel: +90 (555) 123-4567 - info@mapos.com.tr',
      pageWidth / 2, 
      pageHeight - 10, 
      { align: 'center' }
    )

    // Convert to blob
    const pdfOutput = pdf.output('blob')
    return pdfOutput
  }

  /**
   * Durum metni
   */
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Taslak',
      'SENT': 'Gonderildi',
      'ACCEPTED': 'Kabul Edildi',
      'REJECTED': 'Reddedildi',
      'EXPIRED': 'Suresi Doldu'
    }
    return statusMap[status] || status
  }

  /**
   * Para formatı - jsPDF uyumluluğu için İngilizce format
   */
  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }
}

// Singleton instance
export const pdfGenerator = PdfGenerator.getInstance()

// Utility functions
export async function generateQuotationPdf(data: PdfExportData): Promise<Blob> {
  return pdfGenerator.generateQuotationPdf(data)
}

export async function downloadQuotationPdf(data: PdfExportData, filename?: string): Promise<void> {
  return pdfGenerator.downloadQuotationPdf(data, filename)
}

// Simple function for direct PDF generation (compatibility)
export function generatePDF(quotationData: any): void {
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
    exchangeRate: quotationData.exchangeRate || 30.0
  }
  
  pdfGenerator.downloadQuotationPdf(data, `teklif-${quotationData.quotationNumber}.pdf`)
}