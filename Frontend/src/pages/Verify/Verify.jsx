import React, { useContext, useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';  // ✅ Toast import
import 'react-toastify/dist/ReactToastify.css';  // ✅ Toast styles import

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            const response = await axios.post(url + "/api/order/verify", { success, orderId });
            if (response.data.success) {
                toast.success("Payment Successful! Redirecting to My Orders...", {
                    position: "top-right",
                    autoClose: 3000, // ✅ 3 seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    navigate("/myorders");
                }, 3000); // ✅ 3-second delay before redirecting
            } else {
                toast.error("Payment Failed! Redirecting to Home...", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            }
        } catch (error) {
            toast.error("Something went wrong! Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            setTimeout(() => {
                navigate("/");
            }, 3000);
        }
    };

    useEffect(() => {
        verifyPayment();
    }, []);

    return (
        <div className='verify'>
            <div className='spinner'></div>
        </div>
    );
};

export default Verify;






// import React, { useContext, useEffect } from 'react'
// import './Verify.css'

// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { StoreContext } from '../../context/StoreContext';
// import axios from 'axios';
// const Verify = () => {

//     const [searchParams,setSearchParams]= useSearchParams();
//     const success=searchParams.get("success")
//     const orderId = searchParams.get("orderId")
//     const {url}= useContext(StoreContext);
//     const navigate= useNavigate();

//     const verifyPayment= async()=>{
//         const response = await axios.post(url+"/api/order/verify",{success,orderId});
//         if(response.data.success){
//             navigate("/myorders");
//         }
//         else{
//             navigate("/")
//         }
//     }
//     useEffect(()=>{
//         verifyPayment();
//     },[])
//   return (
//     <div className='verify'>
//     <div className='spinner'></div>
//     </div>
//   )
// }

// export default Verify;
