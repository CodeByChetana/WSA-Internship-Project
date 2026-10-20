import {configureStore} from '@reduxjs/toolkit';
import propertySlice from './Property/property-slice';


const store = configureStore({
    reducer:{
        properties: propertySlice.reducer,
        
    }
})
export default store;