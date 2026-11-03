import {userActions} from './user-slice';
import {axiosInstance} from '../../utils/axios';

export const getSignup = (user) => async (dispatch) => {
    try {
        dispatch(userActions.getSignupRequest());
        const {data} = await axiosInstance.post('/v1/rent/user/signup', user);
        dispatch(userActions.getSignupDetails(data.user));
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message));
    }
}

//login
export const getLogin = (user) => async (dispatch) => {
    try {
        dispatch(userActions.getSignupRequest());
        const {data} = await axiosInstance.post('/v1/rent/user/login', user);
        dispatch(userActions.getLoginDetails(data.user));
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message));
    }
}

export const currentUser = () => async (dispatch) => {
    try {
        dispatch(userActions.getCurrentRequest());
        const {data} = await axiosInstance.get('/v1/rent/user/me');
        dispatch(userActions.getCurrentUser(data.user));
    } catch (error) {
        dispatch(userActions.getLogout(null));
    }
}

export const updateUser = (user) => async (dispatch) => {
    try {
        dispatch(userActions.getUpdateUserRequest());
        const response = await axiosInstance.patch('/v1/rent/user/updateMe', updateUser);
        console.log(response);
        const {data} = response.axiosInstance.get('/v1/rent/user/me');
        dispatch(userActions.getCurrentUser(data.user));
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message));
    }
}

export const forgotPassword = (email) => async (dispatch) => {
    try {
        await axiosInstance.post('/v1/rent/user/forgotpassword', {email})
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message))
    }
}

export const resetPassword = (repassword,token) => async (dispatch) => {
    try {
        await axiosInstance.patch(`/v1/rent/user/resetpassword/${token}`, repassword)
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message))
    }
}

export const updatePassword = (passwords) => async (dispatch) => {
    try {
        dispatch(userActions.getPasswordRequest())
        await axiosInstance.patch('/v1/rent/user/updateMyPassword', passwords)
        dispatch(userActions.getPasswordSuccess(true))

    } catch (error) {
        dispatch(userActions.getError(error.response.data.message))
    }
}

export const logout = () => async (dispatch) => {
    try {
        await axiosInstance.get('/v1/rent/user/logout');
  
    } catch (error) {
        dispatch(userActions.getError(error.response.data.message));
    }
}