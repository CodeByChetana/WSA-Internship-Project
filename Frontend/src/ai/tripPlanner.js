import { axiosInstance } from "../utils/axios";

export const getTripPlan = async (trip) => {
  const { data } = await axiosInstance.post("/api/v1/rent/trip", trip);
  return data.data;
};
