import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const Media = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ibadah');
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/media`);
      setMediaList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching media');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedLink = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setType(selectedFile.type);
    setPreview(URL.createObjectURL(selectedFile));
    setLink('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!name || (!file && !link)) {
      setError('Nama dan media atau link harus diisi');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);

    if (file) {
      formData.append('media', file);
      formData.append('type', type);
    } else if (link) {
      const embedLink = getYouTubeEmbedLink(link.trim());
      if (!embedLink) {
        setError('Link YouTube tidak valid');
        return;
      }
      formData.append('link', embedLink);
      formData.append('type', 'link');
    }

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/api/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMediaList((prev) => [response.data, ...prev]);
      // Reset
      setName('');
      setFile(null);
      setType('');
      setCategory('ibadah');
      setLink('');
      setPreview(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/media/${id}`);
      setMediaList((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus media');
    }
  };

  const filteredMedia = filter === 'all' ? mediaList : mediaList.filter((m) => m.category === filter);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Media & Dokumentasi</h1>

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow mb-6 border">
        <h2 className="text-xl font-semibold mb-4">Upload Media / Link</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Media"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="ibadah">Ibadah</option>
          <option value="dokumentasi">Dokumentasi</option>
        </select>

        <input
          type="file"
          onChange={handleFileChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setFile(null);
            setPreview(null);
            setType('link');
          }}
          placeholder="Link YouTube (opsional)"
          className="w-full mb-3 p-2 border rounded"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover mx-auto mb-3 rounded shadow"
          />
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="mb-4 flex justify-center gap-4">
        {['all', 'ibadah', 'dokumentasi'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded ${
              filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMedia.length > 0 ? (
          filteredMedia.map((media) => {
            const isYouTube = media.link?.includes('youtube.com/embed/');
            const mediaUrl = media.url?.startsWith('http') ? media.url : `${API_BASE_URL}${media.url}`;

            return (
              <div key={media._id} className="border p-4 rounded-lg shadow text-center">
                <p className="font-medium text-sm">{media.name}</p>
                <p className="text-xs text-gray-500 mb-2">{media.category}</p>

                {media.link && isYouTube ? (
                  <iframe
                    width="100%"
                    height="200"
                    src={media.link}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={media.name}
                    className="rounded-lg shadow mb-2"
                  ></iframe>
                ) : media.type?.startsWith('image/') ? (
                  <img src={mediaUrl} alt={media.name} className="w-40 h-40 object-cover mx-auto rounded-lg shadow mb-2" />
                ) : media.type?.startsWith('video/') ? (
                  <video controls className="w-40 h-40 mx-auto rounded-lg shadow mb-2">
                    <source src={mediaUrl} type={media.type} />
                  </video>
                ) : (
                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Lihat File
                  </a>
                )}

                <div className="flex justify-center gap-4 mt-2">
                  <a
                    href={media.link || mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Lihat
                  </a>
                  <button
                    onClick={() => handleDelete(media._id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-500">Tidak ada media tersedia</p>
        )}
      </div>
    </div>
  );
};

export default Media;
