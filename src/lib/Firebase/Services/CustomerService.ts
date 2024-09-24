import { CustomerType } from "@/types/CustomerType";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

async function GetAllCustomers(): Promise<CustomerType[]> {
  const q = query(collection(db, "customers"));
  const docs = await getDocs(q);
  const customers: CustomerType[] = [];
  docs.forEach((doc) => {
    customers.push(doc.data() as CustomerType);
  });

  return customers;
}

async function GetCustomerById(id: string): Promise<CustomerType | null> {
  const q = query(collection(db, "customers"), where("uuid", "==", id));
  const docs = await getDocs(q);
  if (docs.size === 0) {
    return null;
  }

  return docs.docs[0].data() as CustomerType;
}

async function UpdateCustomer(customer: CustomerType): Promise<void> {
  const q = query(collection(db, "customers"), where("uuid", "==", customer.uuid));
  const docs = await getDocs(q);

  if (docs.docs.length === 0) {
    throw new Error("No Customer found with the given ID");
  }

  const docRef = docs.docs[0].ref;

  updateDoc(docRef, customer);

  return Promise.resolve();
}

async function DeleteCustomer(id: string): Promise<void> {
  const q = query(collection(db, "customers"), where("uuid", "==", id));

  const docs = await getDocs(q);
  if (docs.size === 0) {
    throw new Error("No Customer found with the given ID");
  }

  const docRef = docs.docs[0].ref;
  await deleteDoc(docRef);

  return Promise.resolve();
}

async function AddCustomer(customer: CustomerType): Promise<void> {
  await addDoc(collection(db, "customers"), customer);
}

export { GetAllCustomers, GetCustomerById, UpdateCustomer, DeleteCustomer, AddCustomer };
