//Property Details
//create the slice nmae
//create the intial state
//request start
//property data received
//error occours
//export actions
//export slice

import { createSlice } from "@reduxjs/toolkit";
import propertySlice from "../Property/property-slice";

const propertyDetailsSlice = createSlice({
  name: "propertyDetails",
  initialState: {
    propertydetails:null,
    loading:false,
    error:null
  },
  reducers:{
    getListRequest(state){
        state.loading=true
    },
    getPropertyDetails(state,action){
        state.loading=false
        state.propertydetails=action.payload
    },
    getListError(state,action){
        
        state.error=action.payload
        state.loading=false
    }
  }
})

export const propertyDetailsAction=propertyDetailsSlice.actions
export default propertyDetailsSlice