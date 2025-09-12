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
   * Teklif PDF'i oluşturur - Gelişmiş tasarım
   */
  async generateQuotationPdf(data: PdfExportData): Promise<Blob> {
    const { quotation, exchangeRate } = data
    
    // A4 PDF oluştur
    const pdf = new jsPDF()
    
    // Sayfa boyutları
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    const margin = 20
    
    let yPosition = 20

    // =================
    // HEADER SECTION
    // =================
    
    // Şirket logosu alanı (mavi arka plan)
    pdf.setFillColor(41, 98, 255) // MAPOS mavi rengi
    pdf.rect(0, 0, pageWidth, 50, 'F')
    
    // Şirket adı - büyük ve beyaz
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MAPOS', margin, 25)
    
    // Alt başlık
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('POS Sistemleri ve Teknoloji Çözümleri', margin, 35)
    
    // İletişim bilgileri - sağ üst
    pdf.setFontSize(9)
    pdf.setTextColor(255, 255, 255)
    const contactX = pageWidth - margin
    pdf.text('info@mapos.com', contactX, 20, { align: 'right' })
    pdf.text('+90 212 000 00 00', contactX, 28, { align: 'right' })
    pdf.text('www.mapos.com', contactX, 36, { align: 'right' })
    
    // Rengi siyaha döndür
    pdf.setTextColor(0, 0, 0)
    yPosition = 70

    // =================
    // DOCUMENT INFO
    // =================
    
    // Sol taraf - Müşteri bilgileri
    pdf.setFillColor(248, 249, 250)
    pdf.rect(margin, yPosition, (pageWidth - 3 * margin) / 2, 70, 'F')
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 98, 255)
    pdf.text('FATURA ADRESİ', margin + 10, yPosition + 15)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(quotation.customer.companyName, margin + 10, yPosition + 25)
    
    pdf.setFont('helvetica', 'normal')
    pdf.text(quotation.customer.contactName, margin + 10, yPosition + 33)
    pdf.text(quotation.customer.email, margin + 10, yPosition + 41)
    if (quotation.customer.phone) {
      pdf.text(quotation.customer.phone, margin + 10, yPosition + 49)
    }
    if (quotation.customer.address) {
      const addressLines = pdf.splitTextToSize(quotation.customer.address, 80)
      pdf.text(addressLines, margin + 10, yPosition + 57)
    }

    // Sağ taraf - Teklif bilgileri
    const rightBoxX = margin + (pageWidth - 3 * margin) / 2 + 10
    pdf.setFillColor(41, 98, 255)
    pdf.rect(rightBoxX, yPosition, (pageWidth - 3 * margin) / 2, 70, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TEKLİF', rightBoxX + 10, yPosition + 20)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`No: ${quotation.quotationNumber}`, rightBoxX + 10, yPosition + 35)
    pdf.text(`Tarih: ${quotation.createdAt.toLocaleDateString('tr-TR')}`, rightBoxX + 10, yPosition + 43)
    pdf.text(`Geçerlilik: ${quotation.validUntil.toLocaleDateString('tr-TR')}`, rightBoxX + 10, yPosition + 51)
    
    // Durumu göster
    const statusText = this.getStatusText(quotation.status)
    pdf.setFontSize(8)
    pdf.text(`Durum: ${statusText}`, rightBoxX + 10, yPosition + 59)
    
    pdf.setTextColor(0, 0, 0) // Rengi siyaha döndür
    yPosition += 90

    // =================
    // BAŞLIK VE AÇIKLAMA
    // =================
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 98, 255)
    pdf.text(quotation.title, margin, yPosition)
    
    if (quotation.description) {
      yPosition += 10
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const descLines = pdf.splitTextToSize(quotation.description, pageWidth - 2 * margin)
      pdf.text(descLines, margin, yPosition)
      yPosition += descLines.length * 5
    }
    
    pdf.setTextColor(0, 0, 0)
    yPosition += 20

    // =================
    // ÜRÜNLER TABLOSU
    // =================
    
    // Tablo başlığı
    pdf.setFillColor(41, 98, 255)
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    // Kolonlar
    const col1X = margin + 5
    const col2X = margin + 90
    const col3X = margin + 115
    const col4X = margin + 140
    const col6X = pageWidth - margin - 5
    
    pdf.text('ÜRÜN / HİZMET', col1X, yPosition + 8)
    pdf.text('MİKTAR', col2X, yPosition + 8)
    pdf.text('BİRİM', col3X, yPosition + 8)
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
      pdf.text(item.productName, col1X, yPosition + 8)
      
      // Ürün tipi
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const typeText = item.productType === 'SOFTWARE' ? 'Yazılım' : 'Donanım'
      pdf.text(typeText, col1X, yPosition + 15)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.text(item.quantity.toString(), col2X, yPosition + 8)
      pdf.text(this.formatPrice(item.unitPrice), col3X, yPosition + 8)
      pdf.text(item.currency, col4X, yPosition + 8)
      
      // Toplam - kalın ve sağa yaslı
      pdf.setFont('helvetica', 'bold')
      const totalText = item.currency === 'TL' ? 
        `${this.formatPrice(item.totalPrice)} ₺` : 
        `$${this.formatPrice(item.totalPrice)}`
      pdf.text(totalText, col6X, yPosition + 8, { align: 'right' })

      yPosition += 20
    })

    // =================
    // TOPLAM TUTARLAR
    // =================
    
    yPosition += 10
    
    // Toplam kutusu
    const totalBoxHeight = 40
    pdf.setFillColor(248, 249, 250)
    pdf.rect(pageWidth - margin - 100, yPosition, 100, totalBoxHeight, 'F')
    pdf.setDrawColor(41, 98, 255)
    pdf.setLineWidth(1)
    pdf.rect(pageWidth - margin - 100, yPosition, 100, totalBoxHeight)
    
    let totalY = yPosition + 10
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 98, 255)
    pdf.text('TOPLAM TUTAR', pageWidth - margin - 95, totalY)
    
    totalY += 10
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    
    if (quotation.totalTL) {
      pdf.text(`TL: ${this.formatPrice(quotation.totalTL)} ₺`, pageWidth - margin - 95, totalY)
      totalY += 8
    }
    
    if (quotation.totalUSD) {
      pdf.text(`USD: $${this.formatPrice(quotation.totalUSD)}`, pageWidth - margin - 95, totalY)
    }
    
    // Döviz kuru bilgisi
    if (exchangeRate && quotation.totalUSD) {
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Kur: ${exchangeRate.toFixed(4)}`, pageWidth - margin - 95, yPosition + totalBoxHeight - 5)
    }
    
    yPosition += totalBoxHeight + 20

    // =================
    // ŞARTLAR VE NOTLAR
    // =================
    
    if (quotation.terms || quotation.notes) {
      // Şartlar
      if (quotation.terms) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(41, 98, 255)
        pdf.text('ŞARTLAR VE KOŞULLAR', margin, yPosition)
        
        yPosition += 10
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
        const termsLines = pdf.splitTextToSize(quotation.terms, pageWidth - 2 * margin)
        pdf.text(termsLines, margin, yPosition)
        yPosition += termsLines.length * 5 + 10
      }
      
      // Notlar
      if (quotation.notes) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(41, 98, 255)
        pdf.text('NOTLAR', margin, yPosition)
        
        yPosition += 10
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
        const notesLines = pdf.splitTextToSize(quotation.notes, pageWidth - 2 * margin)
        pdf.text(notesLines, margin, yPosition)
        yPosition += notesLines.length * 5
      }
    }

    // =================
    // FOOTER
    // =================
    
    const footerY = pageHeight - 30
    
    // Footer çizgisi
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin, footerY, pageWidth - margin, footerY)
    
    // Footer metni
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Bu teklif 30 gün geçerlidir. Fiyatlar KDV hariçtir.', margin, footerY + 10)
    pdf.text('MAPOS - Teknoloji çözümlerinde güvenilir ortağınız', margin, footerY + 18)
    
    // Sayfa numarası
    const pageText = `Sayfa 1 / 1`
    pdf.text(pageText, pageWidth - margin, footerY + 10, { align: 'right' })
    
    // Tarih
    const generatedText = `Oluşturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`
    pdf.text(generatedText, pageWidth - margin, footerY + 18, { align: 'right' })

    // PDF blob olarak döndür
    const pdfBlob = pdf.output('blob')
    return pdfBlob
  }

  /**
   * Durum metni
   */
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': 'Taslak',
      'SENT': 'Gönderildi',
      'ACCEPTED': 'Kabul Edildi',
      'REJECTED': 'Reddedildi',
      'EXPIRED': 'Süresi Doldu'
    }
    return statusMap[status] || status
  }

  /**
   * PDF'i indir
   */
  async downloadQuotationPdf(data: PdfExportData, filename?: string): Promise<void> {
    const pdfBlob = await this.generateQuotationPdf(data)
    const defaultFilename = `MAPOS_Teklif_${data.quotation.quotationNumber}_${new Date().toISOString().split('T')[0]}.pdf`
    
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || defaultFilename
    link.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * Para formatı - Türkçe standartlarına uygun
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