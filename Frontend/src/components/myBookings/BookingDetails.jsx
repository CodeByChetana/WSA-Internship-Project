import React, { useEffect, useState } from "react";
import "../../css/BookingDetails.css";
import PropertyImg from "../propertyListing/PropertyImg";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import {
  STATIC_BOOKINGS,
  STATIC_BOOKING_DETAILS,
} from "../../data/staticData";

const BookingDetails = () => {
  const { bookingId } = useParams();

  // STATIC: was `useSelector((state) => state.booking)`.
  // TODO: replace with your own booking details fetching logic.
  const [bookingDetails, setBookingDetails] = useState(STATIC_BOOKING_DETAILS);

  useEffect(() => {
    // TODO: fetch the booking details for `bookingId` here and set them below.
    // Statically we just look the booking up in the placeholder data.
    const found = STATIC_BOOKINGS.find(
      (booking) => booking._id === bookingId
    );
    setBookingDetails(found || STATIC_BOOKING_DETAILS);
  }, [bookingId]);

  console.log(bookingDetails);

  if (!bookingDetails || !bookingDetails.property) {
    return (
      <div className="row justify-content-around mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="details-container">
      <p className="details-header">{bookingDetails.property.propertyName}</p>
      <h6 className="details-location">
        <span className="material-symbols-outlined">location_on</span>
        <span className="location">
          {bookingDetails.property.address.area},{" "}
          {bookingDetails.property.address.city},{" "}
          {bookingDetails.property.address.pincode},{" "}
          {bookingDetails.property.address.state}
        </span>
      </h6>
      <div className="details-information-container ">
        <div className="details-information ">
          <h5 className>Booking Information</h5>
          <section className="booking-stay-information">
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                bedtime
              </span>
              {bookingDetails.numberOfnights} nights
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {new Date(bookingDetails.fromDate).toLocaleDateString()}
            </span>
            <span class="material-symbols-outlined  stay-icon">
              arrow_forward
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {new Date(bookingDetails.toDate).toLocaleDateString()}
            </span>
          </section>
        </div>
        <div className="details-total-price-container ">
          <div className="details-total-price">
            <p className="price-header">Total Price</p>
            <span className="price-in-number">
              {" "}
              &#8377; {bookingDetails.price}
            </span>
          </div>
        </div>
      </div>
      <PropertyImg images={bookingDetails.property.images} />
    </div>
  );
};

export default BookingDetails;
