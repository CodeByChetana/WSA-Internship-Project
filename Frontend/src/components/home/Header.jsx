import React, { useState } from "react";
import Search from "./Search";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Filter from "./Filter";
import toast from "react-hot-toast";
import "../../css/AiTripPlanner.css";
import { STATIC_USER, STATIC_IS_AUTHENTICATED } from "../../data/staticData";

const Header = () => {
  // STATIC: was `useSelector((state) => state.user)`.
  // TODO: replace with your own auth logic.
  const [isAuthenticated] = useState(STATIC_IS_AUTHENTICATED);
  const [user] = useState(STATIC_USER);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const logoutUser = () => {
    // TODO: add your logout logic here.
    toast.success("User has loggedout successfully");
    navigate("/");
  };

  const refreshFunction = () => {
    // TODO: add your "reset filters + reload properties" logic here.
  };

  return (
    <>
      <nav className="header row sticky-top ">
        <Link to="/">
          <img
            src="/assets/logo.png"
            alt="logo"
            className="logo"
            onClick={refreshFunction}
          />
        </Link>
        {isHomePage && (
          <div className="search_filter">
            <Search />
            <Filter />

            <Link to="/ai-trip-planner" className="ai-trip-link">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Trip Genie</span>
            </Link>
          </div>
        )}
        {!isAuthenticated && !user && (
          <Link to="/login" className="login-tip">
            <span className="material-symbols-outlined web_logo">
              account_circle
            </span>
            <span className="login-tip-text">You are not logged in. Please login</span>
          </Link>
        )}
        {isAuthenticated && user && (
          <div className="dropdown">
            <span
              className="material-symbols-outlined web_logo dropdown-toggle"
              href="#"
              role="button"
              id="dropdownMenuLink"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user.avatar.url && (
                <img
                  src={user.avatar.url}
                  className="user-img"
                  alt="icon"
                />
              )}
              {!user.avatar.url && "account_circle"}
            </span>

            <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
              <li>
                <Link className="dropdown-item" to="/profile">
                  {" "}
                  My Account
                </Link>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={logoutUser}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};
export default Header;
