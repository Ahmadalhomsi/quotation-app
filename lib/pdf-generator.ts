/* eslint-disable @typescript-eslint/no-explicit-any */
import { PdfExportData } from './types'
import { ReactPdfGenerator } from './pdf-generator-react'

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
    return await ReactPdfGenerator.generateQuotationPdf(data)
  }

  async downloadQuotationPdf(data: PdfExportData, filename: string = 'teklif.pdf'): Promise<void> {
    return await ReactPdfGenerator.downloadQuotationPdf(data, filename)
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