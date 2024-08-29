import { FaUserFriends } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className='pt-20'>
      <h1 className='text-4xl font-bold text-primary text-center'>
        Welcome to the Logistics Management App
      </h1>
      <section className="flex items-center justify-center gap-8 mt-20">
        <section className="w-96 aspect-video bg-white shadow-lg border border-black/10 rounded-xl flex items-center flex-col justify-center gap-5 cursor-pointer"
          onClick={() => {
            navigate("/orders")
          }}
        >
          <FaTruckFast size={60} className="text-primary" />
          <p className="text-xl font-bold text-primary">
            Manage Orders
          </p>
        </section>
        <section className="w-96 aspect-video bg-white shadow-lg border border-black/10 rounded-xl flex items-center flex-col justify-center gap-5  cursor-pointer"
          onClick={() => {
            navigate("/users")
          }}
        >
          <FaUserFriends size={60} className="text-primary" />
          <p className="text-xl font-bold text-primary">
            Manage Users
          </p>
        </section>
      </section>
    </main>
  )
}