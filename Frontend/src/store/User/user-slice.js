import {createSlice} from '@reduxjs/toolkit';
const userSlice = createSlice({
  name: 'user',
  initialState: {
    isAuthenticated: false,
    loading: false,
    user: null,
    errors:null,
    success:false
  },
  reducers:{
    getSignupRequest:(state)=>{
        state.loading = true;
        },
        getSignupDetails:(state,action)=>{ 
            state.user = action.payload,
            state.isAuthenticated = true,
            state.loading = false
        },
        getError:(state,action)=>{
            state.errors = action.payload;
            state.loading = false;
        },
        getCurrentRequest:(state)=>{
            state.loading = true;
        },
        getUpdateUserRequest:(state)=>{
            state.loading = true;
        },
        getCurrentUser:(state,action)=>{
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
        },
        getLogoutUser:(state)=>{
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        getPasswordSuccess:(state)=>{
            state.success = true;
            state.loading = false;
        },
        clearErrors:(state)=>{
            state.errors = null;
        }

  }

  })
  export const userActions = userSlice.actions;
  export default userSlice;