import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);

  const senderName = localStorage.getItem('userName') || 'Admin';

  useEffect(() => {
    // Inisialisasi socket dengan retry mechanism
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
        console.log('Connected to socket server (Admin):', socket.id);
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

      // Terima pesan baru dari socket
      socket.on('newMessage', (data) => {
        console.log('New message received (Admin):', data);
        setMessages((prevMessages) => [...prevMessages, data]);

        if (data.sender === 'user') {
          setHasNewMessage(true);
          setCurrentUserId(data.userId);
        }
      });

      // Tangani pesan yang dihapus
      socket.on('deletedMessage', (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });
    };

    connectSocket();

    // Ambil pesan dari database saat pertama kali load
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats');
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Gagal mengambil daftar chat:', err);
        setError('Gagal memuat pesan dari server');
      }
    };

    fetchMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    const isAtBottom =
      chatBoxRef.current.scrollHeight ===
      chatBoxRef.current.scrollTop + chatBoxRef.current.clientHeight;
    if (isAtBottom) {
      setHasNewMessage(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    if (!isConnected) {
      setError('Tidak terhubung ke server chat');
      return;
    }

    try {
      const message = {
        _id: Date.now().toString(),
        sender: 'admin',
        userName: senderName,
        text: reply,
        timestamp: new Date().toISOString(),
        userId: currentUserId,
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

      setReply('');
      setHasNewMessage(false);
      setError(null);
    } catch (error) {
      console.error('Gagal mengirim balasan:', error);
      setError('Gagal mengirim balasan. Silakan coba lagi.');
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
      <h3 className="text-xl font-semibold mb-4">
        Chat dengan User{' '}
        {hasNewMessage && (
          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            🔴 Pesan baru
          </span>
        )}
      </h3>

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
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50"
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${
              message.sender === 'admin' ? 'text-right' : 'text-left'
            }`}
          >
            <p className="font-semibold">
              {message.userName || (message.sender === 'admin' ? 'Admin' : 'User')}
            </p>
            <p className="text-gray-700">{message.text}</p>
            <small className="text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
            {message.sender === 'admin' && (
              <button
                onClick={() => deleteMessage(message._id)}
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Hapus
              </button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Balas komentar..."
          className="flex-1 p-2 border rounded"
          disabled={!isConnected}
        />
        <button
          onClick={sendReply}
          className={`px-4 py-2 rounded ${
            isConnected
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isConnected}
        >
          Balas
        </button>
      </div>
    </div>
  );
};

export default AdminChat;


  //  {/* Jadwal Section */}
  //     <section id="jadwal" className="bg-gray-100 py-16 px-6 text-center">
  //       <h2 className="text-3xl font-bold mb-8">Jadwal Ibadah</h2>
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center items-start max-w-4xl mx-auto">
  //         {jadwal.map((item) => (
  //           <div key={item._id} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition">
  //             <div className="flex items-center mb-3 text-indigo-600 font-bold text-lg">
  //               <FaChurch className="mr-2" />
  //               {item.place}
  //             </div>
  //             <div className="text-sm text-gray-600 flex items-center mb-1">
  //               <FaCalendarAlt className="mr-2 text-gray-500" />
  //               <span>Tanggal: {formatDate(item.date)}</span>
  //             </div>
  //             <div className="text-sm text-gray-600 flex items-center mb-1">
  //               <FaMapMarkerAlt className="mr-2 text-gray-500" />
  //               <span>Lokasi: {item.location}</span>
  //             </div>
  //             <div className="text-sm text-gray-600 flex items-center">
  //               <FaBible className="mr-2 text-gray-500" />
  //               <span>Pelayan Firman: {item.preacher || "-"}</span>
  //             </div>
  //             <div className="text-sm text-gray-600 flex items-center mb-1">
  //               <FaUserAlt className="mr-2 text-gray-500" />
  //               <span>WL: {item.wl}</span>
  //             </div>
  //             <div className="text-sm text-gray-600 flex items-center">
  //               <FaGamepad className="mr-2 text-gray-500" />
  //               <span>Permainan: {item.gamesLeader}</span>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </section>

  //  {/* Kartu Pelayanan Optimal */}
  //         <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  //           <FaCheckCircle className="text-blue-500 text-5xl mx-auto mb-4" />
  //           <h3 className="text-xl font-semibold mb-2">Pelayanan Optimal</h3>
  //           <p className="text-gray-600 dark:text-gray-300">
  //             Kami siap melayani kebutuhan ibadah Anda.
  //           </p>
  //         </div>