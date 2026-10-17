import React, { useEffect, useState } from "react";
import "../../css/MyBookings.css";
import ProgressSteps from "../ProgressSteps";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { STATIC_BOOKINGS } from "../../data/staticData";

const MyBookings = () => {
  const navigate = useNavigate();

  // STATIC: was `useSelector((state) => state.booking)`.
  // TODO: replace with your own bookings fetching logic.
  const [bookings] = useState(STATIC_BOOKINGS);
  const [loading] = useState(false);

  useEffect(() => {
    // TODO: fetch the user bookings here and set them above.
  }, []);

  console.log(bookings);

  const handleBookingClick = (bookingId) => {
    // TODO: fetch this booking's details here if you need to.
    navigate(`/user/myBookings/${bookingId}`);
  };

  if (bookings.length === 0 && !loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <h3>Nothing booked yet</h3>
      </div>
    );
  }
  return (
    <>
      <ProgressSteps />
      <div className="wow">
        {loading && <LoadingSpinner />}
        {!loading &&
          bookings.length > 0 &&
          bookings.map((booking) => (
            <div
              className="main-container"
              onClick={() => handleBookingClick(booking._id)}
              key={booking._id}
            >
              <div className="mybookings-container row">
                <div className="image-container col-lg-3 col-md-3">
                  <img
                    className="booking-img"
                    src={
                      booking.property.images &&
                      booking.property.images.length > 0
                        ? booking.property.images[0].url
                        : undefined
                    }
                    alt="bookings"
                  />
                </div>
                <div className="booking-information col-lg-9 col-md-9">
                  <h6 className="hotel-name">
                    {booking.property.propertyName}
                  </h6>
                  <div className="stay-information">
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        bedtime
                      </span>
                      {booking.numberOfnights} nights
                    </span>
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        calendar_month
                      </span>
                      {new Date(booking.fromDate).toLocaleDateString()}
                    </span>
                    <span class="material-symbols-outlined icon">
                      arrow_forward
                    </span>
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        calendar_month
                      </span>
                      {new Date(booking.toDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="booking-price">
                    <span class="material-symbols-outlined">payments</span>{" "}
                    Total Price :&#8377; {booking.price}
                  </h5>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default MyBookings;
