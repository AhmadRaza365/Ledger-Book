// Ledger Order
type OrderType = {
  uuid: string;
  orderNo: string;
  orderDate: string;
  dueDate: string;
  customerID: string;
  customerName: string;
  customerPhoneNo: string[];
  customerAddress: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  products: ProductType[];
  // Ledger Order Payment
  orderPayments: PaymentType[];
  delivery: {
    deliveryDate: string;
    deliveryPersonName: string;
    deliveryPersonPhoneNo: string[];
    deliveryAddress: string;
    deliveryTruckNo: string;
    deliveryStatus: string;
  };
};


type ProductType = {
  id: string;
  productName: string;
  weight: number;
  unitPrice: number;
};

type PaymentType = {
  id: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod: "Cash" | "Cheque" | "JazzCash" | "EasyPaisa" | "Bank Transfer";
  paymentReference: string;
  payeeName: string;
  receivedBy: string;
}

export type { OrderType, ProductType, PaymentType};