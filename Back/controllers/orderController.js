import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const frontend_url = "http://localhost:5173";

// Move this outside the handler to simulate rider movement globally
const moveRiderCloser = (start, end) => ({
  latitude: start.latitude + (end.latitude - start.latitude) * 0.02,
  longitude: start.longitude + (end.longitude - start.longitude) * 0.02
});

const simulateRiderMovement = async (orderId) => {
  const order = await orderModel.findById(orderId);
  if (!order) return;

  let currentLocation = {
    latitude: order.location.latitude + 0.01,
    longitude: order.location.longitude + 0.01
  };

  const interval = setInterval(async () => {
    const updatedOrder = await orderModel.findById(orderId);
    if (!updatedOrder || updatedOrder.status === 'Delivered') {
      clearInterval(interval);
      return;
    }

    currentLocation = moveRiderCloser(currentLocation, updatedOrder.location);

    await orderModel.findByIdAndUpdate(orderId, {
      riderLocation: currentLocation
    });
  }, 2000);
};

// 🟢 Main placeOrder function
 const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      location: {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
      },
      // 🟡 Set initial rider location near user
      riderLocation: {
        latitude: req.body.location.latitude + 0.01,
        longitude: req.body.location.longitude + 0.01
      }
    });

    await newOrder.save();

    // 🟢 Start simulating rider movement after saving
    simulateRiderMovement(newOrder._id);

    await userModel.findByIdAndUpdate(req.body.userId, {
      $set: { cartData: {} }
    });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "pkr",
        product_data: { name: item.name },
        unit_amount: item.price * 100 * 270
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency: "pkr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 2 * 100 * 270
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};


const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    // console.log("Received Data:", req.body); // Debugging
    try {
        if (success === "true") {
            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                { payment: true },
                // { new: true } // Returns the updated document
            );
            // console.log("Updated Order:", updatedOrder); // Debugging
            res.json({ success: true, message: "Paid" });
        } else {
            const deletedOrder = await orderModel.findByIdAndDelete(orderId);
            // console.log("Deleted Order:", deletedOrder); // Debugging
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.error("Error Occurred:", error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// user orders for frontend
const userOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}
// user orders for admin panel
const listOrders=async(req,res)=>{

    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}


//api for updating order status

const updateStatus = async(req,res)=>{
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}


export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}