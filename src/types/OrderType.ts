// Ledger Order
type OrderType = {
  id: string;
  orderNo: string;
  orderDate: string;
  customerID: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  products: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];

  // Ledger Order Payment
  orderPayments: {
    id: string;
    paymentDate: string;
    paymentAmount: number;
  }[];

  delivery: {
    deliveryDate: string;
    deliveryPersonName: string;
    deliveryPersonPhoneNo: string;
    deliveryAddress: string;
    deliveryTruckNo: string;
  };
};

export type { OrderType };
