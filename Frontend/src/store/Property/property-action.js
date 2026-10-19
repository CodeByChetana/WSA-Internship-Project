//get All properties
//1.start api req
//2.get redux loading started
//3.get search parameters
//4.call backend api 
//5.wait for response
//6,get property data
//7 send data to redux store 
//8.if error =? send error to redux 

import { propertyActions } from "./property-slice";

//dispatch => send to redux
//getState=>get from redux

export const getAllProperties =()=> async(dispatchEvent,getState) =>{
    try{
        console.log("API call started");
        dispatchEvent(propertyActions.getRequest())
        const {SearchParams} = getState().properties
        console.log(SearchParams)
    }
    catch(error){
        
    }
}