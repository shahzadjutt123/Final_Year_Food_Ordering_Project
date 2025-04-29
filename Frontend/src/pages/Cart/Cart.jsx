import React, { useContext, useEffect } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  { useState } from "react";

const Cart = () => {
  const { cartItems, food_list, token, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const[isToastVisible, setIsToastVisible] = useState(false);
  const [Token, setToken] = useState(localStorage.getItem("token")); // ✅ Get token from localStorage
  

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // ✅ Fetch from localStorage on refresh
    if (!storedToken) {
      alert("Please login first or create an account");
      navigate("/");
    } else {
      setToken(storedToken); // ✅ Set token in state
    }
  }, [navigate]);

  const handleCheckout = () => {
    const totalAmount = getTotalCartAmount();
  
    if (totalAmount === 0) {
      if (!isToastVisible) {
        setIsToastVisible(true);
        toast.error("Your cart is empty! Please add items before proceeding.", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => setIsToastVisible(false), // Reset state when toast disappears
        });
      }
      return;
    }
  
    navigate("/order");
  };
  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div className="cart-items-title cart-items-item" key={index}>
                <img src={url + "/images/" + item.image} alt="" />
                <p>{item.name}</p>
                <p>${item.price}</p>
                <p>{cartItems[item._id]}</p>
                <p>${item.price * cartItems[item._id]}</p>
                <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
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
          {/* ✅ Handle Checkout with Validation */}
          <button name="btn" onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='Promo code' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;





// import React, { useContext, useEffect } from 'react'
// import './Cart.css'
// import { useNavigate } from 'react-router-dom'
// import{StoreContext} from '../../context/StoreContext'

// const Cart = () => {
//   const {cartItems,food_list,token,removeFromCart,getTotalCartAmount,url}=useContext(StoreContext);
  
//   const navigate=useNavigate();
//   useEffect(()=>{
//       if(!token){
//         alert("Plese Login First Or create account")
//         navigate('/')
//       }
//     },[token])
//   return (
//     <div className='cart'>
//       <div className="cart-items">
//         <div className="cart-items-title">
//           <p>Items</p>
//           <p>Title</p>
//           <p>Price</p>
//           <p>Quantity</p>
//           <p>Total</p>
//           <p>Remove</p>
//         </div>
//         <br/>
//         <hr/>
//         {food_list.map((item,index)=>{
//           if(cartItems[item._id]>0){
//             return(
//               <div className="cart-items-title cart-items-item">
//               <img src={url+"/images/"+item.image} alt="" />
//               <p>{item.name}</p>
//               <p>${item.price}</p>
//               <p>{cartItems[item._id]}</p>
//               <p>${item.price*cartItems[item._id]}</p>
//               <p onClick={()=>removeFromCart(item._id)} className='cross'>x</p>
//               </div>
//             )
//           }
//         })}
//       </div>

//       <div className="cart-bottom">
//         <div className="cart-total">
//           <h2>Cart Total</h2>
//           <div>
//             <div className="cart-total-details">
//               <p>Subtotal</p>
//               <p>${getTotalCartAmount()}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <p>Delievery Fee</p>
//               <p>${getTotalCartAmount()===0?0:2}</p>
//             </div>
//             <hr />
//             <div className="cart-total-details">
//               <b>Total</b>
//               <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
//             </div>
//           </div>
//           <button onClick={()=>navigate("/order")}>PROCEED TO CHECKOUT
//           </button>
//         </div>
//         <div className="cart-promocode">
//           <div>
//             <p>If you have a promo code, Enter it here</p>
//             <div className="cart-promocode-input">
//               <input type="text" placeholder='Promo code' />
//               <button>Submit</button>
//             </div>
//           </div>
//         </div>
//       </div>
      
//     </div>
//   )
// }

// export default Cart
