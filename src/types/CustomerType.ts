import { v4 as uuidv4 } from "uuid";

type CustomerType = {
  uuid: string;
  id: string;
  name: string;
  phoneNo: string[];
  address: string;
  orders: CustomerOrderType[];
  updatedAt?: string;
};

type CustomerOrderType = {
  uuid: string;
  date: string;
  description: string;
  vehicleNo: string;
  weight: number;
  rate: number;
  freight: number;
  debit: number;
  credit: number;
  createdAt: string;
};

const getEmptyCustomer = (): CustomerType => {
  return {
    uuid: uuidv4(),
    id: "",
    name: "",
    phoneNo: [],
    address: "",
    orders: [],
  };
};

const getEmptyCustomerOrder = (): CustomerOrderType => {
  return {
    uuid: uuidv4(),
    date: "",
    description: "",
    vehicleNo: "",
    weight: 0,
    rate: 0,
    freight: 0,
    debit: 0,
    credit: 0,
    createdAt: "",
  };
};

export type { CustomerType, CustomerOrderType };

export { getEmptyCustomer, getEmptyCustomerOrder };
