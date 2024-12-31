export interface Receipt {
  id: string;
  storeName: string;
  storeAddress: string;
  vdbNo: string;
  receiptType: string;
  receiptNo: string;
  date: string;
  time: string;
  ettn: string;
  faturaNo: string;
  customer?: {
    vkn: string;
    name: string;
    address: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
  payment: {
    type: 'cash' | 'card';
    bank?: string;
    cardInfo?: {
      number: string;
      installment: string;
      installmentAmount: string;
      approvalCode: string;
      refNo: string;
      provisionNo: string;
      batchNo: string;
      terminalId: string;
    };
  };
  totals: {
    subtotal: number;
    kdv: number;
    total: number;
  };
  footer: {
    zNo: string;
    ekuNo: string;
    posInfo: string;
    storeCode: string;
    barcode: string;
    irsaliyeText: string;
    signatureText: string;
    thankYouMessage: string;
  };
} 