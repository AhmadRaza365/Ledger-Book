import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { GetCustomerById } from "@/lib/Firebase/Services/CustomerService";
import { GetOrderById } from "@/lib/Firebase/Services/OrderService";
import { formatDate, getTimeFromDate } from "@/lib/formatDate";
import { CustomerType } from "@/types/CustomerType";
import { OrderType, ProductType, PaymentType } from "@/types/OrderType";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import { usePDF } from "react-to-pdf";

function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { toPDF, targetRef } = usePDF({
    filename: "order.pdf",
    page: {
      margin: 14,
      format: "a4",
    },
  });

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const navigate = useNavigate();
  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await GetOrderById(orderId);
      const customerRes = await GetCustomerById(res.customerID);
      setOrder(res);
      setCustomer(
        customerRes ?? {
          address: res.customerAddress,
          id: res.customerID,
          name: res.customerName,
          phoneNo: res.customerPhoneNo,
          uuid: res.customerID,
        }
      );
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message ?? "An error occurred");
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const productsColumns = [
    {
      name: <span className="font-semibold text-sm xl:text-base">Product</span>,
      selector: (row: ProductType) => row.productName,
      cell: (row: ProductType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.productName}
        </p>
      ),
      minWidth: "120px",
      grow: 2,
    },
    {
      name: (
        <span className="font-semibold text-sm xl:text-base">Weight (KG)</span>
      ),
      selector: (row: ProductType) => row.weight,
      cell: (row: ProductType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.weight} KG
        </p>
      ),
      minWidth: "110px",
      maxWidth: "150px",
      center: true,
    },
    {
      name: (
        <span className="font-semibold text-sm xl:text-base">Unit Price</span>
      ),
      selector: (row: ProductType) => row.unitPrice,
      cell: (row: ProductType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR{" "}
          {row?.unitPrice?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      ),
      minWidth: "105px",
      maxWidth: "150px",
      center: true,
    },
    {
      name: <span className="font-semibold text-sm xl:text-base">Total</span>,
      selector: (row: ProductType) => row.unitPrice * row.weight,
      cell: (row: ProductType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR{" "}
          {(row?.weight * row?.unitPrice)
            ?.toString()
            ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      ),
      minWidth: "100px",
      maxWidth: "150px",
      center: true,
    },
  ];

  const paymentsColumns = [
    {
      name: (
        <span className="font-semibold text-sm xl:text-base">Payee Name</span>
      ),
      selector: (row: PaymentType) => row.payeeName,
      cell: (row: PaymentType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.payeeName}
        </p>
      ),
      minWidth: "120px",
      grow: 2,
    },
    {
      name: <span className="font-semibold text-sm xl:text-base">Amount</span>,
      selector: (row: PaymentType) => row.paymentAmount,
      cell: (row: PaymentType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR{" "}
          {row?.paymentAmount
            ?.toString()
            ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      ),
      minWidth: "120px",
      maxWidth: "150px",
      center: true,
    },
    {
      name: <span className="font-semibold text-sm xl:text-base">Date</span>,
      selector: (row: PaymentType) => row.paymentDate,
      cell: (row: PaymentType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {formatDate({
            unformatedDate: row?.paymentDate,
            format: "DD MMM YYYY",
          })}
        </p>
      ),
      minWidth: "120px",
      maxWidth: "150px",
      center: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        overflow: "scroll",
      },
    },
    rows: {
      style: {
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #ddd !important",
        cursor: "pointer",
      },
    },
    headRow: {
      style: {
        borderBottom: "1px solid #ddd !important",
        color: "#06B6D4",
      },
    },
    cells: {
      style: {
        border: "none",
        color: "#000",
      },
    },
  };

  return (
    <main>
      {loading ? (
        <section className="col-span-full w-full h-96 py-20 flex items-center justify-center text-lg gap-x-2">
          <Loader width={50} borderWidth={3} color="primary" />
        </section>
      ) : order && customer ? (
        <section className="w-full h-full">
          <section className="flex items-center gap-x-2">
            <button
              className="w-fit h-fit cursor-pointer -mb-1"
              onClick={() => {
                window.history.back();
              }}
            >
              <GoArrowLeft size={30} />
            </button>
            <h1 className="text-2xl font-semibold">
              Order Details # {order.orderNo}
            </h1>

            <div className="ml-auto flex items-center gap-3">
              <Button
                variant={"outline"}
                onClick={() => {
                  toPDF();
                }}
              >
                Print PDF
              </Button>
              <Button
                variant={"default"}
                onClick={() => {
                  navigate(`/order/update/${order.uuid}`);
                }}
              >
                Update Order
              </Button>
            </div>
          </section>

          <section
            className="w-full my-7 grid grid-cols-1 lg:grid-cols-2 gap-4"
            ref={targetRef}
          >
            {/* Order & Customer Details */}
            <section className="w-full flex flex-col gap-4">
              {/* Order Details */}
              <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-10 rounded-lg shadow-md">
                <section className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold mb-2">Dates</h2>
                  <p className="text-lg font-normal">
                    <span className="font-semibold">Order Date: </span>
                    {formatDate({
                      unformatedDate: order.orderDate,
                      format: "DD MMM YYYY",
                    }) +
                      " - " +
                      getTimeFromDate(order.orderDate)}
                  </p>
                  <p className="text-lg font-normal">
                    <span className="font-semibold">Due Date: </span>
                    {order.dueDate
                      ? formatDate({
                          unformatedDate: order.dueDate,
                          format: "DD MMM YYYY",
                        })
                      : "N/A"}
                  </p>
                </section>
              </section>

              {/* Customer Details */}
              <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-10 rounded-lg shadow-md">
                <section className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold mb-2">Customer</h2>
                  <p className="text-lg font-normal">
                    <span className="font-semibold">Name: </span>
                    {customer.name ?? "N/A"}
                  </p>
                  <p className="text-lg font-normal">
                    <span className="font-semibold">Phone Number: </span>
                    {customer.phoneNo.join(", ") ?? "N/A"}
                  </p>
                  <p className="text-lg font-normal">
                    <span className="font-semibold">Address: </span>
                    {customer.address ?? "N/A"}
                  </p>
                </section>
              </section>
            </section>

            {/* Delivery Details */}
            <section className="border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <section className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold mb-2">Delivery Details</h2>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Picker Name: </span>
                  {order.delivery.deliveryPersonName ?? "N/A"}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Picker Phone No: </span>
                  {order.delivery.deliveryPersonPhoneNo.join(", ") ?? "N/A"}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Delivery Address: </span>
                  {order.delivery?.deliveryAddress ?? "N/A"}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Delivery Vehicle No: </span>
                  {order.delivery.deliveryTruckNo ?? "N/A"}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Delivery Status: </span>
                  {order.delivery.deliveryStatus ?? "N/A"}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Delivery Date: </span>
                  {order.delivery.deliveryDate
                    ? formatDate({
                        unformatedDate: order.delivery.deliveryDate,
                        format: "DD MMM YYYY",
                      }) +
                      " - " +
                      getTimeFromDate(order.delivery.deliveryDate)
                    : "N/A"}
                </p>
              </section>
            </section>

            {/* Products Details */}
            <section className="col-span-1 border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Products Details</h2>
              <DataTable
                columns={productsColumns}
                data={order.products}
                customStyles={customStyles}
                noDataComponent={
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="p-2 font-semibold text-xl 2xl:text-2xl">
                      No Products Found
                    </p>
                  </div>
                }
                highlightOnHover
                striped={false}
              />
            </section>

            {/* Payment Details */}
            <section className="col-span-1 border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Payment Details</h2>
              <DataTable
                columns={paymentsColumns}
                data={order.orderPayments}
                customStyles={customStyles}
                noDataComponent={
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="p-2 font-semibold text-xl 2xl:text-2xl">
                      No Payments are made yet
                    </p>
                  </div>
                }
                highlightOnHover
                striped={false}
                expandableRows
                expandOnRowClicked
                expandableRowsComponent={({ data }) => (
                  <section className="flex flex-col gap-4 bg-gray-100 py-3 pr-5 pl-16">
                    <section className="flex flex-col gap-1">
                      <p className="text-lg font-normal">
                        <span className="font-semibold">Payee Name: </span>
                        {data.payeeName}
                      </p>
                      <p className="text-lg font-normal">
                        <span className="font-semibold">Amount: </span>
                        PKR {data.paymentAmount}
                      </p>
                      <p className="text-lg font-normal">
                        <span className="font-semibold">Date: </span>
                        {formatDate({
                          unformatedDate: data.paymentDate,
                          format: "DD MMM YYYY",
                        })}
                        {" - "}
                        {getTimeFromDate(data.paymentDate)}
                      </p>

                      <p className="text-lg font-normal">
                        <span className="font-semibold">Received By: </span>
                        {data.receivedBy}
                      </p>

                      <p className="text-lg font-normal">
                        <span className="font-semibold">Payment Method: </span>
                        {data.paymentMethod}
                      </p>
                      <p className="text-lg font-normal">
                        <span className="font-semibold">
                          {data.paymentMethod === "Cheque"
                            ? "Cheque No"
                            : data.paymentMethod === "Cash"
                            ? "Desc"
                            : "Reference ID"}
                          :{" "}
                        </span>
                        {data.paymentReference}
                      </p>
                    </section>
                  </section>
                )}
              />
            </section>

            {/* Order Summary */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 py-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <section className="max-w-lg flex flex-col gap-2 my-2">
                {order.products.map((product, index) => {
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
                          PKR{" "}
                          {(product.unitPrice * product.weight)
                            ?.toString()
                            ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
                    {order.products
                      .reduce(
                        (acc, product) =>
                          acc + (product.unitPrice * product.weight || 0),
                        0
                      )
                      ?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </section>
                <section className="flex items-center justify-between gap-5 border-b-2 border-dashed pb-3">
                  <p className="text-lg font-semibold">Total Paid Amount</p>
                  <p className="text-lg font-semibold">
                    - PKR{" "}
                    {order.orderPayments
                      .reduce(
                        (acc, payment) => acc + payment.paymentAmount || 0,
                        0
                      )
                      ?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </section>
                <section className="flex items-center justify-between gap-5">
                  <p className="text-lg font-semibold">Remaining Amount</p>
                  <p className="text-lg font-semibold">
                    PKR{" "}
                    {(
                      order.products.reduce(
                        (acc, product) =>
                          acc + (product.unitPrice * product.weight || 0),
                        0
                      ) -
                      order.orderPayments.reduce(
                        (acc, payment) => acc + payment.paymentAmount || 0,
                        0
                      )
                    )
                      ?.toString()
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </section>
              </section>
            </section>
          </section>
        </section>
      ) : (
        <>
          <section className="w-full h-[80vh] flex flex-col items-center justify-center gap-4 ">
            <h1 className="text-2xl font-semibold text-center">
              No order found with the given ID
            </h1>
            <Button
              variant={"outline"}
              onClick={() => {
                navigate("/orders");
              }}
            >
              View all orders
            </Button>
          </section>
        </>
      )}
    </main>
  );
}

export default OrderDetails;
