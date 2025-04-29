import React, { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"
const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const[isToastVisible, setIsToastVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Prevents flickering
  const [showDropdown, setShowDropdown] = useState(false);
  const handleNavigation = (path) => {
    navigate(path);
    setShowDropdown(false); // ✅ Dropdown Hide on Navigation
  };
  // ✅ Read token from localStorage when component mounts
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false); // Done loading
  }, [setToken]);

  const logout = async() => {
    localStorage.removeItem("token");
    setToken("");
    await axios.post("http://127.0.0.1:5000/logout");
    navigate("/");
  };

  const handleCartClick = () => {
    if (!token) {
       if (!isToastVisible) {
              setIsToastVisible(true);
              toast.error("Please Login first OR create account!", {
                position: "top-right",
                autoClose: 2000,
                onClose: () => setIsToastVisible(false), // Reset state when toast disappears
              });
            }
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>
      <ul className="navbar-menu">
      <Link to="/">
        <a
           href="#home"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </a>
        </Link>
       
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          Mobile App
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon" onClick={handleCartClick}>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        <div>
          {loading ? null : !token ? ( // ✅ Prevent flickering by hiding until loading finishes
            <button name="btn"onClick={() => setShowLogin(true)}>Sign In</button>
          ) : (
              <div className="navbar-profile" onMouseLeave={() => setShowDropdown(false)}>
                <img
                  src={assets.profile_icon}
                  alt="Profile"
                  onClick={() => setShowDropdown(!showDropdown)} // ✅ Toggle Dropdown
                />
                {showDropdown && (
                  <ul className="nav-profile-dropdown">
                    <li onClick={() => handleNavigation("/myorders")}>
                      <img src={assets.bag_icon} alt="Orders" />
                      <p>Orders</p>
                    </li>
                    <hr />
                    <li onClick={logout}> {/* ✅ Change "/" to Logout Function */}
                      <img src={assets.logout_icon} alt="Logout" />
                      <p>Logout</p>
                    </li>
                  </ul>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;





// import React, { useContext, useState } from 'react'
// import './Navbar.css'
// import {assets} from '../../assets/assets'
// import {Link, useNavigate} from'react-router-dom'
// import { StoreContext } from '../../context/StoreContext'

// const Navbar = ({setShowLogin}) => {
//   const [menu,setManu]=useState("");

//   const {getTotalCartAmount,token,setToken} =useContext(StoreContext);
  
//   const navigate= useNavigate();

//   const logout=()=>{
//     localStorage.removeItem("token");
//     setToken("");
//     navigate("/")


//   }



//   return (
//     <div className='navbar'>
//       <Link to='/'><img src={assets.logo} alt='' className="logo" /></Link>
//       <ul className="navbar-menu">
//         <Link to='/' onClick={()=>setManu("home")}       className={menu==="home"?"active":""}>Home</Link>
//         <a href='#explore-menu' onClick={()=>setManu("menu")}       className={menu==="menu"?"active":""}>Menu</a>
//         <a href='#app-download' onClick={()=>setManu("mobile-app")} className={menu==="mobile-app"?"active":""}>Mobile-app</a>
//         <a href='#footer' onClick={()=>setManu("contact-us")} className={menu==="contact-us"?"active":""}>Contact-us</a>
//       </ul>
//       <div className="navbar-right">
//         <img src={assets.search_icon} alt="" />
//         <div className="navbar-search-icon">
//           <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
//           <div className={getTotalCartAmount()===0? "":"dot"}></div>
//         </div>
//         <div>
//           {!token?<button onClick={()=>setShowLogin(true)}>sign in</button>
//           :<div className='navbar-profile'>
//             <img src={assets.profile_icon} alt="" />
//             <ul className="nav-profile-dropdown">
//               <li onClick={()=>{navigate('/myorders')}}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
//               <hr />
//               <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
//             </ul>
        
//           </div> }
          
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Navbar
