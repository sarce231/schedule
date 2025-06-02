import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LoginPage = () => {
  const { login } = useAuth(); // Ambil fungsi login dari context
  const navigate = useNavigate(); // Untuk pindah halaman

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      }, {
        withCredentials: true,
      });
  
      const userData = response.data;
  
      // Simpan token dan nama user ke localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userInfo', JSON.stringify({ name: userData.name }));
  
      // Simpan ke context jika perlu
      login(userData);
  
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError('Login gagal. Email atau password salah.');
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-center text-gray-700">Welcome Back</h2>
          <p className="text-center text-sm text-gray-500 mt-2">
            Silakan login untuk melanjutkan
          </p>

          {error && (
            <p className="text-center text-red-500 text-sm mt-4">{error}</p>
          )}

          <form className="mt-6" onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
