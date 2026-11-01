import {configureStore} from '@reduxjs/toolkit';
import propertySlice from './Property/property-slice';
import propertyDetailsSlice from './PropertyDetails/propertyDetails-slice';

const store = configureStore({
    reducer:{
        properties: propertySlice.reducer,
        propertydetails:propertyDetailsSlice.reducer,
        user: userSlice.reducer
        
    }
})
export default store;