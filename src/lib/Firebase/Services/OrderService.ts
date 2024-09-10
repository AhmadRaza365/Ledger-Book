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
import { OrderType } from "@/types/OrderType";

async function GetAllOrders(): Promise<OrderType[]> {
  const q = query(collection(db, "orders"));
  const docs = await getDocs(q);
  const orders: OrderType[] = [];
  docs.forEach((doc) => {
    orders.push(doc.data() as OrderType);
  });

  // Sort orders by date - newest first
  const sortedOrders = orders.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return sortedOrders;
}

async function GetTotalOrdersNumber(): Promise<number> {
  const q = query(collection(db, "orders"));
  const docs = await getDocs(q);

  return docs.size;
}

async function GetOrderById(id: string): Promise<OrderType> {
  const q = query(collection(db, "orders"), where("uuid", "==", id));
  const docs = await getDocs(q);
  if (docs.size === 0) {
    throw new Error("No Order found with the given ID");
  }

  return docs.docs[0].data() as OrderType;
}

async function UpdateOrder(order: OrderType): Promise<void> {
  const q = query(collection(db, "orders"), where("uuid", "==", order.uuid));
  const docs = await getDocs(q);

  if (docs.docs.length === 0) {
    throw new Error("No Order found with the given ID");
  }

  const docRef = docs.docs[0].ref;

  updateDoc(docRef, order);

  return Promise.resolve();
}

async function DeleteOrder(id: string): Promise<void> {
  const q = query(collection(db, "orders"), where("uuid", "==", id));

  const docs = await getDocs(q);
  if (docs.size === 0) {
    throw new Error("No Order found with the given ID");
  }

  const docRef = docs.docs[0].ref;
  await deleteDoc(docRef);

  return Promise.resolve();
}

async function AddOrder(order: OrderType): Promise<void> {
  await addDoc(collection(db, "orders"), order);
}

export {
  GetAllOrders,
  GetTotalOrdersNumber,
  GetOrderById,
  UpdateOrder,
  DeleteOrder,
  AddOrder,
};
