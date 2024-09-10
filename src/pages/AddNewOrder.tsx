import Loader from "@/components/Loader";
import CustomerFormModel from "@/components/models/CustomerFormModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetAllCustomers } from "@/lib/Firebase/Services/CustomerService";
import { AddOrder, GetTotalOrdersNumber } from "@/lib/Firebase/Services/OrderService";
import { CustomerType } from "@/types/CustomerType";
import { OrderType } from "@/types/OrderType";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoArrowLeft } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { MdAddIcCall, MdDelete, MdOutlineAddBox } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function AddNewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null
  );

  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [dueDate, setDueDate] = useState<string>("");

  // Customer
  const [allCustomers, setAllCustomers] = useState<CustomerType[]>([]);
  const [searchCustomer, setSearchCustomer] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddNewCustomer, setShowAddNewCustomer] = useState(false);
  const customerSectionRef = useRef<HTMLDivElement | null>(null);

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliveryPersonName, setDeliveryPersonName] = useState<string>("");
  const [deliveryPersonPhoneNo, setDeliveryPersonPhoneNo] = useState<string[]>([
    "",
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryTruckNo, setDeliveryTruckNo] = useState<string>("");
  const [deliveryStatus, setDeliveryStatus] = useState<string>("");

  // Products
  const [products, setProducts] = useState<OrderType["products"]>([
    {
      id: "1",
      productName: "",
      weight: NaN,
      unitPrice: NaN,
    },
  ]);

  // Payments
  const [orderPayments, setOrderPayments] = useState<
    OrderType["orderPayments"]
  >([
    {
      id: "1",
      paymentDate: "",
      paymentAmount: NaN,
      paymentMethod: "Cash",
      payeeName: "",
      receivedBy: "",
      paymentReference: "",
    },
  ]);

  const paymentMethods = [
    "Cash",
    "Cheque",
    "JazzCash",
    "EasyPaisa",
    "Bank Transfer",
  ];

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await GetAllCustomers();
      const total = await GetTotalOrdersNumber();

      setAllCustomers(res);
      setTotalOrders(total);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.message ?? "Couldn't fetch customers");
      setAllCustomers([]);
      setTotalOrders(0);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        customerSectionRef.current &&
        !customerSectionRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      selectedCustomer &&
      orderDate &&
      products.length > 0 &&
      products.every(
        (product) => product.productName && product.unitPrice && product.weight
      )
      &&
      orderPayments.every(
        (payment) =>
          payment.paymentAmount && payment.paymentDate && payment.payeeName && payment.receivedBy && payment.paymentMethod
      )
    ) {
      try {
        setIsCreatingOrder(true);
        const orderUuid = uuidv4();

        await AddOrder({
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderDate: orderDate,
          dueDate: dueDate ?? "",
          orderNo: `${totalOrders + 1}`,
          uuid: orderUuid,
          customerID: selectedCustomer.uuid,
          customerName: selectedCustomer.name,
          customerPhoneNo: selectedCustomer.phoneNo,
          customerAddress: selectedCustomer.address,
          delivery: {
            deliveryAddress: deliveryAddress ?? "",
            deliveryDate: deliveryDate ?? "",
            deliveryPersonName: deliveryPersonName ?? "",
            deliveryPersonPhoneNo: deliveryPersonPhoneNo ?? [],
            deliveryStatus: deliveryStatus ?? "",
            deliveryTruckNo: deliveryTruckNo ?? "",
          },
          paidAmount: orderPayments.reduce(
            (acc, payment) => acc + payment.paymentAmount || 0,
            0
          ),
          products: products.filter(
            (product) =>
              product.productName && product.unitPrice && product.weight && product.weight > 0 && product.unitPrice > 0
          ),
          orderPayments: orderPayments.filter(
            (payment) =>
              payment.paymentAmount && payment.paymentDate && payment.payeeName && payment.receivedBy && payment.paymentMethod
          ),
          totalAmount: products.reduce(
            (acc, product) => acc + (product.unitPrice * product.weight || 0),
            0
          ),
        });

        toast.success("Order created successfully");
        setIsCreatingOrder(false);
        navigate(`/order/${orderUuid}`);
      } catch (error: any) {
        setIsCreatingOrder(false);
        toast.error(error?.message ?? "Couldn't create order");
      }
    } else {
      if (!selectedCustomer) {
        toast.error("Please select a customer");
      }
      if (!orderDate) {
        toast.error("Please select order date");
      }
      if (products.length === 0) {
        toast.error("Please add products");
      } else if (
        products.some(
          (product) =>
            !product.productName || !product.unitPrice || !product.weight
        )
      ) {
        toast.error("Please fill all the product details");
      }
    }
  };

  const onFormReset = () => {
    setOrderDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setSelectedCustomer(null);
    setSearchCustomer("");
    setDeliveryDate("");
    setDeliveryPersonName("");
    setDeliveryPersonPhoneNo([""]);
    setDeliveryAddress("");
    setDeliveryTruckNo("");
    setDeliveryStatus("");
    setProducts([
      {
        id: "1",
        productName: "",
        weight: NaN,
        unitPrice: NaN,
      },
    ]);
    setOrderPayments([
      {
        id: "1",
        paymentDate: "",
        paymentAmount: NaN,
        paymentMethod: "Cash",
        payeeName: "",
        receivedBy: "",
        paymentReference: "",
      },
    ]);
  };

  return (
    <main>
      <section className="flex items-center gap-x-2">
        <button
          className="w-fit h-fit cursor-pointer -mb-1"
          onClick={() => {
            window.history.back();
          }}
        >
          <GoArrowLeft size={30} />
        </button>
        <h1 className="text-2xl font-semibold">Add New Order</h1>
      </section>
      {loading ? (
        <section className="col-span-full w-full h-96 py-20 flex items-center justify-center text-lg gap-x-2">
          <Loader width={50} borderWidth={3} color="primary" />
        </section>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              onFormSubmit(e);
            }}
            onReset={() => {
              onFormReset();
            }}
            className="w-full my-7 grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* Order & Customer Details */}
            <section className="w-full flex flex-col gap-4">
              {/* Order Details */}
              <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-10 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <Label htmlFor="orderDate" className="flex flex-col gap-1.5">
                  Order Date
                  <Input
                    type="date"
                    id="orderDate"
                    placeholder="Select Order date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                  />
                </Label>
                <Label htmlFor="dueDate" className="flex flex-col gap-1.5">
                  Due Date
                  <Input
                    type="date"
                    id="dueDate"
                    placeholder="Select Due date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Label>
              </section>

              {/* Customer Details */}
              <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-10 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <section className="relative " ref={customerSectionRef}>
                  <Label htmlFor="name" className="flex flex-col gap-1.5">
                    Search Customer
                    <Input
                      type="search"
                      id="name"
                      placeholder="Enter name or phone no"
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      onFocus={() => setShowSearchResults(true)}
                      autoComplete="off"
                    />
                  </Label>
                  {showSearchResults && (
                    <section className="absolute top-[105%] left-0 w-full h-fit max-h-96 overflow-y-auto bg-gray-100 rounded-lg border border-gray-200 shadow-md z-10">
                      {allCustomers
                        .filter(
                          (customer) =>
                            customer.name
                              .toLowerCase()
                              .includes(searchCustomer.toLowerCase()) ||
                            customer.phoneNo.some((phone) =>
                              phone.includes(searchCustomer.toLowerCase())
                            )
                        )
                        .map((customer, index) => (
                          <button
                            key={index}
                            className="relative w-full grow py-3 px-5 flex flex-col cursor-pointer hover:bg-gray-300 border-b border-gray-200"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowSearchResults(false);
                            }}
                          >
                            <span className="text-base font-semibold">
                              {customer.name}
                            </span>
                            <span className="text-base font-normal">
                              {" "}
                              {customer.phoneNo.join(", ")}
                            </span>
                            {selectedCustomer?.uuid === customer.uuid && (
                              <IoCheckmark
                                size={20}
                                className="absolute right-5 top-0 bottom-0 my-auto"
                              />
                            )}
                          </button>
                        ))}

                      {allCustomers.filter(
                        (customer) =>
                          customer.name
                            .toLowerCase()
                            .includes(searchCustomer.toLowerCase()) ||
                          customer.phoneNo.some((phone) =>
                            phone.includes(searchCustomer.toLowerCase())
                          )
                      ).length === 0 && (
                          <section className="px-5 py-10">
                            <p className="text-sm mb-4 text-center">
                              No customer found
                            </p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setShowSearchResults(false);
                                setShowAddNewCustomer(true);
                              }}
                              className="w-full"
                            >
                              Add New Customer
                            </Button>
                          </section>
                        )}
                    </section>
                  )}
                </section>

                <section className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold mb-2">
                    Selected Customer
                  </h3>
                  <p className="text-base font-normal">
                    <span className="font-semibold">Name: </span>
                    {selectedCustomer?.name ?? "N/A"}
                  </p>
                  <p className="text-base font-normal">
                    <span className="font-semibold">Phone Number: </span>
                    {selectedCustomer?.phoneNo.join(", ") ?? "N/A"}
                  </p>
                  <p className="text-base font-normal">
                    <span className="font-semibold">Address: </span>
                    {selectedCustomer?.address ?? "N/A"}
                  </p>
                </section>
              </section>
            </section>

            {/* Delivery Details */}
            <section className="border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Delivery Details</h2>
              <Label
                htmlFor="deliveryPersonName"
                className="flex flex-col gap-1.5"
              >
                Picker Name
                <Input
                  type="text"
                  id="deliveryPersonName"
                  placeholder="Enter delivery person name"
                  value={deliveryPersonName}
                  onChange={(e) => setDeliveryPersonName(e.target.value)}
                />
              </Label>
              <Label
                htmlFor="deliveryPersonPhoneNo"
                className="flex flex-col gap-1.5"
              >
                Picker Phone No
                {deliveryPersonPhoneNo.map((phone, index) => (
                  <div key={index} className="relative flex items-center">
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => {
                        const newPhoneNo = [...deliveryPersonPhoneNo];
                        newPhoneNo[index] = e.target.value;
                        setDeliveryPersonPhoneNo(newPhoneNo);
                      }}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="w-fit h-fit absolute right-5"
                        onClick={() => {
                          const newPhoneNo = [...deliveryPersonPhoneNo];
                          newPhoneNo.splice(index, 1);
                          setDeliveryPersonPhoneNo(newPhoneNo);
                        }}
                      >
                        <MdDelete size={18} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant={"ghost"}
                  className="w-full gap-3"
                  onClick={() =>
                    setDeliveryPersonPhoneNo([...deliveryPersonPhoneNo, ""])
                  }
                >
                  <MdAddIcCall size={18} />
                  Add Another Phone Number
                </Button>
              </Label>

              <Label
                htmlFor="deliveryAddress"
                className="flex flex-col gap-1.5"
              >
                Delivery Address
                <Input
                  type="text"
                  id="deliveryAddress"
                  placeholder="Enter delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </Label>

              <Label
                htmlFor="deliveryTruckNo"
                className="flex flex-col gap-1.5"
              >
                Delivery Vehicle No
                <Input
                  type="text"
                  id="deliveryTruckNo"
                  placeholder="Enter delivery vehicle no"
                  value={deliveryTruckNo}
                  onChange={(e) => setDeliveryTruckNo(e.target.value)}
                />
              </Label>
              <Label
                htmlFor="deliveryTruckNo"
                className="flex flex-col gap-1.5"
              >
                Delivery Status
                <Select
                  value={deliveryStatus}
                  onValueChange={(value) => setDeliveryStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue>{deliveryStatus}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <Label htmlFor="deliveryDate" className="flex flex-col gap-1.5">
                Delivery Date
                <Input
                  type="datetime-local"
                  id="deliveryDate"
                  placeholder="Enter delivery date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </Label>
            </section>

            {/* Products */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Products Details</h2>
              {products.map((product, index) => (
                <section
                  key={index}
                  className="grid grid-cols-1 lg:flex items-center gap-5 w-full border-b border-dashed pb-4"
                >
                  <Label
                    htmlFor={`productName-${index}`}
                    className="col-span-full flex flex-col gap-1.5 grow"
                  >
                    Product Name
                    <Input
                      type="text"
                      id={`productName-${index}`}
                      placeholder="Enter product name"
                      value={product.productName}
                      onChange={(e) => {
                        const newProducts = [...products];
                        newProducts[index].productName = e.target.value;
                        setProducts(newProducts);
                      }}
                      required
                    />
                  </Label>
                  <div className="flex items-center gap-5 col-span-full">
                    <Label
                      htmlFor={`productWeight-${index}`}
                      className="flex flex-col gap-1.5 w-full max-w-none ~lg:max-w-40"
                    >
                      Weight (KG)
                      <Input
                        type="number"
                        id={`productWeight-${index}`}
                        placeholder="Weight"
                        value={String(product.weight)}
                        onChange={(e) => {
                          const newProducts = [...products];
                          newProducts[index].weight = Number(e.target.value);
                          setProducts(newProducts);
                        }}
                        required
                      />
                    </Label>
                    <Label
                      htmlFor={`productUnitPrice-${index}`}
                      className="flex flex-col gap-1.5 w-full max-w-none ~lg:max-w-40"
                    >
                      Unit Price
                      <Input
                        type="number"
                        id={`productUnitPrice-${index}`}
                        placeholder="Unit Price"
                        value={String(product.unitPrice)}
                        onChange={(e) => {
                          const newProducts = [...products];
                          newProducts[index].unitPrice = Number(e.target.value);
                          setProducts(newProducts);
                        }}
                        required
                      />
                    </Label>
                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className="border self-end min-w-9"
                      onClick={() => {
                        if (products.length === 1) {
                          setProducts([
                            {
                              id: "1",
                              productName: "",
                              weight: NaN,
                              unitPrice: NaN,
                            },
                          ]);
                        } else {
                          const newProducts = [...products];
                          newProducts.splice(index, 1);
                          setProducts(newProducts);
                        }
                      }}
                    >
                      <MdDelete size={20} className="text-red-500" />
                    </Button>
                  </div>
                </section>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="w-fit gap-2"
                onClick={() =>
                  setProducts([
                    ...products,
                    {
                      id: String(products.length + 1),
                      productName: "",
                      weight: NaN,
                      unitPrice: NaN,
                    },
                  ])
                }
              >
                <MdOutlineAddBox size={18} />
                Add Another Product
              </Button>
            </section>

            {/* Payment Details */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Payment Details</h2>
              {orderPayments.map((payment, index) => (
                <section
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-2 items-center gap-5 w-full border-b border-dashed pb-4"
                >
                  <Label
                    htmlFor={`payeeName-${index}`}
                    className="col-span-full lg:col-span-1 flex flex-col gap-1.5 grow"
                  >
                    Payee Name
                    <Input
                      type="text"
                      id={`payeeName-${index}`}
                      placeholder="Payee Name"
                      value={payment.payeeName}
                      onChange={(e) => {
                        const newPayments = [...orderPayments];
                        newPayments[index].payeeName = e.target.value;
                        setOrderPayments(newPayments);
                      }}
                    />
                  </Label>
                  <Label
                    htmlFor={`receivedBy-${index}`}
                    className="col-span-full lg:col-span-1 flex flex-col gap-1.5 grow"
                  >
                    Received By
                    <Input
                      type="text"
                      id={`receivedBy-${index}`}
                      placeholder="Received By"
                      value={payment.receivedBy}
                      onChange={(e) => {
                        const newPayments = [...orderPayments];
                        newPayments[index].receivedBy = e.target.value;
                        setOrderPayments(newPayments);
                      }}
                    />
                  </Label>
                  <div className="col-span-full flex items-center gap-5">
                    <Label
                      htmlFor={`paymentAmount-${index}`}
                      className="flex flex-col gap-1.5 w-full max-w-none ~lg:max-w-40"
                    >
                      Payment Date & Time
                      <Input
                        type="datetime-local"
                        id={`paymentDate-${index}`}
                        placeholder="Payment Date & Time"
                        value={payment.paymentDate}
                        onChange={(e) => {
                          const newPayments = [...orderPayments];
                          newPayments[index].paymentDate = e.target.value;
                          setOrderPayments(newPayments);
                        }}
                      />
                    </Label>
                    <Label
                      htmlFor={`paymentAmount-${index}`}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      Payment Amount
                      <Input
                        type="number"
                        id={`paymentAmount-${index}`}
                        placeholder="Payment Amount"
                        value={payment.paymentAmount}
                        onChange={(e) => {
                          const newPayments = [...orderPayments];
                          newPayments[index].paymentAmount = Number(
                            e.target.value
                          );
                          setOrderPayments(newPayments);
                        }}
                      />
                    </Label>

                    <Label
                      htmlFor={`paymentMethod-${index}`}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      Payment Method
                      <Select
                        value={payment.paymentMethod}
                        onValueChange={(value) => {
                          const newPayments = [...orderPayments];
                          newPayments[index].paymentMethod = value as any;
                          setOrderPayments(newPayments);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>{payment.paymentMethod}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method, index) => (
                            <SelectItem key={index} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Label>

                    <Label
                      htmlFor={`paymentReference-${index}`}
                      className="flex flex-col gap-1.5 w-full max-w-none ~lg:max-w-40"
                    >
                      {payment.paymentMethod === "Cash"
                        ? "Description"
                        : payment.paymentMethod === "Cheque"
                          ? "Cheque No"
                          : "Reference ID"}
                      <Input
                        type="text"
                        id={`paymentReference-${index}`}
                        placeholder={
                          payment.paymentMethod === "Cash"
                            ? "Description"
                            : payment.paymentMethod === "Cheque"
                              ? "Cheque No"
                              : "Reference ID"
                        }
                        value={payment.paymentReference}
                        onChange={(e) => {
                          const newPayments = [...orderPayments];
                          newPayments[index].paymentReference = e.target.value;
                          setOrderPayments(newPayments);
                        }}
                      />
                    </Label>

                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      className="border self-end min-w-9"
                      onClick={() => {
                        if (orderPayments.length === 1) {
                          setOrderPayments([
                            {
                              id: "1",
                              paymentDate: "",
                              paymentAmount: 0,
                              paymentMethod: "Cash",
                              payeeName: "",
                              receivedBy: "",
                              paymentReference: "",
                            },
                          ]);
                        } else {
                          const newPayments = [...orderPayments];
                          newPayments.splice(index, 1);
                          setOrderPayments(newPayments);
                        }
                      }}
                    >
                      <MdDelete size={20} className="text-red-500" />
                    </Button>
                  </div>
                </section>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="w-fit gap-2"
                onClick={() =>
                  setOrderPayments([
                    ...orderPayments,
                    {
                      id: String(orderPayments.length + 1),
                      paymentDate: "",
                      paymentAmount: 0,
                      paymentMethod: "Cash",
                      payeeName: "",
                      receivedBy: "",
                      paymentReference: "",
                    },
                  ])
                }
              >
                <MdOutlineAddBox size={18} />
                Add Another Payment
              </Button>
            </section>

            {/* Order Summary */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <section className="max-w-lg flex flex-col gap-2 my-2">
                {products.map((product, index) => {
                  if (
                    product.productName &&
                    product.unitPrice &&
                    product.weight
                  ) {
                    return (
                      <section
                        key={index}
                        className="flex items-center gap-5 w-full border-b-2 border-dashed pb-2.5"
                      >
                        <p className="text-base font-semibold grow">
                          {product.productName}
                        </p>

                        <p className="text-base font-normal">
                          PKR {product.unitPrice * product.weight}
                        </p>
                      </section>
                    );
                  } else {
                    return null;
                  }
                })}

                <section className="flex items-center justify-between gap-5 border-b-2 border-dashed pb-3">
                  <p className="text-lg font-semibold">Total Amount</p>
                  <p className="text-lg font-semibold">
                    PKR{" "}
                    {products.reduce(
                      (acc, product) =>
                        acc + (product.unitPrice * product.weight || 0),
                      0
                    )}
                  </p>
                </section>
                <section className="flex items-center justify-between gap-5 border-b-2 border-dashed pb-3">
                  <p className="text-lg font-semibold">Total Paid Amount</p>
                  <p className="text-lg font-semibold">
                    - PKR{" "}
                    {orderPayments.reduce(
                      (acc, payment) => acc + payment.paymentAmount || 0,
                      0
                    )}
                  </p>
                </section>
                <section className="flex items-center justify-between gap-5">
                  <p className="text-lg font-semibold">Remaining Amount</p>
                  <p className="text-lg font-semibold">
                    PKR{" "}
                    {products.reduce(
                      (acc, product) =>
                        acc + (product.unitPrice * product.weight || 0),
                      0
                    ) -
                      orderPayments.reduce(
                        (acc, payment) => acc + payment.paymentAmount || 0,
                        0
                      )}
                  </p>
                </section>
              </section>

              <section className="flex items-center gap-3 mt-3">
                <Button
                  type="submit"
                  className="gap-2 w-48"
                  disabled={isCreatingOrder}
                  loading={isCreatingOrder}
                  variant={"default"}
                >
                  Save Order
                </Button>

                <Button
                  type="reset"
                  variant="ghost"
                  className="w-fit gap-2"
                  disabled={isCreatingOrder}
                >
                  Clear All Fields
                </Button>
              </section>
            </section>
          </form>

          {showAddNewCustomer && (
            <CustomerFormModel
              closeModel={() => {
                setShowAddNewCustomer(false);
              }}
              fetchCustomers={fetchCustomers}
              formType="Add"
              totalCustomers={allCustomers.length}
            />
          )}
        </>
      )}
    </main>
  );
}

export default AddNewOrder;
