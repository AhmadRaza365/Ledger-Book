import Loader from "@/components/Loader";
import CustomerFormModel from "@/components/models/CustomerFormModel";
import { Button } from "@/components/ui/button";
import { GetCustomerById } from "@/lib/Firebase/Services/CustomerService";
import {
  DeleteOrder,
  GetAllOrdersByCustomerId,
} from "@/lib/Firebase/Services/OrderService";
import { formatDate } from "@/lib/formatDate";
import { CustomerType } from "@/types/CustomerType";
import { OrderType } from "@/types/OrderType";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { GoArrowLeft } from "react-icons/go";
import { MdDelete } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import jsonToCsvExport from "json-to-csv-export";
import { usePDF } from "react-to-pdf";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [customer, setCustomer] = useState<CustomerType | null>(null);

  const [totalOrdersAmount, setTotalOrdersAmount] = useState<number>(0);
  const [totalRemainingAmount, setTotalRemainingAmount] = useState<number>(0);

  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showDeleteOrder, setShowDeleteOrder] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [showEditCustomer, setShowEditCustomer] = useState(false);

  const { toPDF, targetRef } = usePDF({
    filename: "customer.pdf",
    page: {
      margin: 14,
      format: "a4",
    },
  });

  const fetchData = async (customerId: string) => {
    try {
      setLoading(true);

      const customerData = await GetCustomerById(customerId);
      const ordersData = await GetAllOrdersByCustomerId(customerId);
      calculateSummary(ordersData);
      setOrders(ordersData);
      setCustomer(customerData);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message ?? "An error occurred");
      setCustomer(null);
      setOrders([]);
    }
  };

  const calculateSummary = (Orders: OrderType[]) => {
    let total = 0;
    let remaining = 0;
    let paid = 0;

    Orders.forEach((order) => {
      total += order.totalAmount;
      const totalPaid = order.orderPayments.reduce(
        (acc, payment) => acc + payment.paymentAmount,
        0
      );
      paid += totalPaid;
    });

    remaining = total - paid;

    setTotalOrdersAmount(total);
    setTotalRemainingAmount(remaining);
  };

  const deleteSelectedOrder = async (id: string) => {
    try {
      setDeletingOrder(true);
      await DeleteOrder(id);
      setDeletingOrder(false);
      setShowDeleteOrder(false);
      fetchData(customer?.uuid ?? "");
      toast.success("Order deleted successfully");
    } catch (error: any) {
      setDeletingOrder(false);
      toast.error(error?.message ?? "Couldn't delete order");
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const columns = [
    {
      name: <span className="font-semibold text-base">#</span>,
      selector: (row: OrderType) => row.orderNo,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">{row.orderNo}</p>
      ),
      minWidth: "80px",
      maxWidth: "80px",
    },
    {
      name: <span className="font-semibold text-base">Date</span>,
      selector: (row: OrderType) => row.orderDate,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {formatDate({
            format: "DD MMM YYYY",
            unformatedDate: row?.orderDate,
          })}
        </p>
      ),
      minWidth: "120px",
    },
    {
      name: <span className="font-semibold text-base">Due Date</span>,
      selector: (row: OrderType) => row.dueDate,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row.dueDate
            ? formatDate({
                format: "DD MMM YYYY",
                unformatedDate: row?.dueDate,
              })
            : "N/A"}
        </p>
      ),
      minWidth: "120px",
    },
    {
      name: <span className="font-semibold text-base">Truck No</span>,
      selector: (row: OrderType) => row.delivery.deliveryTruckNo,
      sortable: false,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.delivery?.deliveryTruckNo ?? "N/A"}
        </p>
      ),
      minWidth: "110px",
    },
    {
      name: <span className="font-semibold text-base">Total Amount</span>,
      selector: (row: OrderType) => row.totalAmount,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR{" "}
          {row?.totalAmount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      ),
      minWidth: "140px",
    },
    {
      name: (
        <span className="font-semibold text-base text-left">
          Remaining Amount
        </span>
      ),
      selector: (row: OrderType) => row.totalAmount - row.paidAmount,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR{" "}
          {(row?.totalAmount - row.paidAmount)
            ?.toString()
            ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      ),
      minWidth: "200px",
    },
    {
      name: (
        <span className="border-l-[1px] pl-[8px] border-[#D1D1D1] font-semibold text-base">
          Action
        </span>
      ),
      cell: (row: OrderType) => {
        return (
          <div className="flex items-center gap-x-2">
            <button
              className="w-fit h-fit rounded-md bg-primary p-2 text-white"
              onClick={() => {
                setSelectedOrder(row);
                console.log(row);
                navigate(`/order/${row.uuid}`);
              }}
            >
              <FaEye size={20} />
            </button>
            <button
              className="w-fit h-fit rounded-md bg-yellow-500 p-2 text-white"
              onClick={() => {
                setSelectedOrder(row);
                navigate(`/order/update/${row.uuid}`);
              }}
            >
              <AiFillEdit size={20} />
            </button>
            <button
              className="w-fit h-fit rounded-md bg-red-600 p-2 text-white"
              onClick={() => {
                setSelectedOrder(row);
                setShowDeleteOrder(true);
              }}
            >
              <MdDelete size={20} />
            </button>
          </div>
        );
      },
      minWidth: "200px",
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
      ) : orders && customer ? (
        <>
          <section className="flex items-center gap-x-2">
            <button
              className="w-fit h-fit cursor-pointer -mb-1"
              onClick={() => {
                navigate("/customers");
              }}
            >
              <GoArrowLeft size={30} />
            </button>
            <h1 className="text-2xl font-semibold">
              Customer Details - {customer.name}
            </h1>

            <div className="ml-auto flex items-center gap-3">
              <Button
                variant={"outline"}
                onClick={() => {
                  toPDF();
                }}
                className=""
              >
                Print PDF
              </Button>
              <Button
                variant={"default"}
                size={"sm"}
                onClick={() => {
                  setShowEditCustomer(true);
                }}
              >
                Update Customer
              </Button>
            </div>
          </section>

          <section
            className="w-full my-7 grid grid-cols-1 lg:grid-cols-2 gap-4"
            ref={targetRef}
          >
            {/* Customer Details */}
            <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-6 rounded-lg shadow-md">
              <section className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">Customer</h2>
                </div>

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

            {/* Customer Summary */}
            <section className="border w-full flex flex-col gap-4 px-5 pt-4 pb-6 rounded-lg shadow-md">
              <section className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Orders: </span>
                  {orders.length}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Orders Amount: </span>
                  PKR{" "}
                  {totalOrdersAmount
                    ?.toString()
                    ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">
                    Total Remaining Amount:{" "}
                  </span>
                  PKR{" "}
                  {totalRemainingAmount
                    ?.toString()
                    ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
              </section>
            </section>

            {/* Orders */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 pt-4 pb-6 rounded-lg shadow-md">
              <section className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Customer's Orders</h2>
                <Button
                  size={"sm"}
                  onClick={() => {
                    const config = {
                      data: orders.map((order) => ({
                        ID: order.orderNo,
                        Date: formatDate({
                          format: "DD MMM YYYY",
                          unformatedDate: order.orderDate,
                        }),
                        "Customer Name": order.customerName,
                        "Phone No": order.customerPhoneNo[0],
                        "Truck No": order.delivery.deliveryTruckNo,
                        "Total Amount": order.totalAmount,
                        "Remaining Amount":
                          order.totalAmount - order.paidAmount,
                      })),
                      filename: `Customer-${customer.name}-Orders`,
                      delimiter: ",",
                      headers: [
                        "ID",
                        "Date",
                        "Customer Name",
                        "Phone No",
                        "Truck No",
                        "Total Amount",
                        "Remaining Amount",
                      ],
                    };

                    jsonToCsvExport(config);
                  }}
                  variant={"outline"}
                  className=""
                >
                  Download CSV
                </Button>
              </section>
              <section className="w-full mt-0">
                <DataTable
                  columns={columns}
                  data={orders}
                  customStyles={customStyles}
                  progressPending={loading}
                  progressComponent={
                    <section className="col-span-full w-full py-20 flex items-center justify-center text-lg gap-x-2">
                      <Loader width={20} borderWidth={2} color="primary" />
                      Fetching Orders...
                    </section>
                  }
                  noDataComponent={
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                      <p className="p-2 font-semibold text-xl 2xl:text-2xl">
                        No Orders Found
                      </p>
                    </div>
                  }
                  highlightOnHover
                  striped
                  pagination
                  onRowClicked={(row: OrderType) => {
                    navigate(`/order/${row.uuid}`);
                  }}
                />
              </section>
            </section>
          </section>
        </>
      ) : (
        <section className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold text-center">
            No customer found with the given ID
          </h1>
          <Button
            variant={"outline"}
            onClick={() => {
              navigate("/customers");
            }}
          >
            View all Customers
          </Button>
        </section>
      )}

      {showDeleteOrder && selectedOrder && (
        <section className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center">
          <section className="relative w-full max-w-sm bg-white rounded-xl shadow-md py-6 px-8 slideUpFadeInAnimation">
            <h2 className="text-xl font-bold text-center text-black mb-6">
              Are you sure you want to delete this Order?
            </h2>
            <section className="flex justify-center gap-x-4">
              <Button
                size={"lg"}
                variant={"destructive"}
                onClick={() => {
                  deleteSelectedOrder(selectedOrder.uuid);
                  setDeletingOrder(true);
                }}
                disabled={deletingOrder}
                loading={deletingOrder}
              >
                Delete
              </Button>
              <Button
                size={"lg"}
                variant={"outline"}
                onClick={() => {
                  setSelectedOrder(null);
                  setShowDeleteOrder(false);
                }}
                disabled={deletingOrder}
              >
                Cancel
              </Button>
            </section>
          </section>
        </section>
      )}

      {showEditCustomer && (
        <CustomerFormModel
          formType="Edit"
          closeModel={() => {
            setShowEditCustomer(false);
          }}
          fetchCustomers={() => {
            fetchData(id ?? "");
          }}
          totalCustomers={0}
          customer={customer ?? undefined}
        />
      )}
    </main>
  );
}
