import { createContext, useEffect, useState } from "react";
// import { food_list } from "../assets/assets";
import axios from "axios"


export const StoreContext = createContext(null)
const StoreContextProvider = (props) => {


    const [cartItems, setCartItems] = useState({});
    const url="http://localhost:4000"
    const [token,setToken]= useState("");
    const [food_list,setFoodList]=useState([])
    const addToCart = async (itemId) => {
        const userId = localStorage.getItem("token");  // Fetch user ID
        if (!userId) return alert("User not logged in");
    
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    };
    
    const removeFromCart = async (itemId) => {
        const userId = localStorage.getItem("token");
        if (!userId) return alert("User not logged in");
    
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    
        if (token) {
            await axios.post(url + "/api/cart/remove", { userId, itemId }, { headers: { token } });
        }
    };
    

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {

            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }


        }
        return totalAmount;
    }

    const fetchFoodList= async()=>{
        const response = await axios.get(url+"/api/food/list");
        setFoodList(response.data.data)
    }


    const loadCartData= async(token)=>{
        const response=await axios.post (url+"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }

    useEffect(() => {
        async function initialLoad() {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                await loadCartData(storedToken);
            }
        }
    
        initialLoad();
    
        const interval = setInterval(async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                await loadCartData(storedToken); // reload cart every 2 sec
            }
        }, 5000); // every 2 seconds
    
        return () => clearInterval(interval); // cleanup when component unmounts
    }, []);
    


    useEffect(()=>{
        console.log(cartItems);
    },[cartItems])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}
export default StoreContextProvider;