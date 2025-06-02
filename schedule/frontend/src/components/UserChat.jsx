import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const UserChat = ({ onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [userName, setUserName] = useState('');
  const socketRef = useRef(null);

  // Helper untuk buat pesan sistem dengan _id unik
  const createSystemMessage = (text) => ({
    _id: 'system-' + Date.now(),
    userName: 'System',
    text,
    timestamp: new Date().toISOString(),
    sender: 'system',
  });

  useEffect(() => {
    // Ambil user info dari localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.name) setUserName(userInfo.name);

    // Fetch initial messages dari backend (REST API)
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats');
        const data = await response.json();

        // Pastikan data.messages adalah array
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        setMessages(
          msgs.length === 0
            ? [createSystemMessage('Belum ada pesan.')]
            : msgs
        );
      } catch (error) {
        console.error('Gagal mengambil pesan dari database:', error);
        setMessages([createSystemMessage('Gagal memuat pesan.')]);
      }
    };

    fetchMessages();

    // Setup socket
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('initialMessages', (data) => {
      if (!Array.isArray(data) || data.length === 0) {
        setMessages([createSystemMessage('Belum ada pesan.')]);
      } else {
        setMessages(data);
      }
    });

    socket.on('newMessage', (data) => {
      setMessages(prev => [...prev, data]);
      if (data.sender === 'admin' && onNewMessage) {
        onNewMessage();
      }
    });

    socket.on('deletedMessage', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewMessage]);

  const sendMessage = () => {
  if (!msg.trim()) return;

  const message = {
    sender: 'user',
    userName,
    text: msg,
    timestamp: new Date().toISOString(),
    _id: Date.now().toString(),
  };

  console.log("Kirim message:", message); // Tambahkan ini
  socketRef.current.emit('sendMessage', message);
  setMsg('');
};


  return (
    <div>
      <h3>Komentar User</h3>
      <div
        style={{ height: 200, overflowY: 'auto', border: '1px solid gray', padding: 10 }}
      >
        {messages.map((message, idx) => (
          <div
            key={message._id || 'msg-' + idx}
            style={{ textAlign: message.sender === 'user' ? 'left' : 'right' }}
          >
            <p><strong>{message.userName}:</strong> {message.text}</p>
            <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Tulis komentar..."
        style={{ width: '100%', padding: '10px', marginTop: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px', marginTop: '10px' }}>
        Kirim
      </button>
    </div>
  );
};

export default UserChat;
