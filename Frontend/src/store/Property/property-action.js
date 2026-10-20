import { propertyActions } from "./property-slice";
import {axiosInstance} from "../../utils/axios";
//get All properties
//1.start api req
//2.get redux loading started
//3.get search parameters
//4.call backend api 
//5.wait for response
//6,get property data
//7 send data to redux store 
//8.if error =? send error to redux 
//dispatch => send to redux
//getState=>get from redux

export const getAllProperties =()=> async(dispatch,getState) =>{
    try{
        console.log("API call started");
        dispatch(propertyActions.getRequest())
        const {searchParams} = getState().properties
        console.log(searchParams)
        const response = await axiosInstance.get(`/v1/rent/listing`,{
            params:{...searchParams}
        })
        if(!response){
            throw new Error("Could not fetch any properties")
        }
        const {data} = response;
        console.log(data)
        dispatch(propertyActions.getProperties(data))
    }
    catch(error){
        dispatch(propertyActions.getErrors(error.message))
    }
}