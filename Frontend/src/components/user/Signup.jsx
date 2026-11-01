import React, { Fragment, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../../css/Login.css";
import {userDispatch,userSelector} from "react-redux";
import {getSignup} from "../../store/User/user-action";
import {userActions} from "../../store/User/user-slice";


const Signup = () => {
  const navigate = useNavigate();
  const dispatch = userDispatch();
  const {isAuthenticated,error} = userSelector((state)=>state.user);


  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
  });

  const { name, email, password, passwordConfirm, phoneNumber } = user;

  const submitHandler = (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(getSignup(user));
    console.log(user);
  
  };
  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  useEffect(()=>{
    if(error && error.length>0){
      toast.error(error);
      dispatch(userActions.clearErrors());
    }
    else if(isAuthenticated){
      navigate("/");
      toast.success("Registered Successfully");
    }
    },[isAuthenticated,error,navigate])

  return (
    <Fragment>
      <div className="row wrapper ">
        <form
          onSubmit={submitHandler}
          encType="multipart/form-data"
          className="col-10 col-lg-5"
        >
          <h1 className="mb-3">Register</h1>
          <div className="form-group">
            <label htmlFor="name_field">Name</label>
            <input
              type="text"
              id="name_field"
              className="form-control"
              name="name"
              value={name}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email_field">Email</label>
            <input
              type="email"
              id="email_field"
              className="form-control"
              name="email"
              value={email}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_field">Password</label>
            <input
              type="password"
              id="password_field"
              className="form-control"
              name="password"
              value={password}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm_field">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm_field"
              className="form-control"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber_field">Phone Number</label>
            <input
              type="text"
              id="phoneNumber_field"
              className="form-control"
              name="phoneNumber"
              value={phoneNumber}
              onChange={onChange}
            />
          </div>

          <button
            id="register_button"
            type="submit"
            className="loginbutton btn-block py-3"
          >
            REGISTER
          </button>
        </form>
      </div>
    </Fragment>
  );
};

export default Signup;
