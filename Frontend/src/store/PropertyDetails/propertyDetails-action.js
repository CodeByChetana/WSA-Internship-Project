import { propertyDetailsAction } from "./propertyDetails-slice";
import { axiosInstance } from "../../utils/axios";
// fetech details of one specific property using its id 

//recv property id 
//start loading
//call backend api
//wait for response 
// get the property data 
//store detaiks in redux
//if error store errir in redux

export const getPropertyDetails = {id}=> async(dispatch)=>{
    try{
        dispatch(propertyDetailsAction.getListRequest());
        const response=await axiosInstance(`/v1/rent/listing/${id}`)
        console.log(response);
        if(!response){
            throw new Error ("Could not fetch any propertiesDetails")
        }
        const{data}=response.data;
        dispatch(propertyDetailsAction.getPropertyDetails(data))

    }
    catch(error){
        dispatch(propertyDetailsAction.getErrors(error.response.data.error))
    }
}