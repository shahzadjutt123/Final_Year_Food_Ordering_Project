import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const [location, setLocation] = useState({
    latitude: "",
    longitude: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success("📍 Location successfully saved!");
        },
        (error) => {
          console.log("Location error:", error);
          if (error.code === 1) {
            toast.error("❌ Location access denied by user.");
          } else if (error.code === 2) {
            toast.error("❌ Location unavailable.");
          } else if (error.code === 3) {
            toast.error("⏰ Location request timed out.");
          } else {
            toast.error("❌ An unknown error occurred while fetching location.");
          }
        }
      );
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!location.latitude || !location.longitude) {
      toast.error("Please click 'Get My Location' and allow access before placing the order.");
      return;
    }

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: address,
      location: location,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    try {
      let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Something went wrong while placing the order.");
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      toast.error("Please login and add items to cart first");
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <>
      <form onSubmit={placeOrder} className='place-order'>
        <div className="place-order-left">
          <p className='title'>Delivery Information</p>
          <div className="multi-fields">
            <input required name='firstName' onChange={onChangeHandler} value={address.firstName} type="text" placeholder='First name' />
            <input required name='lastName' onChange={onChangeHandler} value={address.lastName} type="text" placeholder='Last name' />
          </div>
          <input required name='email' onChange={onChangeHandler} value={address.email} type="text" placeholder='Email address' />
          <input required name='street' onChange={onChangeHandler} value={address.street} type="text" placeholder='Street' />
          <div className="multi-fields">
            <input required name='city' onChange={onChangeHandler} value={address.city} type="text" placeholder='City' />
            <input required name='state' onChange={onChangeHandler} value={address.state} type="text" placeholder='State' />
          </div>
          <div className="multi-fields">
            <input required name='zipcode' onChange={onChangeHandler} value={address.zipcode} type="text" placeholder='Zip code' />
            <input required name='country' onChange={onChangeHandler} value={address.country} type="text" placeholder='Country' />
          </div>
          <input required name='phone' onChange={onChangeHandler} value={address.phone} type="text" placeholder='Phone' />

          <button
            type="button"
            onClick={getLocation}
            style={{ marginTop: '12px', padding: '8px 14px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📍 Get My Location
          </button>

          {location.latitude && location.longitude && (
            <p style={{ fontSize: '12px', color: 'green', marginTop: '8px' }}>
              Location set: ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
            </p>
          )}
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart Total</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
              </div>
            </div>
            <button name="btn" type='submit'>PROCEED TO PAYMENT</button>
          </div>
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default PlaceOrder;
