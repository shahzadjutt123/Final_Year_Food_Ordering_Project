import React, { useContext, useState, useEffect } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";


const LoginSignupPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login");

  // State for storing user inputs
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "",countryCode:"",phone: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");

  // Success message state
  const [message, setMessage] = useState("");

  // Function to show a message and auto-hide it after 5 seconds
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(""); // Hide message after 5 seconds
    }, 5000);
  };

  const onSignUpChange = (event) => {
    const { name, value } = event.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };
  const onPhoneChange = (event) => {
    let phoneValue = event.target.value;
  
    // If user types "0", ensure it appears initially
    if (!phoneValue.startsWith("0") && phoneValue.length > 0) {
      phoneValue = "0" + phoneValue;
    }
  
    // If user types "03", auto-select Pakistan
    if (phoneValue.startsWith("03")) {
      setSignUpData((prev) => ({
        ...prev,
        phone: phoneValue.substring(1), // Remove leading "0"
        countryCode: "+92", // Auto-select Pakistan
      }));
    } else {
      // Allow manual country selection
      setSignUpData((prev) => ({
        ...prev,
        phone: phoneValue,
      }));
    }
  };
  
  
  

  const onLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage(""); // Clear previous messages

    if (currState === "Sign Up") {
      let registerUrl = url + "/api/user/register";
      try {
        const response = await axios.post(registerUrl, signUpData);
        if (response.data.success) {
          showMessage("Verification code sent to your email");
          setCurrState("Verify");
        } else {
          showMessage(response.data.message);
        }
      } catch (error) {
        showMessage("❌ Something went wrong. Please try again.");
      }
    } 
    else if (currState === "Verify") {
      let verifyUrl = url + "/api/user/verify";
      try {
        const response = await axios.post(verifyUrl, {
          email: signUpData.email,
          emailCode: verificationCode,
        });
        if (response.data.success) {
          showMessage("🎉 Your account has been successfully verified!");
          setCurrState("Login");
          setSignUpData({ name: "", email: "", password: "",phone: "" });
          setLoginData({  email: "", password: "" });
          setVerificationCode("");
        } else {
          showMessage(response.data.message);
        }
      } catch (error) {
        showMessage("❌ Verification failed. Please try again.");
      }
    } 
    else {
      let loginUrl = url + "/api/user/login";
      try {
        const response = await axios.post(loginUrl, loginData);
if (response.data.success) {
  showMessage("🎉 Login successful! Redirecting...");
  const mytoken = response.data.token;
  setToken(mytoken);
  localStorage.setItem("token", mytoken);
  await axios.post("http://127.0.0.1:5000/tokensend", { token: mytoken });

  setTimeout(() => setShowLogin(false), 2000); // Hide popup after success
} else {
  showMessage(response.data.message);
}

      } catch (error) {
        showMessage("❌ Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <div className="login-popup-title">
          <h1>{currState === "Verify" ? "Email Verification" : "Sign in or Sign up"}</h1>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>

        {/* ✅ Success/Error Message Box with Timer */}
        {/* {message && <div className="error-message">{message}</div>} */}

        {currState !== "Verify" && (
          <div className="custom-toggle">
            <button name="btn" className={currState === "Login" ? "active" : ""} onClick={() => setCurrState("Login")}>
              Sign In
            </button>
            <button  name="btn" className={currState === "Sign Up" ? "active" : ""} onClick={() => setCurrState("Sign Up")}>
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="login-popup-inputs">
        {message && <div className="error-message">{message}</div>}
          {currState === "Sign Up" && (
            <>
              <div className="input-container">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" placeholder="Your Name" value={signUpData.name} onChange={onSignUpChange} required />
              </div>
              <div className="input-container">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Required" name="email" value={signUpData.email} onChange={onSignUpChange} required />
              </div>
              <div className="input-container">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Required" value={signUpData.password} onChange={onSignUpChange} required />
              </div>
              {/* ✅ Country Code & Phone Number in One Line */}
              <div className="input-row">
                {/* Country Code Dropdown */}
                <div className="input-container country-code">
                  <label htmlFor="countryCode">Country</label>
                  <select id="countryCode" name="countryCode" value={signUpData.countryCode} onChange={onSignUpChange} required>
                    <option value="+92"> +92(PK)</option>
                    <option value="+1"> +1(USA)</option>
                    <option value="+44">+44(UK)</option>
                    {/* ✅ Add more country codes here as needed */}
                  </select>
                </div>

                {/* Phone Number Input */}
                <div className="input-container phone-number">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" placeholder="Enter your number" value={signUpData.phone} onChange={onPhoneChange} required />
                </div>
              </div>
            </>
          )}

          {currState === "Login" && (
            <>

              {/* Google Login Button */}
              <div className="google-login-container">
              
                <button id="no">
                  <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google Icon" />
                  Continue with Google
                </button>
              </div>
              {/* Divider Line with "or" */}
              <div className="divider">
                <span>or</span>
              </div>
              <div className="input-container">
                <label htmlFor="loginEmail">Email</label>
                <input type="email" id="loginEmail" placeholder="Required" name="email" value={loginData.email} onChange={onLoginChange} required />
              </div>
              <div className="input-container">
                <label htmlFor="loginPassword">Password</label>
                <input type="password" id="loginPassword" name="password" placeholder="Required" value={loginData.password} onChange={onLoginChange} required />
              </div>
            </>
          )}

          {currState === "Verify" && (
            <>
            <div className="input-container">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                placeholder="Enter Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            </>
            
          )}

          <button name="btn"type="submit">
            {currState === "Verify" ? "Verify Account" : currState === "Login" ? "Login" : "Create Account"}
          </button>

          {currState === "Sign Up" && (
            <div className="login-popup-condition">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                By continuing, I agree to the terms of use & privacy policy
              </label>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginSignupPopup;



//-------------------------------------------------------------------------------------------------------------
// import React, { useContext, useState } from "react";
// import "./LoginPopup.css";
// import { assets } from "../../assets/assets";
// import { StoreContext } from "../../context/StoreContext";
// import axios from "axios";

// const LoginSignupPopup = ({ setShowLogin }) => {
//   const { url, setToken } = useContext(StoreContext);
//   const [currState, setCurrState] = useState("Login");
//   const [data, setData] = useState({ name: "", email: "", password: "", verificationCode: "" });

//   const onChangeHandler = (event) => {
//     const { name, value } = event.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const onSubmit = async (event) => {
//     event.preventDefault();

//     if (currState === "Sign Up") {
//       let registerUrl = url + "/api/user/register";
//       try {
//         const response = await axios.post(registerUrl, data);
//         if (response.data.success) {
//           alert("Verification code sent to your email!");
//           setCurrState("Verify"); // ✅ Switch to Verify step
//         } else {
//           alert(response.data.message);
//         }
//       } catch (error) {
//         alert("Something went wrong. Please try again.");
//       }
//     } 
//     else if (currState === "Verify") {
//       let verifyUrl = url + "/api/user/verify";
//       try {
//         const response = await axios.post(verifyUrl, { email: data.email, code: data.verificationCode });
//         if (response.data.success) {
//           alert("Account Verified! You can now log in.");
//           setCurrState("Login"); // ✅ Switch to Login after verification
//           setData({ name: "", email: "", password: "", verificationCode: "" });
//         } else {
//           alert(response.data.message);
//         }
//       } catch (error) {
//         alert("Verification failed. Please try again.");
//       }
//     } 
//     else {
//       let loginUrl = url + "/api/user/login";
//       try {
//         const response = await axios.post(loginUrl, data);
//         if (response.data.success) {
//           setToken(response.data.token);
//           localStorage.setItem("token", response.data.token);
//           setShowLogin(false);
//         } else {
//           alert(response.data.message);
//         }
//       } catch (error) {
//         alert("Something went wrong. Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="login-popup">
//       <div className="login-popup-container">
//         <div className="login-popup-title">
//           <h1>{currState === "Verify" ? "Email Verification" : "Sign in or Sign up"}</h1>
//           <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
//         </div>

//         {currState !== "Verify" && (
//           <div className="custom-toggle">
//             <button className={currState === "Login" ? "active" : ""} onClick={() => setCurrState("Login")}>
//               Sign In
//             </button>
//             <button className={currState === "Sign Up" ? "active" : ""} onClick={() => setCurrState("Sign Up")}>
//               Sign Up
//             </button>
//           </div>
//         )}

//         <form onSubmit={onSubmit} className="login-popup-inputs">
//           {currState === "Sign Up" && (
//             <div className="input-container">
//               <label htmlFor="name">Name</label>
//               <input type="text" id="name" name="name" placeholder="Your Name" value={data.name} onChange={onChangeHandler} required />
//             </div>
//           )}

//           {currState !== "Verify" && (
//             <>
//               <div className="input-container">
//                 <label htmlFor="email">Email</label>
//                 <input type="email" id="email" placeholder="Required" name="email" value={data.email} onChange={onChangeHandler} required />
//               </div>
//               <div className="input-container">
//                 <label htmlFor="password">Password</label>
//                 <input type="password" id="password" name="password" placeholder="Required" value={data.password} onChange={onChangeHandler} required />
//               </div>
//             </>
//           )}

//           {currState === "Verify" && (
//             <div className="input-container">
//               <label htmlFor="verificationCode">Verification Code</label>
//               <input
//                 type="text"
//                 id="verificationCode"
//                 name="verificationCode"
//                 placeholder="Enter Code"
//                 value={data.verificationCode}
//                 onChange={onChangeHandler}
//                 required
//               />
//             </div>
//           )}

//           <button type="submit">
//             {currState === "Verify" ? "Verify Account" : currState === "Login" ? "Login" : "Create Account"}
//           </button>
//         </form>

//         <div className="login-popup-condition">
//           <input type="checkbox" required />
//           <p>By continuing, I agree to the terms of use & privacy policy</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginSignupPopup;
//----------------------------------------------------------------------------------------------------------------


// const LoginSignup = ({ setShowLogin }) => {
//   const [isLogin, setIsLogin] = useState(true); // true = Login, false = Sign Up
//   const [data, setData] = useState({ name: "", email: "", password: "" });

//   const onChangeHandler = (event) => {
//     const { name, value } = event.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const onSubmit = async (event) => {
//     event.preventDefault();
//     const endpoint = isLogin ? "/api/user/login" : "/api/user/register";
    
//     try {
//       const response = await axios.post(endpoint, data);
//       if (response.data.success) {
//         alert(isLogin ? "Successfully logged in!" : "Successfully registered! Please log in.");
//         if (isLogin) {
//           localStorage.setItem("token", response.data.token);
//           setShowLogin(false);
//         } else {
//           setIsLogin(true);
//           setData({ name: "", email: "", password: "" });
//         }
//       } else {
//         alert(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Something went wrong. Please try again later.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-5 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
//       <div className="flex space-x-2 mb-4">
//         <button
//           className={`px-4 py-2 rounded-l-lg ${isLogin ? "bg-black text-white" : "bg-gray-200"}`}
//           onClick={() => setIsLogin(true)}
//         >
//           Sign In
//         </button>
//         <button
//           className={`px-4 py-2 rounded-r-lg ${!isLogin ? "bg-black text-white" : "bg-gray-200"}`}
//           onClick={() => setIsLogin(false)}
//         >
//           Sign Up
//         </button>
//       </div>

//       <form onSubmit={onSubmit} className="w-full">
//         {!isLogin && (
//           <input
//             name="name"
//             value={data.name}
//             onChange={onChangeHandler}
//             type="text"
//             placeholder="Your name"
//             className="w-full p-2 mb-2 border rounded"
//             required
//           />
//         )}
//         <input
//           name="email"
//           value={data.email}
//           onChange={onChangeHandler}
//           type="email"
//           placeholder="Your email"
//           className="w-full p-2 mb-2 border rounded"
//           required
//         />
//         <input
//           name="password"
//           value={data.password}
//           onChange={onChangeHandler}
//           type="password"
//           placeholder="Password"
//           className="w-full p-2 mb-2 border rounded"
//           required
//         />
//         <button type="submit" className="w-full py-2 mt-2 bg-red-500 text-white rounded">
//           {isLogin ? "Login" : "Create Account"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default LoginSignup;
//---------------------------------------------------------------------------------------------------------------

// const LoginPopup = ({setShowLogin}) => {

//   const {url,setToken}=useContext(StoreContext)


//   const [currState,setCurrState]=useState("Login")

//   const [data,setData]=useState({
//     name:"",
//     email:"",
//     password:""
//   })


  // const onChangeHandler=(event)=>{
  //   const name= event.target.name;
  //   const value=event.target.value;
  //   setData(data=>({...data,[name]:value}))
  // }


  // const onLogin=async(event)=>{
  //   event.preventDefault();
  //   let newurl=url;
  //   if (currState==="Login") {
  //     newurl+="/api/user/login"
      
  //   }
  //   else{
  //     newurl+="/api/user/register"
  //   }

  //   const response= await axios.post(newurl,data)

  //   if(response.data.success){
  //     setToken(response.data.token);
  //     localStorage.setItem("token",response.data.token);
  //     setShowLogin(false)
  //   }
  //   else{
  //     alert(response.data.message)
  //   }




  // }

  // const onLogin = async (event) => {
  //   event.preventDefault();
  //   let newurl = url;
  
  //   // Decide the API endpoint based on the current state (Login or Sign Up)
  //   if (currState === "Login") {
  //     newurl += "/api/user/login";
  //   } else {
  //     newurl += "/api/user/register";
  //   }
  
  //   try {
  //     const response = await axios.post(newurl, data);
  
  //     if (response.data.success) {
  //       if (currState === "Sign Up") {
  //         // For Sign Up: Show success message and switch to Login
  //         alert("Successfully registered! Please log in.");
  //         setCurrState("Login");
  //       } else {
  //         // For Login: Set the token, close the popup
  //         alert("Successfully registered! Please log in.");
  //         setToken(response.data.token);
  //         localStorage.setItem("token", response.data.token);
  //         setShowLogin(false);
  //       }
  //     } else {
  //       // Show error message
  //       alert(response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during login/register:", error);
  //     alert("Something went wrong. Please try again later.");
  //   }
  // };
  


//   return (
//     <div className='login-popup'>
//       <form onSubmit={onLogin}  className='login-popup-container'>
//         <div className="login-popup-title">
//           <h2>{currState}</h2>
//           <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
//         </div>
//         <div className="login-popup-inputs">
//           {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
        
//           <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
//           <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='password' required />
//         </div>
//         <button type='submit'>{currState==="Sign Up"? "Create account" :"Login"}</button>
//         <div className="login-popup-condition">
//           <input type="checkbox" required />
//           <p>By continuing, i agree to the terms of use & privacy policy</p>
//         </div>
//         {currState==="Login"
//         ?<p>Create a new account? <span  onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
//         :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
//         }
        
        
//       </form>
//     </div>
//   )
// }

// export default LoginPopup
//--------------------------------------------------------------------------------------------------------------

// const LoginPopup = ({ setShowLogin }) => {
//   const { url, setToken } = useContext(StoreContext);

//   const [currState, setCurrState] = useState("Login");
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const onChangeHandler = (event) => {
//     const { name, value } = event.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const onLogin = async (event) => {
//     event.preventDefault();
//     let newurl = url;
  
//     // Decide the API endpoint based on the current state (Login or Sign Up)
//     if (currState === "Login") {
//       newurl += "/api/user/login";
//     } else {
//       newurl += "/api/user/register";
//     }
  
//     try {
//       const response = await axios.post(newurl, data);
  
//       if (response.data.success) {
//         if (currState === "Sign Up") {
//           // For Sign Up: Show success message, then hide login page
//           alert("Successfully registered! Please log in.");
//           setShowLogin(false);  // Close the registration page after success
//         } else {
//           // For Login: Set the token, close the popup
//           alert("Successfully logged in!");
//           setToken(response.data.token);
//           localStorage.setItem("token", response.data.token);
//           setShowLogin(false); // Close the login popup
//         }
//       } else {
//         // Show error message
//         alert(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error during login/register:", error);
//       alert("Something went wrong. Please try again later.");
//     }
//   };
  
  
//   return (
//     <div className="login-popup">
//       <form onSubmit={onLogin} className="login-popup-container">
//         <div className="login-popup-title">
//           <h2>{currState}</h2>
//           <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
//         </div>
//         <div className="login-popup-inputs">
//           {currState === "Login" ? null : (
//             <input
//               name="name"
//               onChange={onChangeHandler}
//               value={data.name}
//               type="text"
//               placeholder="Your name"
//               required
//             />
//           )}
//           <input
//             name="email"
//             onChange={onChangeHandler}
//             value={data.email}
//             type="email"
//             placeholder="Your email"
//             required
//           />
//           <input
//             name="password"
//             onChange={onChangeHandler}
//             value={data.password}
//             type="password"
//             placeholder="Password"
//             required
//           />
//         </div>
//         <button type="submit">{currState === "Sign Up" ? "Create account" : "Login"}</button>
//         <div className="login-popup-condition">
//           <input type="checkbox" required />
//           <p>By continuing, I agree to the terms of use & privacy policy</p>
//         </div>
//         {currState === "Login" ? (
//           <p>
//             Create a new account?{" "}
//             <span
//               onClick={() => {
//                 setCurrState("Sign Up");
//                 setData({ name: "", email: "", password: "" }); // Reset fields when switching to Sign Up
//               }}
//             >
//               Click here
//             </span>
//           </p>
//         ) : (
//           <p>
//             Already have an account?{" "}
//             <span
//               onClick={() => {
//                 setCurrState("Login");
//                 setData({ name: "", email: "", password: "" }); // Reset fields when switching to Login
//               }}
//             >
//               Login here
//             </span>
//           </p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default LoginPopup