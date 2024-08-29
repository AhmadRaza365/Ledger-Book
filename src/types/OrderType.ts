type OrderType = {
    id: string;
    weight: number;
    isWithCustomPackaging: boolean;
    sender: {
        name: string;
        phone: string;
        email: string;
        city: string;
        address: string;
    };
    receiver: {
        name: string;
        phone: string;
        email: string;
        city: string;
        address: string;
    };
    status: "pending" | "shipped" | "delivered" | "cancelled" | "returned";
    createdAt: string;
    updates: {
        createdAt: string;
        location: string;
        message: string;
    }[];
    paymentOption: "cod" | "prepaid";
    orderAmount: number;
};

export type { OrderType }