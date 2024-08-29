import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { UserType } from "@/types/UserType";

// Authentication Functions

// Login with Email and Password
const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs?.docs?.length > 0) {
      return {
        result: "success",
        message: "Logged In Successfully",
        user: {
          profile: docs?.docs[0]?.data(),
        },
      };
    } else {
      Logout();
      return {
        result: "error",
        message: "User not found in the database",
        user: null,
      };
    }
  } catch (err: any) {
    return {
      result: "error",
      message: err.message.replace("Firebase: ", ""),
      user: null,
    };
  }
};

// Reset Password
const SendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      result: "success",
      message: "Password Reset Email Sent Successfully",
    };
  } catch (err: any) {
    return {
      result: "error",
      message: err.message,
    };
  }
};

// Functions for Logout
const Logout = () => {
  signOut(auth);
};

// Register with Full Name, email, Password
const registerNewUser = async (
  fullName: string,
  email: string,
  password: string,
  phone: string,
  sendEmail: boolean
) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const docs = await getDocs(q);
    // check if user exists in the database
    if (docs?.docs?.length === 0) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        phone: phone,
        createdAt: new Date().toISOString(),
      });
      if(sendEmail){
        SendPasswordReset(email);
      }
      return {
        result: "success",
        message: "Registered Successfully",
        user: {
          profile: {
            uid: user.uid,
            fullName: fullName,
            email: user.email,
            phone: phone,
          },
        },
      };
    } else {
      return {
        result: "error",
        message: "User already exists with same email.",
        user: null,
      };
    }
  } catch (err: any) {
    return {
      result: "error",
      message: err.message,
      user: null,
    };
  }
};

// Get User Data
const GetUserData = async (userUuid: string) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", userUuid));
    const docs = await getDocs(q);
    const userData = docs.docs[0].data();

    return {
      result: "success",
      message: "User data fetched Successfully",
      userData: userData,
    };
  } catch (err: any) {
    return {
      result: "error",
      message: err.message,
      userData: null,
    };
  }
};

// Get all Users
const getUsers = async () => {
  // Get a list of all orders
  try {
    const q = query(collection(db, "users"));
    const docs = await getDocs(q);
    const users = docs.docs.map((doc) => doc.data());
    return {
      result: "success",
      message: "Users retrieved successfully",
      data: users,
    };
  } catch (error: any) {
    return {
      result: "error",
      message: error?.message ?? "Couldn't get users from the database",
      data: [],
    };
  }
};

// Update User
const updateUser = async (user: UserType) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);

    const docRef = docs.docs[0].ref;

    updateDoc(docRef, user);

    return {
      result: "success",
      message: "User updated successfully",
      data: {},
    };
  } catch (error: any) {
    return {
      result: "error",
      message: error?.message ?? "Couldn't update user in the database",
      data: {},
    };
  }
};

// Delete User
const deleteUser = async (id: string) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", id));

    const docs = await getDocs(q);
    const docRef = docs.docs[0].ref;
    await deleteDoc(docRef);

    return {
      result: "success",
      message: "User deleted successfully",
    };
  } catch (error: any) {
    return {
      result: "error",
      message: error?.message ?? "Couldn't delete user from the database",
    };
  }
};

export {
  loginWithEmailPassword,
  SendPasswordReset,
  registerNewUser,
  Logout,
  getUsers,
  updateUser,
  deleteUser,
  GetUserData,
};
