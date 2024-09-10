import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DeleteOrder,
  GetAllOrders,
} from "@/lib/Firebase/Services/OrderService";
import { formatDate } from "@/lib/formatDate";
import { OrderType } from "@/types/OrderType";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Orders() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([
    {
      createdAt: "2021-09-01T00:00:00.000Z",
      customerID: "1",
      customerName: "John Doe",
      customerPhoneNo: ["03001312712"],
      customerAddress: "123, Main Street, New York",
      dueDate: "2021-09-01T00:00:00.000Z",
      delivery: {
        deliveryAddress: "123, Main Street, New York",
        deliveryDate: "2021-09-01T00:00:00.000Z",
        deliveryPersonName: "John Doe",
        deliveryPersonPhoneNo: ["1234567890"],
        deliveryTruckNo: "MNL 1234",
        deliveryStatus: "Delivered",
      },
      uuid: "1",
      orderDate: "2021-09-01T00:00:00.000Z",
      orderNo: "1",
      orderPayments: [
        {
          id: "1",
          paymentAmount: 1000,
          paymentDate: "2021-09-01T00:00:00.000Z",
          payeeName: "John Doe",
          paymentMethod: "Cash",
          paymentReference: "123456",
          receivedBy: "John Doe",
        },
      ],
      paidAmount: 1000,
      products: [
        {
          id: "1",
          productName: "Product 1",
          unitPrice: 1000,
          weight: 1,
        },
      ],
      totalAmount: 1000,
      updatedAt: "2021-09-01T00:00:00.000Z",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [showDeleteOrder, setShowDeleteOrder] = useState(false);

  const columns = [
    {
      name: <span className="font-semibold text-base">#</span>,
      selector: (row: OrderType) => row.orderNo,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row.orderNo}
        </p>
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
      maxWidth: "120px",
    },
    {
      name: <span className="font-semibold text-base">Customer Name</span>,
      selector: (row: OrderType) => row.customerName,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.customerName}
        </p>
      ),
      minWidth: "180px",
      maxWidth: "200px",
    },
    {
      name: <span className="font-semibold text-base">Phone No</span>,
      selector: (row: OrderType) => row.customerPhoneNo[0],
      sortable: false,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.customerPhoneNo[0]}
        </p>
      ),
      minWidth: "140px",
      maxWidth: "140px",
    },
    {
      name: <span className="font-semibold text-base">Truck No</span>,
      selector: (row: OrderType) => row.delivery.deliveryTruckNo,
      sortable: false,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          {row?.delivery.deliveryTruckNo}
        </p>
      ),
      minWidth: "110px",
      maxWidth: "115px",
    },
    {
      name: <span className="font-semibold text-base">Total Amount</span>,
      selector: (row: OrderType) => row.totalAmount,
      sortable: false,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR {row?.totalAmount}
        </p>
      ),
      minWidth: "140px",
      maxWidth: "140px",
    },
    {
      name: (
        <span className="font-semibold text-base text-left">Remaining Amount</span>
      ),
      selector: (row: OrderType) => row.totalAmount - row.paidAmount,
      sortable: true,
      cell: (row: OrderType) => (
        <p className="flex items-center gap-x-1.5 text-base">
          PKR {row?.totalAmount - row.paidAmount}
        </p>
      ),
      minWidth: "200px",
      maxWidth: "200px",
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await GetAllOrders();
      setOrders(res);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.message ?? "Something went wrong");
    }
  };

  const deleteSelectedOrder = async (id: string) => {
    try {
      setDeletingOrder(true);
      await DeleteOrder(id);
      setDeletingOrder(false);
      setShowDeleteOrder(false);
      fetchOrders();
      toast.success("Order deleted successfully");
    } catch (error: any) {
      setDeletingOrder(false);
      toast.error(error?.message ?? "Couldn't delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main>
      <section className="flex items-center gap-x-4">
        <h1 className="text-2xl font-semibold">All Orders</h1>
        <Button
          size={"sm"}
          onClick={() => {
            navigate("/order/new");
          }}
        >
          Add New Order
        </Button>
      </section>

      <section className="max-w-md flex items-center relative mt-8">
        <Input
          placeholder="Search Customers"
          type="search"
          className="pl-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <IoSearchOutline size={20} className="absolute left-3" />
      </section>

      <section className="w-full mt-10">
        <DataTable
          columns={columns}
          data={
            orders.filter(
              (order) =>
                order.customerName
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                order.customerPhoneNo.some((phone) =>
                  phone.includes(searchValue.toLowerCase())
                ) ||
                order.orderNo.includes(searchValue.toLowerCase()) ||
                order.delivery.deliveryTruckNo.includes(
                  searchValue.toLowerCase()
                )
            ) ?? []
          }
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
    </main>
  );
}

export default Orders;
