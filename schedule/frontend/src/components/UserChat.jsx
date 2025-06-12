import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { FaTrash } from 'react-icons/fa';

const UserChat = ({ onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
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
        setError('Gagal memuat pesan dari server');
      }
    };

    fetchMessages();

    // Setup socket dengan retry mechanism
    const connectSocket = () => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
        setIsConnected(true);
        setError(null);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setError('Gagal terhubung ke server chat');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setError(error.message);
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
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onNewMessage]);

  const sendMessage = async () => {
  if (!msg.trim()) return;
    if (!userName) {
      setError('Nama pengguna diperlukan');
      return;
    }
    if (!isConnected) {
      setError('Tidak terhubung ke server chat');
      return;
    }

    try {
  const message = {
    sender: 'user',
    userName,
    text: msg,
    timestamp: new Date().toISOString(),
    _id: Date.now().toString(),
  };

      // Tambahkan timeout untuk socket emit
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      await Promise.race([
        new Promise((resolve, reject) => {
          socketRef.current.emit('sendMessage', message, (response) => {
            if (response.error) {
              reject(new Error(response.error));
            }
            resolve(response);
          });
        }),
        timeout
      ]);

  setMsg('');
      setError(null);
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!isConnected) {
      setError('Tidak terhubung ke server chat');
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        socketRef.current.emit('deleteMessage', { messageId }, (response) => {
          if (response.error) {
            reject(new Error(response.error));
          }
          resolve(response);
        });
      });
      setError(null);
    } catch (error) {
      console.error('Gagal menghapus pesan:', error);
      setError('Gagal menghapus pesan. Silakan coba lagi.');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Komentar User</h3>
      
      {/* Status Connection */}
      <div className="mb-4">
        <span className={`inline-block px-2 py-1 rounded ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Terhubung' : 'Tidak Terhubung'}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50"
      >
        {messages.map((message, idx) => (
          <div
            key={message._id || 'msg-' + idx}
            className={`mb-2 ${
              message.sender === 'user' ? 'text-left' : 'text-right'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{message.userName}:</p>
                <p className="text-gray-700">{message.text}</p>
                <small className="text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
              {message.sender === 'user' && message.userName === userName && (
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="ml-2 p-1 text-red-500 hover:text-red-700"
                  title="Hapus pesan"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
      <input
        type="text"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Tulis komentar..."
          className="flex-1 p-2 border rounded"
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          className={`px-4 py-2 rounded ${
            isConnected
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isConnected}
        >
        Kirim
      </button>
      </div>
    </div>
  );
};

export default UserChat;
