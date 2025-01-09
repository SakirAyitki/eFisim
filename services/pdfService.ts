import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Receipt } from './receiptService';

export class PdfService {
  private static formatDate(date: string, time: string): string {
    return `${date} ${time}`;
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  }

  private static generateHtml(receipt: Receipt): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Fiş Detayı</title>
          <style>
            @page { 
              margin: 10mm;
              size: A4;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #1a1a1a;
              background: #fff;
              padding: 20px;
              font-size: 12px;
            }
            .receipt {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #e0e0e0;
              margin-bottom: 20px;
            }
            .store-name {
              font-size: 24px;
              font-weight: 700;
              color: #000;
              margin-bottom: 5px;
            }
            .store-address {
              color: #666;
              font-size: 12px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
              border: 1px solid #e0e0e0;
              padding: 15px;
              border-radius: 4px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .info-label {
              font-weight: 500;
              color: #666;
            }
            .info-value {
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #f5f5f5;
              padding: 10px;
              text-align: left;
              font-weight: 600;
              color: #333;
              font-size: 11px;
              border-bottom: 2px solid #e0e0e0;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 11px;
            }
            .totals {
              margin-left: auto;
              width: 250px;
              margin-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .total-label {
              color: #666;
            }
            .grand-total {
              font-size: 16px;
              font-weight: 700;
              color: #000;
              border-top: 2px solid #000;
              margin-top: 5px;
              padding-top: 5px;
            }
            .payment-details {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #e0e0e0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 10px;
            }
            .barcode {
              text-align: center;
              margin: 20px 0;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
              font-family: monospace;
            }
            .thank-you {
              text-align: center;
              font-size: 14px;
              color: #333;
              margin: 20px 0;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">${receipt.storeName}</div>
              <div class="store-address">${receipt.storeAddress}</div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Fiş No:</span>
                <span class="info-value">${receipt.faturaNo}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tarih:</span>
                <span class="info-value">${this.formatDate(receipt.date, receipt.time)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">VKN:</span>
                <span class="info-value">${receipt.vdbNo}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ETTN:</span>
                <span class="info-value">${receipt.ettn}</span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th style="text-align: center">Miktar</th>
                  <th style="text-align: right">Birim Fiyat</th>
                  <th style="text-align: right">KDV</th>
                  <th style="text-align: right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center">${item.quantity}</td>
                    <td style="text-align: right">${this.formatCurrency(item.price)}</td>
                    <td style="text-align: right">%${item.taxRate}</td>
                    <td style="text-align: right">${this.formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span class="total-label">Ara Toplam:</span>
                <span>${this.formatCurrency(receipt.totals.subtotal)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">KDV:</span>
                <span>${this.formatCurrency(receipt.totals.kdv)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Genel Toplam:</span>
                <span>${this.formatCurrency(receipt.totals.total)}</span>
              </div>
            </div>

            <div class="payment-details">
              <div class="section-title">Ödeme Bilgileri</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Ödeme Tipi:</span>
                  <span class="info-value">${receipt.payment.type === 'card' ? 'Kredi Kartı' : 'Nakit'}</span>
                </div>
                ${receipt.payment.type === 'card' && receipt.payment.cardInfo ? `
                  <div class="info-item">
                    <span class="info-label">Banka:</span>
                    <span class="info-value">${receipt.payment.bank}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Kart No:</span>
                    <span class="info-value">${receipt.payment.cardInfo.number}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Taksit:</span>
                    <span class="info-value">${receipt.payment.cardInfo.installment}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="barcode">
              ${receipt.footer.barcode}
            </div>

            <div class="footer">
              <p>Z No: ${receipt.footer.zNo} | EKÜ No: ${receipt.footer.ekuNo}</p>
              <p>POS: ${receipt.footer.posInfo} | Mağaza Kodu: ${receipt.footer.storeCode}</p>
              <p>${receipt.footer.irsaliyeText}</p>
              <p>${receipt.footer.signatureText}</p>
            </div>

            <div class="thank-you">
              ${receipt.footer.thankYouMessage}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async generateAndSharePdf(receipt: Receipt): Promise<void> {
    try {
      const html = this.generateHtml(receipt);
      
      const formattedDate = receipt.date.replace(/\./g, '');
      
      const fileName = `${receipt.faturaNo}_${formattedDate}.pdf`;
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 595.28,
        height: 841.89,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20
        }
      });

      const newUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });

      await FileSystem.deleteAsync(uri, { idempotent: true });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Paylaşım özelliği kullanılamıyor');
      }

      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${receipt.storeName} - ${fileName}`,
        UTI: 'com.adobe.pdf'
      });

    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      throw error;
    }
  }
} 