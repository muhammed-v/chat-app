import {create} from 'zustand'// Zustand is a global state management library. Eg:authenticated user state, etc...
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL=import.meta.env.MODE === "development"?"http://localhost:5001":"/";

//A store is created using the create function from Zustand. The store contains your state and any functions to update it.
export const useAuthStore = create((set,get)=>({// first argument is a callback function where we would like to return an object and this object will be our initial state
    authUser: null, //checking whether the user is authenticated or not
    isSigningUp: false,//loading state
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,//loading state for authUser //initially true since as soon as we refresh, we will check  if the user is authenticated or not
    // while checking, we can show a loading spinner on the screen
    onlineUsers:[],
    socket:null,
    checkAuth: async()=>{//checking if authenticated or not. we already have an endpoint for this in backend
        try {
            const res = await axiosInstance.get("/auth/check");

            set({authUser:res.data});//seting authUser state to res.data
            get().connectSocket();

        } catch (error) {
            console.log("Error in checkAuth:",error);
            set({authUser:null});
        } finally {
            set({isCheckingAuth:false});
        }
    },

    signup: async (data)=>{
        set({isSigningUp:true});
        try {
            const res= await axiosInstance.post("/auth/signup",data);
            set({authUser:res.data});
            toast.success("Account created successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isSigningUp:false});
        }
    },

    login: async (data)=>{
        set({isLoggingIn:true});
        try {
            const res= await axiosInstance.post("/auth/login",data);
            set({authUser:res.data});
            toast.success("Logged in successfully");

            //after login, connect to socket.io immediately.
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isLoggingIn:false});
        }
    },

    logout: async ()=>{
        try {//if we want, we can add a state for this, but since logout is very quick, it'll not be necessary
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }, 

    updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

    connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return; //get().socket?.connected-> IF ALREADY CONNECTED, DONT MAKE A NEW CONNECTION

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

   disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); //if connected, only then disconnected. this is more of an optimization than a necessity
  },


}));