import { jsPDF } from 'jspdf'
import { PdfExportData } from './types'

export class PdfGenerator {
  private static instance: PdfGenerator

  static getInstance(): PdfGenerator {
    if (!PdfGenerator.instance) {
      PdfGenerator.instance = new PdfGenerator()
    }
    return PdfGenerator.instance
  }

  /**
   * Teklif PDF'i oluşturur
   */
  async generateQuotationPdf(data: PdfExportData): Promise<Blob> {
    const { quotation, exchangeRate } = data
    
    // A4 PDF oluştur
    const pdf = new jsPDF()
    
    // Türkçe karakterler için font ayarı (Helvetica Unicode destekler)
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    
    let yPosition = 20

    // Header - Şirket bilgileri
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MAPOS', 20, yPosition)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('POS Sistemleri Çözümleri', 20, yPosition + 8)
    
    // Sağ üst köşede teklif numarası
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TEKLİF', pageWidth - 50, yPosition, { align: 'right' })
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(quotation.quotationNumber, pageWidth - 50, yPosition + 8, { align: 'right' })
    
    yPosition += 30

    // Çizgi
    pdf.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 15

    // Müşteri bilgileri
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Müşteri Bilgileri:', 20, yPosition)
    yPosition += 8

    pdf.setFont('helvetica', 'normal')
    pdf.text(`Şirket: ${quotation.customer.companyName}`, 20, yPosition)
    yPosition += 6
    pdf.text(`İletişim: ${quotation.customer.contactName}`, 20, yPosition)
    yPosition += 6
    pdf.text(`E-posta: ${quotation.customer.email}`, 20, yPosition)
    yPosition += 6
    if (quotation.customer.phone) {
      pdf.text(`Telefon: ${quotation.customer.phone}`, 20, yPosition)
      yPosition += 6
    }

    yPosition += 10

    // Teklif bilgileri
    pdf.setFont('helvetica', 'bold')
    pdf.text('Teklif Bilgileri:', 20, yPosition)
    yPosition += 8

    pdf.setFont('helvetica', 'normal')
    pdf.text(`Başlık: ${quotation.title}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Tarih: ${quotation.createdAt.toLocaleDateString('tr-TR')}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Geçerlilik: ${quotation.validUntil.toLocaleDateString('tr-TR')}`, 20, yPosition)
    yPosition += 6

    if (quotation.description) {
      pdf.text(`Açıklama: ${quotation.description}`, 20, yPosition)
      yPosition += 6
    }

    yPosition += 15

    // Ürünler tablosu
    pdf.setFont('helvetica', 'bold')
    pdf.text('Ürünler:', 20, yPosition)
    yPosition += 10

    // Tablo başlıkları
    const colX = [20, 100, 125, 155, 180]

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    // Başlık arka planı
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, yPosition - 2, pageWidth - 40, 8, 'F')
    
    pdf.text('Ürün Adı', colX[0] + 2, yPosition + 4)
    pdf.text('Miktar', colX[1] + 2, yPosition + 4)
    pdf.text('Birim Fiyat', colX[2] + 2, yPosition + 4)
    pdf.text('P.B.', colX[3] + 2, yPosition + 4)
    pdf.text('Toplam', colX[4] + 2, yPosition + 4)

    yPosition += 10

    // Ürün satırları
    pdf.setFont('helvetica', 'normal')
    quotation.items.forEach((item, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }

      const bgColor = index % 2 === 0 ? 250 : 255
      pdf.setFillColor(bgColor, bgColor, bgColor)
      pdf.rect(20, yPosition - 2, pageWidth - 40, 8, 'F')

      pdf.text(item.productName, colX[0] + 2, yPosition + 4)
      pdf.text(item.quantity.toString(), colX[1] + 2, yPosition + 4)
      pdf.text(this.formatPrice(item.unitPrice), colX[2] + 2, yPosition + 4)
      pdf.text(item.currency, colX[3] + 2, yPosition + 4)
      pdf.text(this.formatPrice(item.totalPrice), colX[4] + 2, yPosition + 4)

      yPosition += 8
    })

    yPosition += 10

    // Toplam tutarlar
    pdf.setFont('helvetica', 'bold')
    
    // TL Toplam
    if (quotation.totalTL) {
      pdf.text(`Toplam (TL): ${this.formatPrice(quotation.totalTL)} ₺`, pageWidth - 80, yPosition, { align: 'right' })
      yPosition += 8
    }

    // USD Toplam
    if (quotation.totalUSD) {
      pdf.text(`Toplam (USD): $${this.formatPrice(quotation.totalUSD)}`, pageWidth - 80, yPosition, { align: 'right' })
      yPosition += 8
    }

    // Döviz kuru
    if (exchangeRate && quotation.totalUSD) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`* USD/TL Kuru: ${exchangeRate.toFixed(4)}`, pageWidth - 80, yPosition, { align: 'right' })
      yPosition += 10
    }

    // Şartlar ve koşullar
    if (quotation.terms) {
      yPosition += 10
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Şartlar ve Koşullar:', 20, yPosition)
      yPosition += 8

      pdf.setFont('helvetica', 'normal')
      const terms = pdf.splitTextToSize(quotation.terms, pageWidth - 40)
      pdf.text(terms, 20, yPosition)
      yPosition += terms.length * 6
    }

    // Footer
    const footerY = pageHeight - 20
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('MAPOS - POS Sistemleri Çözümleri', 20, footerY)
    pdf.text(`Sayfa 1`, pageWidth - 30, footerY, { align: 'right' })

    // PDF blob olarak döndür
    const pdfBlob = pdf.output('blob')
    return pdfBlob
  }

  /**
   * PDF'i indir
   */
  async downloadQuotationPdf(data: PdfExportData, filename?: string): Promise<void> {
    const pdfBlob = await this.generateQuotationPdf(data)
    const defaultFilename = `Teklif_${data.quotation.quotationNumber}_${new Date().toISOString().split('T')[0]}.pdf`
    
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || defaultFilename
    link.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * Para formatı
   */
  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
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