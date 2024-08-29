import { getUsers } from "./Auth";

const CheckIfUserIsFirstUser = async () => {
  try {
    const users = await getUsers();

    if (users.result === "success") {
      if (users.data.length === 0) {
        return {
          result: "success",
          message: "No user is present in the database",
          data: 0,
        };
      } else {
        return {
          result: "success",
          message: "Users retrieved successfully",
          data: users.data.length,
        };
      }
    } else {
      return {
        result: "error",
        message: users.message,
        data: 0,
      };
    }

    // Check if No user is present in the database
  } catch (error: any) {
    return {
      result: "error",
      message: error?.message ?? "Couldn't get users from the database",
      data: 0,
    };
  }
};

export { CheckIfUserIsFirstUser };
