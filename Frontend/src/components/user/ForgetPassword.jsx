import React from "react";
import "../../css/ForgetPassword.css";
import { useForm } from "@tanstack/react-form";
import toast from "react-hot-toast";

const ForgetPassword = () => {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => {
      console.log(value);
      // TODO: add your "forgot password" logic here.
      toast.success("Email Sent! Please Check your Email");
    },
  });

  return (
    <>
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <h1 className="password_title">Forget Password</h1>
            <form.Field name="email">
              {(field) => (
                <div className="form-group">
                  <label htmlFor="email_field">Enter Email</label>
                  <input
                    type="email"
                    id="email_field"
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <button
              id="forgot_password_button"
              type="submit"
              className="btn-block py-3 password-btn"

            >
              Send Email
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
