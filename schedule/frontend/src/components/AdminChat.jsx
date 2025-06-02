import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);

  const senderName = localStorage.getItem('userName') || 'Admin';

  useEffect(() => {
    // Inisialisasi socket
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server (Admin):', socketRef.current.id);
    });

    // Ambil pesan dari database saat pertama kali load
    fetch('http://localhost:5000/api/chats')
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => {
        console.error('Gagal mengambil daftar chat:', err);
      });

    // Terima pesan baru dari socket
    socketRef.current.on('newMessage', (data) => {
      console.log('New message received (Admin):', data);
      setMessages((prevMessages) => [...prevMessages, data]);

      if (data.sender === 'user') {
        setHasNewMessage(true);
        setCurrentUserId(data.userId);
      }
    });

    // Tangani pesan yang dihapus
    socketRef.current.on('deletedMessage', (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socketRef.current.disconnect();
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

  const sendReply = () => {
    if (!reply.trim()) return;

    const message = {
      _id: Date.now().toString(), // Beri _id manual agar bisa dihapus
      sender: 'admin',
      userName: senderName,
      text: reply,
      timestamp: new Date().toISOString(),
      userId: currentUserId,
    };

    socketRef.current.emit('sendMessage', message);
    setReply('');
    setHasNewMessage(false);
  };

  const deleteMessage = (messageId) => {
    socketRef.current.emit('deleteMessage', { messageId });
  };

  return (
    <div>
      <h3>
        Chat dengan User{' '}
        {hasNewMessage && <span style={{ color: 'red' }}>🔴 Pesan baru</span>}
      </h3>

      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        style={{
          height: 300,
          overflowY: 'auto',
          border: '1px solid gray',
          padding: '10px',
          marginTop: '10px',
        }}
      >
        {messages.map((message) => (
          <div
            key={message._id}
            style={{
              marginBottom: '10px',
              textAlign: message.sender === 'admin' ? 'right' : 'left',
            }}
          >
            <p>
              <strong>
                {message.userName ||
                  (message.sender === 'admin' ? 'Admin' : 'User')}
              </strong>
              : {message.text}
            </p>
            <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
            {message.sender === 'admin' && (
              <button
                onClick={() => deleteMessage(message._id)}
                style={{
                  marginLeft: '10px',
                  padding: '5px',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Hapus
              </button>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Balas komentar..."
        style={{ width: '100%', padding: '10px', marginTop: '10px' }}
      />
      <button onClick={sendReply} style={{ padding: '10px', marginTop: '10px' }}>
        Balas
      </button>
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