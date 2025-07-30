//create redux slice
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

//make http req using redux-thunk middleware
export const userAuthorLoginThunk=createAsyncThunk("user-auhtor-login", async (userCredObj, thunkApi) => {
  try {
    if (userCredObj.userType === "user") {
      const res = await axios.post(
        API_ENDPOINTS.USER.LOGIN,
        userCredObj
      );
      if (res.data.message == "login success") {
        //store token in local/session storage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userType", "user");

        //return data
      } else {
        return thunkApi.rejectWithValue(res.data.message);
      }
      return res.data;
    }
    if (userCredObj.userType === "author") {
      const res = await axios.post(
        API_ENDPOINTS.AUTHOR.LOGIN,
        userCredObj
      );
      if (res.data.message == "login success") {
        //store token in local/session storage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userType", "author");
      } else {
        return thunkApi.rejectWithValue(res.data.message);
      }
      return res.data;
    }
  } catch (err) {
    return thunkApi.rejectWithValue(err.response?.data?.message || err.message || "Login failed");
  }
});

// Thunk to restore user session from localStorage
export const restoreUserSession = createAsyncThunk("restore-user-session", async (_, thunkApi) => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");
    
    if (token && user && userType) {
      return {
        user: JSON.parse(user),
        token: token,
        userType: userType,
        message: "session restored"
      };
    } else {
      return thunkApi.rejectWithValue("No saved session found");
    }
  } catch (error) {
    return thunkApi.rejectWithValue("Failed to restore session");
  }
});

export const userAuthorSlice = createSlice({
  name: "user-author-login",
  initialState: {
    isPending:false,
    loginUserStatus:false,
    currentUser:{},
    errorOccurred:false,
    errMsg:'',
    isSessionRestored: false
  },
  reducers: {
    resetState:(state,action)=>{
        state.isPending=false;
        state.currentUser={};
        state.loginUserStatus=false;
        state.errorOccurred=false;
        state.errMsg='';
        state.isSessionRestored=false;
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
    }
  },
  extraReducers: builder=>builder
  .addCase(userAuthorLoginThunk.pending,(state,action)=>{
    state.isPending=true;
  })
  .addCase(userAuthorLoginThunk.fulfilled,(state,action)=>{
        state.isPending=false;
        state.currentUser=action.payload.user;
        state.loginUserStatus=true;
        state.errMsg=''
        state.errorOccurred=false;
        state.isSessionRestored=true;

  })
  .addCase(userAuthorLoginThunk.rejected,(state,action)=>{
        state.isPending=false;
        state.currentUser={};
        state.loginUserStatus=false;
        state.errMsg=action.payload;
        state.errorOccurred=true;
  })
  .addCase(restoreUserSession.pending,(state,action)=>{
    state.isPending=true;
  })
  .addCase(restoreUserSession.fulfilled,(state,action)=>{
        state.isPending=false;
        state.currentUser=action.payload.user;
        state.loginUserStatus=true;
        state.errMsg=''
        state.errorOccurred=false;
        state.isSessionRestored=true;
  })
  .addCase(restoreUserSession.rejected,(state,action)=>{
        state.isPending=false;
        state.currentUser={};
        state.loginUserStatus=false;
        state.errMsg='';
        state.errorOccurred=false;
        state.isSessionRestored=true;
  }),
});

//export action creator functions
export const {resetState} = userAuthorSlice.actions;
//export root reducer of this slice
export default userAuthorSlice.reducer;
