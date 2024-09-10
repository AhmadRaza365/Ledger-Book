import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { AiFillEdit } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { CustomerType } from "@/types/CustomerType";
import {
  DeleteCustomer,
  GetAllCustomers,
} from "@/lib/Firebase/Services/CustomerService";
import toast from "react-hot-toast";
import CustomerFormModel from "@/components/models/CustomerFormModel";
import { Input } from "@/components/ui/input";
import { IoSearchOutline } from "react-icons/io5";

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null
  );
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showDeleteCustomer, setShowDeleteCustomer] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

  const columns = [
    {
      name: <span className="font-bold text-base">#</span>,
      selector: (row: CustomerType) => row.id,
      sortable: true,
      cell: (row: CustomerType) => (
        <p className="flex items-center gap-x-1.5 text-base">{row?.id}</p>
      ),
      minWidth: "80px",
      maxWidth: "80px",
    },
    {
      name: <span className="font-bold text-base">Name</span>,
      selector: (row: CustomerType) => row.name,
      sortable: true,
      cell: (row: CustomerType) => (
        <p className="flex items-center gap-x-1.5 text-base">{row?.name}</p>
      ),
      minWidth: "180px",
    },
    {
      name: <span className="font-bold text-base">Phone No</span>,
      selector: (row: CustomerType) => row.phoneNo[0],
      sortable: false,
      cell: (row: CustomerType) => (
        <div className="flex flex-col items-start gap-x-1.5 text-base py-1.5">
          {/* {row?.phoneNo[0]} */}
          {row?.phoneNo.map((phone, index) => (
            <p key={index}>{phone}</p>
          ))}
        </div>
      ),
      minWidth: "180px",
    },
    {
      name: (
        <span className="border-l-[1px] pl-[8px] border-[#D1D1D1] font-bold text-base">
          Action
        </span>
      ),
      cell: (row: CustomerType) => {
        return (
          <div className="flex items-center gap-x-2">
            <button
              className="w-fit h-fit rounded-md bg-primary p-2 text-white"
              onClick={() => {
                setSelectedCustomer(row);
                navigate(`/customers/${row.uuid}`);
              }}
            >
              <FaEye size={20} />
            </button>
            <button
              className="w-fit h-fit rounded-md bg-yellow-500 p-2 text-white"
              onClick={() => {
                setSelectedCustomer(row);
                setShowEditCustomer(true);
              }}
            >
              <AiFillEdit size={20} />
            </button>
            <button
              className="w-fit h-fit rounded-md bg-red-600 p-2 text-white"
              onClick={() => {
                setSelectedCustomer(row);
                setShowDeleteCustomer(true);
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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await GetAllCustomers();
      setCustomers(res);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.message ?? "Couldn't fetch customers");
      setCustomers([]);
    }
  };

  const deleteSelectedCustomer = async () => {
    try {
      setDeletingCustomer(true);
      await DeleteCustomer(selectedCustomer?.id ?? "");

      toast.success("Customer deleted successfully");
      setDeletingCustomer(false);
      setSelectedCustomer(null);
      setShowDeleteCustomer(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error?.message ?? "Couldn't delete customer");
      setDeletingCustomer(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <main>
      <section className="flex items-center gap-x-4">
        <h1 className="text-2xl font-semibold">All Customers</h1>
        <Button
          size={"sm"}
          onClick={() => {
            setShowAddCustomer(true);
          }}
        >
          Add New Customer
        </Button>
      </section>

      <section className="max-w-md flex items-center relative mt-8">
        <Input
          placeholder="Search Customers by Name or Phone No"
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
            customers.filter(
              (customer) =>
                customer.name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                customer.phoneNo.some((phone) =>
                  phone.includes(searchValue.toLowerCase())
                )
            ) ?? []
          }
          customStyles={customStyles}
          progressPending={loading}
          progressComponent={
            <section className="col-span-full w-full py-20 flex items-center justify-center text-lg gap-x-2">
              <Loader width={20} borderWidth={2} color="primary" />
              Fetching Customers...
            </section>
          }
          noDataComponent={
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <p className="p-2 font-bold text-xl 2xl:text-2xl">
                No Customers Found
              </p>
            </div>
          }
          highlightOnHover
          striped
          pagination
          onRowClicked={(row: CustomerType) => {
            navigate(`/customers/${row.uuid}`);
          }}
        />
      </section>

      {showAddCustomer && (
        <CustomerFormModel
          formType="Add"
          closeModel={() => {
            setShowAddCustomer(false);
          }}
          fetchCustomers={fetchCustomers}
          totalCustomers={customers.length}
        />
      )}

      {showEditCustomer && (
        <CustomerFormModel
          formType="Edit"
          closeModel={() => {
            setShowEditCustomer(false);
          }}
          fetchCustomers={fetchCustomers}
          totalCustomers={customers.length}
          customer={selectedCustomer ?? undefined}
        />
      )}

      {showDeleteCustomer && selectedCustomer && (
        <section className="fixed top-0 left-0 w-full h-full bg-black/40 z-50 flex items-center justify-center">
          <section className="relative w-full max-w-sm bg-white rounded-xl shadow-md py-6 px-8 slideUpFadeInAnimation">
            <h2 className="text-xl font-bold text-center text-black mb-6">
              Are you sure you want to delete {selectedCustomer?.name ?? ""}{" "}
              Data?
            </h2>
            <section className="flex justify-center gap-x-4">
              <Button
                size={"lg"}
                variant={"destructive"}
                onClick={() => {
                  deleteSelectedCustomer();
                  setDeletingCustomer(true);
                }}
                disabled={deletingCustomer}
                loading={deletingCustomer}
              >
                Delete
              </Button>
              <Button
                size={"lg"}
                variant={"outline"}
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowDeleteCustomer(false);
                }}
                disabled={deletingCustomer}
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
