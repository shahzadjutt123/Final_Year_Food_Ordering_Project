import './MyOrders.css';
import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import MapComponent from '../../components/MapComponent/MapComponent';

const MyOrders = () => {
    const [data, setData] = useState([]);
    const [showMapIndex, setShowMapIndex] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const { url, token } = useContext(StoreContext);

    const fetchOrders = async () => {
        const response = await axios.post(`${url}/api/order/userorders`, {}, {
            headers: { token }
        });
        setData(response.data.data);
    };

    // Poll rider location every 2 sec when map is open
    useEffect(() => {
        let interval;
        if (showMapIndex !== null && data[showMapIndex]) {
            const orderId = data[showMapIndex]._id;

            const fetchRiderLocation = async () => {
                try {
                    const res = await axios.get(`${url}/api/order/rider-location/${orderId}`);
                    setRiderLocation(res.data.riderLocation);
                } catch (err) {
                    console.error("Failed to fetch rider location", err);
                }
            };

            fetchRiderLocation(); // fetch immediately
            interval = setInterval(fetchRiderLocation, 2000); // poll every 2 sec
        }

        return () => clearInterval(interval);
    }, [showMapIndex, data, url]);

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    return (
        <div>
            <div className="my-orders">
                <h2>My Orders</h2>
                <div className="container">
                    {data.map((order, index) => {
                        return (
                            <div key={index} className='my-orders-order'>
                                <img src={assets.parcel_icon} alt="" />
                                <p>
                                <p>
    {order.items.map((item, idx) => 
        `${item.name} x ${item.quantity}${idx !== order.items.length - 1 ? ", " : ""}`
    )}
</p>

                                </p>
                                <p>${order.amount}.00</p>
                                <p>Items: {order.items.length}</p>
                                <p><span>&#x25cf;</span><b>{order.status}</b></p>

                                <button onClick={() =>
                                    setShowMapIndex(showMapIndex === index ? null : index)
                                }>
                                    Track Order
                                </button>

                                {showMapIndex === index && (
                                    <div className="map-wrapper">
                                        <MapComponent
                                            userLocation={order.location}
                                            riderLocation={order.riderLocation}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;