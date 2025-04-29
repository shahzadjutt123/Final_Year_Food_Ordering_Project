import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Remove axios import
import './ChatBotFun.css';
import { FaComments } from "react-icons/fa";

const Chatbot = () => {
    const [query, setQuery] = useState("");
    const [responseMessages, setResponseMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false); // State to track processing

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
        }
    }, [isOpen]);

    useEffect(() => {
        // Scroll to the bottom of the chat container when a new message arrives
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [responseMessages]); // Scroll when a new message is added

    const sendQuery = async () => {
        if (query.trim() === "" || isProcessing) return;
    
        setIsProcessing(true);
        const userMessage = query;
        setQuery("");
    
        // Add user's message
        setResponseMessages((prevMessages) => [
            ...prevMessages,
            { text: userMessage, sender: "user" },
        ]);
    
        // Add loading placeholder for bot response
        const loadingMessage = { sender: "bot", text: "", loading: true };
        setResponseMessages((prevMessages) => [...prevMessages, loadingMessage]);
    
        try {
            // 1. Get chatbot response
            const res = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: userMessage }),
            });
    
            const data = await res.json();
            const botMessage = data.response;
    
            // 2. Update frontend response
            setResponseMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = { text: botMessage, sender: "bot" };
                return updatedMessages;
            });
    
            // 3. Save chat to DB via axios
            const token = localStorage.getItem("token");
            if (token) {
                await axios.post("http://localhost:4000/api/chathistory/save", {
                    userMessage,
                    botMessage,
                }, {
                    headers: {
                        token,
                    },
                });
            }
    
        } catch (error) {
            console.error("Error:", error);
            setResponseMessages((prevMessages) => {
                const updatedMessages = [...prevMessages];
                updatedMessages[updatedMessages.length - 1] = {
                    text: "Sorry, I encountered an error.",
                    sender: "bot",
                    error: true
                };
                return updatedMessages;
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    
    
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !isProcessing) {
            sendQuery();
        }
    };


useEffect(() => {
    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem("token");
    
            const res = await axios.post(
                "http://localhost:4000/api/chathistory/get",
                {}, // empty body
                {
                    headers: {
                        token
                    }
                }
            );
            
    
            const history = res.data.chatMessages || [];
    
            const formattedMessages = history.map(msg => ({
                text: msg.text,
                sender: msg.sender,
                time: msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""
            }));
    
            setResponseMessages(formattedMessages);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    };
    

    if (isOpen) {
        fetchChatHistory();
    }
}, [isOpen]); // Only fetch when chat is opened


    return (
        <div>
            {!isOpen && (
                <button className="chatbot-button" onClick={() => setIsOpen(true)}>
                    <FaComments />
                </button>
            )}
            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <span className="chat-title">AI Powered Food Ordering Chatbot</span>
                        <button className="close-chat" onClick={() => setIsOpen(false)}>✖</button>
                    </div>
                    <hr /> {/* Divider Line */}
                    <div className="chat-messages-container" ref={chatContainerRef}>
                        {responseMessages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                <span className="sender-label">
                                    {message.sender === 'user' ? 'User: ' : 'Model: '}
                                </span>
                                {message.loading ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    <>
                                    {message.text}
                                    &nbsp;&nbsp;&nbsp;
                                    <div className="timestamp">{message.time}</div> {/* Styled with smaller font */}
                                </>
                                )}
                            </div>
                        ))}

                    </div>
                    <div className="chat-input-container">
                        <textarea
                            className="chat-input"
                            placeholder="Type your message..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isProcessing} // Disable textarea while processing
                        />
                        <button
                            onClick={sendQuery}
                            className="send-button"
                            disabled={isProcessing} // Disable button while processing
                        >
                            {isProcessing ? 'Processing...' : '🚀'} {/* Change button text */}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;