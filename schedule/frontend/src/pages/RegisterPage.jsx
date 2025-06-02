import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
            });

            // Setelah berhasil daftar, bisa redirect ke login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-700">Create Account</h2>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Buat akun untuk memulai
                    </p>

                    {error && (
                        <div className="text-red-500 text-sm text-center my-2">{error}</div>
                    )}

                    <form className="mt-6" onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Nama Anda"
                            />
                        </div>
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
                            />
                        </div>
                        <div className="mb-4">
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
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-3 rounded-lg transition duration-300"
                        >
                            Daftar
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-green-500 hover:text-green-600 font-medium">
                            Login di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
