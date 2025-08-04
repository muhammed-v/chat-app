// we use axios instead of fetch (convenience)
//initializing axios( creating an instance of axios which we can use throughout our application)

import axios from "axios";

export const axiosInstance =axios.create({
    baseURL:import.meta.env.MODE === "development"?"http://localhost:5001/api": "/api",//in production, whateverURL/api
    withCredentials: true // for sending the cookies in every single request
});

// now we can use the axiosInstance throughout our application. axiosInstance.get , axiosInstance.post, axiosInstance.put etc.