import Loader from "@/components/Loader";
import CustomerFormModel from "@/components/models/CustomerFormModel";
import { Button } from "@/components/ui/button";
import {
  GetCustomerById,
  UpdateCustomer,
} from "@/lib/Firebase/Services/CustomerService";
import {
  CustomerType,
  CustomerOrderType,
  getEmptyCustomerOrder,
} from "@/types/CustomerType";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import jsonToCsvExport from "json-to-csv-export";
import { usePDF } from "react-to-pdf";
import { DatePicker } from "@/components/ui/DatePicker";
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { IoSyncOutline } from "react-icons/io5";
import { formatDate, formateIntoReadableText } from "@/lib/formatDate";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [totalOrdersAmount, setTotalOrdersAmount] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [totalDebit, setTotalDebit] = useState<number>(0);

  const [editedOrders, setEditedOrders] = useState<CustomerOrderType[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderType | null>(
    null
  );
  const [showDeleteOrder, setShowDeleteOrder] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [showEditCustomer, setShowEditCustomer] = useState(false);

  const { toPDF, targetRef } = usePDF({
    filename: `Customer-${customer?.name ?? "Customer"}-${formatDate({
      format: "DD-MM-YYYY",
      unformatedDate: new Date().toISOString(),
    })}.pdf`,
    page: {
      margin: 14,
      format: "a4",
    },
  });

  const fetchData = async (customerId: string) => {
    try {
      setLoading(true);

      const customerData = await GetCustomerById(customerId);
      const ordersData = customerData?.orders ?? [];

      setEditedOrders([
        ...ordersData,
        {
          createdAt: new Date().toISOString(),
          credit: 0,
          date: "",
          debit: 0,
          description: "last_for_summaray",
          freight: 0,
          rate: 0,
          uuid: "",
          vehicleNo: "",
          weight: 0,
        },
      ]);
      setCustomer(customerData);
      setLastUpdated(customerData?.updatedAt ?? "");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message ?? "An error occurred");
      setCustomer(null);
      setEditedOrders([]);
    }
  };

  const calculateSummary = (orders: CustomerOrderType[]) => {
    const debit = orders.reduce((acc, order) => {
      return acc + (order.debit ?? 0);
    }, 0);

    const credit = orders.reduce((acc, order) => {
      return acc + (order.credit ?? 0);
    }, 0);

    setTotalOrdersAmount(debit + credit);
    setTotalCredit(credit);
    setTotalDebit(debit);
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    calculateSummary(editedOrders);
  }, [editedOrders]);

  const columns = [
    {
      name: <span className="font-semibold text-base">Date</span>,
      selector: (row: CustomerOrderType) => row.createdAt,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return <div className="w-full h-[2.6rem] bg-gray-300"></div>;
        }
        return (
          <div className="w-full">
            <DatePicker
              date={row.date}
              setDate={(date) => {
                // Update editedOrders
                const newOrders = [...editedOrders];
                newOrders[index].date = date;
                setEditedOrders(newOrders);
                saveEditedOrders();
              }}
              label=" "
              stylesForButton="bg-transparent w-full rounded-none border-gray-300 text-base py-2 h-[2.6rem]"
            />
          </div>
        );
      },
      minWidth: "120px",
      maxWidth: "125px",
    },
    {
      name: <span className="font-semibold text-base">Description</span>,
      selector: (row: CustomerOrderType) => row.description,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return (
            <div className="w-full h-[2.6rem] bg-gray-300 flex items-center justify-end">
              <p className="text-base font-bold">Grand Total:</p>
            </div>
          );
        }
        return (
          <div className="w-full">
            <input
              type="text"
              value={row.description}
              onChange={(e) => {
                const newOrders = [...editedOrders];
                newOrders[index].description = e.target.value;
                setEditedOrders(newOrders);
              }}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`description-${index}`}
              id={`description-${index}`}
            />
          </div>
        );
      },
      minWidth: "250px",
      grow: 1,
    },
    {
      name: <span className="font-semibold text-base">Vehicle</span>,
      selector: (row: CustomerOrderType) => row.vehicleNo,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return <div className="w-full h-[2.6rem] bg-gray-300"></div>;
        }
        return (
          <div className="flex">
            <input
              type="text"
              value={row.vehicleNo}
              onChange={(e) => {
                const newOrders = [...editedOrders];
                newOrders[index].vehicleNo = e.target.value;
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`vehicle-${index}`}
              id={`vehicle-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "110px",
      maxWidth: "120px",
    },
    {
      name: <span className="font-semibold text-base">Weight</span>,
      selector: (row: CustomerOrderType) => row.weight,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          const totalWeight = editedOrders.reduce((acc, order) => {
            return acc + (order?.weight ?? 0);
          }, 0);

          return (
            <div className="w-full h-[2.6rem] bg-gray-300 flex items-center pl-2 border-x border-black">
              <p className="text-base font-semibold">{totalWeight}</p>
            </div>
          );
        }

        return (
          <div className="flex">
            <input
              type="number"
              defaultValue={row.weight}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value < 0) {
                  return;
                }

                const newOrders = [...editedOrders];
                newOrders[index].weight = Number(e.target.value);
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`weight-${index}`}
              id={`weight-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "100px",
      maxWidth: "105px",
    },
    {
      name: <span className="font-semibold text-base">Rate</span>,
      selector: (row: CustomerOrderType) => row.rate,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return <div className="w-full h-[2.6rem] bg-gray-300"></div>;
        }
        return (
          <div className="flex">
            <input
              type="number"
              defaultValue={row.rate}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value < 0) {
                  return;
                }

                const newOrders = [...editedOrders];
                newOrders[index].rate = Number(e.target.value);
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`rate-${index}`}
              id={`rate-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "100px",
      maxWidth: "105px",
    },
    {
      name: <span className="font-semibold text-base">Frieght</span>,
      selector: (row: CustomerOrderType) => row.freight,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return <div className="w-full h-[2.6rem] bg-gray-300"></div>;
        }
        return (
          <div className="flex">
            <input
              type="number"
              defaultValue={row.freight}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value < 0) {
                  return;
                }

                const newOrders = [...editedOrders];
                newOrders[index].freight = Number(e.target.value);
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`freight-${index}`}
              id={`freight-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "100px",
      maxWidth: "105px",
    },
    {
      name: <span className="font-semibold text-base">Debit</span>,
      selector: (row: CustomerOrderType) => row.debit,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return (
            <div className="w-full h-[2.6rem] bg-gray-300 flex items-center pl-2 border-x border-black">
              <p className="text-base font-semibold">
                {Math.abs(totalDebit).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          );
        }
        return (
          <div className="flex">
            <input
              type="number"
              defaultValue={row.debit}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value < 0) {
                  return;
                }

                const newOrders = [...editedOrders];
                newOrders[index].debit = Number(e.target.value);
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`debit-${index}`}
              id={`debit-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "125px",
      maxWidth: "130px",
    },
    {
      name: <span className="font-semibold text-base">Credit</span>,
      selector: (row: CustomerOrderType) => row.credit,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          return (
            <div className="w-full h-[2.6rem] bg-gray-300 flex items-center pl-2 border-x border-black">
              <p className="text-base font-semibold">
                {Math.abs(totalCredit).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          );
        }
        return (
          <div className="flex">
            <input
              type="number"
              defaultValue={row.credit}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value < 0) {
                  return;
                }

                const newOrders = [...editedOrders];
                newOrders[index].credit = Number(e.target.value);
                setEditedOrders(newOrders);
              }}
              className="w-full p-2 border border-gray-300 rounded-none text-base"
              name={`credit-${index}`}
              id={`credit-${index}`}
              onBlur={(e) => {
                e.preventDefault();
                saveEditedOrders();
              }}
            />
          </div>
        );
      },
      minWidth: "125px",
      maxWidth: "130px",
    },
    {
      name: <span className="font-semibold text-base">Balance</span>,
      selector: (row: CustomerOrderType) => row.uuid,
      sortable: false,
      cell: (row: CustomerOrderType, index: number) => {
        if (row.description === "last_for_summaray") {
          // Calculate total debit and credit
          const totalDebit = editedOrders.reduce((acc, order) => {
            return acc + (order?.debit ?? 0);
          }, 0);

          const totalCredit = editedOrders.reduce((acc, order) => {
            return acc + (order?.credit ?? 0);
          }, 0);

          const total = totalCredit - totalDebit;

          return (
            <div className="w-full h-[2.6rem] bg-gray-300 flex items-center justify-end pl-2 border-l border-black">
              <p className="text-base font-semibold">
                {Math.abs(total).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="text-base font-semibold border-l-2 border-black ml-1 pl-1 w-10 h-full text-center align-middle flex items-center justify-center">
                {total === 0 ? "NIL" : total > 0 ? "Cr." : "Dr."}
              </div>
            </div>
          );
        } else {
          // Get Current and all the previous orders from the current order
          const currentOrder = editedOrders[index];
          const previousOrders = editedOrders.slice(0, index);
          const allOrders = [...previousOrders, currentOrder];

          // Calculate total debit and credit
          const totalDebit = allOrders.reduce((acc, order) => {
            return acc + (order?.debit ?? 0);
          }, 0);

          const totalCredit = allOrders.reduce((acc, order) => {
            return acc + (order?.credit ?? 0);
          }, 0);

          const total = totalCredit - totalDebit;

          return (
            <div className="flex justify-end items-center gap-1.5 pr-2 w-full border border-gray-300 h-[2.6rem]">
              <p className="text-base">
                {Math.abs(total).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="text-base font-medium border-l border-black ml-1 pl-1 w-8 h-full text-center align-middle flex items-center justify-center">
                {total === 0 ? "NIL" : total > 0 ? "Cr." : "Dr."}
              </div>
            </div>
          );
        }
      },
      minWidth: "140px",
      maxWidth: "145px",
    },
    {
      name: <span className="font-semibold text-sm opacity-0">A</span>,
      selector: (row: CustomerOrderType) => row.uuid,
      sortable: false,
      cell: (row: CustomerOrderType) => {
        if (row.description === "last_for_summaray") {
          return <div className="w-full h-[2.6rem] bg-white"></div>;
        }
        return (
          <div className="flex justify-center items-center w-full pl-2">
            <button
              onClick={() => {
                setSelectedOrder(row);
                setShowDeleteOrder(true);
              }}
              className="text-red-500 w-fit h-fit"
            >
              <MdDelete size={20} />
            </button>
          </div>
        );
      },
      minWidth: "30px",
      maxWidth: "30px",
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
        borderBottom: "0px solid #ddd !important",
        padding: "0px",
        margin: "0px",
      },
    },
    headRow: {
      style: {
        borderBottom: "1px solid #ddd !important",
        color: "#fff",
        backgroundColor: "#06B6D4",
      },
    },
    cells: {
      style: {
        border: "none",
        color: "#000",
        padding: "0px",
        margin: "0px",
      },
    },
  };

  const saveEditedOrders = async (customList?: CustomerOrderType[]) => {
    setUpdating(true);
    const formattedOrders: CustomerOrderType[] = (
      customList ? customList : editedOrders
    )
      .filter((order) => {
        return (
          order.date !== "" ||
          order.description !== "" ||
          order.vehicleNo !== "" ||
          order.weight !== 0 ||
          order.rate !== 0 ||
          order.freight !== 0 ||
          order.debit !== 0 ||
          order.credit !== 0
        );
      })
      .filter((order) => order?.description !== "last_for_summaray")
      .map((order) => {
        return {
          date: order.date ?? "",
          uuid: order.uuid ?? uuidv4(),
          description: order.description ?? "",
          vehicleNo: order.vehicleNo ?? "",
          weight: order.weight ?? 0,
          rate: order.rate ?? 0,
          freight: order.freight ?? 0,
          debit: order.debit ?? 0,
          credit: order.credit ?? 0,
          createdAt: order.createdAt ?? "",
        };
      });

    await UpdateCustomer({
      uuid: customer?.uuid ?? uuidv4(),
      id: customer?.id ?? uuidv4(),
      name: customer?.name ?? "",
      phoneNo: customer?.phoneNo ?? [],
      address: customer?.address ?? "",
      orders: formattedOrders,
      updatedAt: new Date().toISOString(),
    });

    setLastUpdated(new Date().toISOString());
    setUpdating(false);
  };

  const removeRow = (uuid: string) => {
    const newOrders = editedOrders.filter((order) => order.uuid !== uuid);
    setEditedOrders(newOrders);
    setDeletingOrder(false);
    setShowDeleteOrder(false);
    setTimeout(() => {
      saveEditedOrders(newOrders);
    }, 1000);
  };

  return (
    <main>
      {loading ? (
        <section className="col-span-full w-full h-96 py-20 flex items-center justify-center text-lg gap-x-2">
          <Loader width={50} borderWidth={3} color="primary" />
        </section>
      ) : customer ? (
        <>
          <section className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="flex items-center gap-2">

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
            </div>

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
                  {editedOrders.length}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Orders Amount: </span>
                  PKR{" "}
                  {totalOrdersAmount?.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Debit Amount: </span>
                  PKR{" "}
                  {Math.abs(totalDebit)?.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Credit Amount: </span>
                  PKR{" "}
                  {Math.abs(totalCredit)?.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-lg font-normal">
                  <span className="font-semibold">Total Balance:</span>
                  PKR{" "}
                  {Math.abs(totalCredit - totalDebit)?.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </section>
            </section>

            {/* Orders */}
            <section className="col-span-full border w-full flex flex-col gap-4 px-5 pt-4 pb-6 rounded-lg shadow-md">
              <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Customer's Orders</h2>
                <Button
                  size={"sm"}
                  onClick={() => {
                    const config = {
                      data: editedOrders
                        .filter(
                          (order) => order.description !== "last_for_summaray"
                        )
                        .filter(
                          (order) =>
                            order.date !== "" ||
                            order.description !== "" ||
                            order.vehicleNo !== "" ||
                            order.weight !== 0 ||
                            order.rate !== 0 ||
                            order.freight !== 0 ||
                            order.debit !== 0 ||
                            order.credit !== 0
                        )
                        .map((order, index) => {
                          const currentOrder = order;
                          const previousOrders = editedOrders.slice(0, index);
                          const allOrders = [...previousOrders, currentOrder];

                          // Calculate total debit and credit
                          const totalDebit = allOrders.reduce((acc, order) => {
                            return acc + (order?.debit ?? 0);
                          }, 0);

                          const totalCredit = allOrders.reduce((acc, order) => {
                            return acc + (order?.credit ?? 0);
                          }, 0);

                          const total = totalCredit - totalDebit;

                          return {
                            Date: order.date,
                            "Customer Name": customer.name,
                            "Phone No": customer.phoneNo.join(", "),
                            Description: order.description,
                            Vehicle: order.vehicleNo,
                            Weight: order.weight ?? 0,
                            Rate: order.rate ?? 0,
                            Freight: order.freight ?? 0,
                            Debit: order.debit ?? 0,
                            Credit: order.credit ?? 0,
                            Balance: `${total} - ${total === 0 ? "NIL" : total > 0 ? "Cr." : "Dr."
                              }`,
                          };
                        }),
                      filename: `Customer-${customer.name}-Orders-${formatDate({
                        format: "DD-MM-YYYY",
                        unformatedDate: new Date().toISOString(),
                      })}`,
                      delimiter: ",",
                      headers: [
                        "Date",
                        "Customer Name",
                        "Phone No",
                        "Description",
                        "Vehicle",
                        "Weight",
                        "Rate",
                        "Freight",
                        "Debit",
                        "Credit",
                        "Balance",
                      ],
                    };
                    jsonToCsvExport(config);
                  }}
                  variant={"outline"}
                  className=""
                >
                  Download CSV
                </Button>
                </div>

                <button
                  className="flex items-center justify-center gap-1.5 w-fit ml-auto"
                  disabled={updating}
                  onClick={() => {
                    saveEditedOrders();
                  }}
                >
                  {updating
                    ? "Updating"
                    : `Last updated: ${formateIntoReadableText(
                      lastUpdated ?? ""
                    )}`}
                  <IoSyncOutline
                    size={20}
                    className={`${updating ? "animate-spin" : ""}`}
                  />
                </button>
              </section>
              <section className="w-full mt-0">
                <DataTable
                  columns={columns}
                  data={editedOrders}
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
                  highlightOnHover={false}
                  striped={false}
                  pagination={false}
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3"
                  onClick={() => {
                    const newOrder = getEmptyCustomerOrder();
                    // Add new order at last 2nd index
                    const newOrders = [...editedOrders];
                    newOrders.splice(newOrders.length - 1, 0, newOrder);
                    setEditedOrders(newOrders);
                  }}
                >
                  <FaPlus className="mr-1" size={12} />
                  Add New Order
                </Button>
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
                  removeRow(selectedOrder.uuid);
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
