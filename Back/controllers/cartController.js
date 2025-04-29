import userModel from "../models/userModel.js"


const addToCartFromChatbot = async (req, res) => {
    try {
       
        const {userId, itemId, quantity } = req.body;

        if (!userId|| !itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "User ID, Item ID, and Quantity are required",
            });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};
        cartData[itemId] = (cartData[itemId] || 0) + quantity;

        userData = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true }
        );

        res.json({
            success: true,
            message: "Item(s) added to cart via chatbot",
            cartData: userData.cartData,
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Error adding to cart" });
    }
};

const removeFromCartThroughChatbot = async (req, res) => {
    try {
        const { userId, itemId, quantity } = req.body;

        if (!userId || !itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "User ID, Item ID, and Quantity are required",
            });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};

        // Check if item exists and quantity is sufficient
        if (!cartData[itemId]) {
            return res.status(400).json({
                success: false,
                message: "❌ Item not found in cart",
            });
        }

        if (cartData[itemId] < quantity) {
            return res.status(400).json({
                success: false,
                message: `❌ You only have ${cartData[itemId]} of this item in your cart.`,
            });
        }

        // Subtract the quantity or remove if quantity becomes 0
        cartData[itemId] -= quantity;
        if (cartData[itemId] === 0) {
            delete cartData[itemId];
        }

        // Update cart in DB
        userData = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true }
        );

        return res.json({
            success: true,
            message: "✅ Item(s) removed from cart via chatbot",
            cartData: userData.cartData,
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Error removing from cart" });
    }
};


// add items to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body; // Extract userId & itemId
        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: "User ID and Item ID required" });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};  // Ensure cartData is an object
        cartData[itemId] = (cartData[itemId] || 0) + 1; // Increment item count

        // Update database & return updated cart
        userData = await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
        res.json({ success: true, message: "Added to Cart", cartData: userData.cartData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error adding to cart" });
    }
};


// remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: "User ID and Item ID required" });
        }

        let userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};  // Ensure cartData is an object
        if (cartData[itemId] && cartData[itemId] > 0) {
            cartData[itemId] -= 1; // Decrease count
            if (cartData[itemId] === 0) {
                delete cartData[itemId]; // Remove item if count reaches 0
            }
        }

        // Update database & return updated cart
        userData = await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
        res.json({ success: true, message: "Removed from Cart", cartData: userData.cartData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error removing from cart" });
    }
};

// fetch user cart data
// const getCart =async (req,res)=>{
//     try {
//         let userData= await userModel.findById(req.body.userId);
//         let cartData= await userData.cartData;
//         res.json({success:true,cartData})
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:"Error"})
//     }

// }

const getCart = async (req, res) => {
    try {
        // Validate userId
        if (!req.body.userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Fetch user data
        const userData = await userModel.findById(req.body.userId);

        // Check if user exists
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Access cart data
        const cartData = userData.cartData || [];
        return res.json({ success: true, cartData });

    } catch (error) {
        console.error("Error in getCart:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};



export{addToCart,removeFromCart,getCart,addToCartFromChatbot,removeFromCartThroughChatbot}