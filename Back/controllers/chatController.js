import userModel from '../models/userModel.js';

 const saveChating = async (req, res) => {
    try {
        const { userId, userMessage, botMessage } = req.body;

        if (!userId || !userMessage || !botMessage) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        // Add both user and bot messages to chatMessages
        user.chatMessages.push({ sender: 'user', text: userMessage });
        user.chatMessages.push({ sender: 'bot', text: botMessage });

        await user.save();
        res.status(200).json({ success: true, message: 'Chat saved successfully.' });
    } catch (err) {
        console.error('Error saving chat:', err);
        res.status(500).json({ success: false, message: 'Server error while saving chat.' });
    }
};



 const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId).select('chatMessages');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.status(200).json({ success: true, chatMessages: user.chatMessages });
    } catch (err) {
        console.error('Error fetching chat:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching chat.' });
    }
};


export{saveChating,getChatHistory}













// export const getChatHistory = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         const user = await userModel.findById(userId).select('chatMessages');
//         if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//         res.status(200).json({ success: true, chatMessages: user.chatMessages });
//     } catch (err) {
//         console.error('Error fetching chat:', err);
//         res.status(500).json({ success: false, message: 'Server error while fetching chat.' });
//     }
// };