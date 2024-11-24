import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CustomerType } from "@/types/CustomerType";
import { MdAddIcCall, MdDelete } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { Button } from "../ui/button";
import {
  AddCustomer,
  UpdateCustomer,
} from "@/lib/Firebase/Services/CustomerService";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

type Props = {
  formType: "Add" | "Edit";
  customer?: CustomerType;
  fetchCustomers: () => void;
  closeModel: () => void;
  totalCustomers: number;
};

function CustomerFormModel({
  formType,
  totalCustomers,
  closeModel,
  fetchCustomers,
  customer,
}: Props) {
  const [name, setName] = useState(customer?.name ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [phoneNo, setPhoneNo] = useState<string[]>(customer?.phoneNo ?? [""]);

  const [loading, setLoading] = useState(false);

  const addCustomer = async () => {
    try {
      setLoading(true);
      await AddCustomer({
        uuid: uuidv4(),
        id: `${totalCustomers + 1}`,
        name: name,
        address: address,
        phoneNo: phoneNo,
        orders: customer?.orders ?? [],
        updatedAt: new Date().toISOString(),
      });

      toast.success("Customer added successfully");
      setLoading(false);
      closeModel();
      fetchCustomers();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add customer");
      setLoading(false);
    }
  };

  const updateCustomer = async () => {
    try {
      setLoading(true);
      await UpdateCustomer({
        uuid: customer?.uuid ?? "",
        id: customer?.id ?? "",
        name: name,
        address: address,
        phoneNo: phoneNo,
        orders: customer?.orders ?? [],
        updatedAt: new Date().toISOString(),
      });

      toast.success("Customer updated successfully");
      setLoading(false);
      closeModel();
      fetchCustomers();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update customer");
      setLoading(false);
    }
  };

  return (
    <section className="fixed top-0 left-0 w-full h-full bg-black/30 z-50 backdrop-blur-sm flex items-center justify-center">
      <form
        className="w-full max-w-lg h-fit px-6 py-10 bg-white rounded-xl shadow-xl relative slideUpFadeInAnimation"
        onSubmit={(e) => {
          e.preventDefault();
          if (formType === "Add") {
            addCustomer();
          } else {
            updateCustomer();
          }
        }}
      >
        <h1 className="text-2xl font-bold text-center">
          {formType === "Add" ? "Add New Customer" : "Edit Customer Details"}
        </h1>

        <section className="flex flex-col gap-4 mt-8">
          <Label htmlFor="name" className="flex flex-col gap-1.5">
            Name
            <Input
              type="text"
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Label>
          <Label htmlFor="address" className="flex flex-col gap-1.5">
            Address
            <Input
              type="text"
              id="address"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Label>
          <Label htmlFor="phoneNo" className="flex flex-col gap-1.5">
            Phone Number
            {phoneNo.map((phone, index) => (
              <div key={index} className="relative flex items-center">
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => {
                    const newPhoneNo = [...phoneNo];
                    newPhoneNo[index] = e.target.value;
                    setPhoneNo(newPhoneNo);
                  }}
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    className="w-fit h-fit absolute right-5"
                    onClick={() => {
                      const newPhoneNo = [...phoneNo];
                      newPhoneNo.splice(index, 1);
                      setPhoneNo(newPhoneNo);
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
              onClick={() => setPhoneNo([...phoneNo, ""])}
            >
              <MdAddIcCall size={18} />
              Add Another Phone Number
            </Button>
          </Label>
          <Button
            type="submit"
            variant={"default"}
            className="w-full"
            loading={loading}
          >
            {formType === "Add" ? "Add Customer" : "Update Customer"}
          </Button>
        </section>
        <button
          className="absolute top-3 right-3 w-fit h-fit"
          type="button"
          onClick={closeModel}
        >
          <IoIosClose size={40} className="text-primary" />
        </button>
      </form>
    </section>
  );
}

export default CustomerFormModel;
