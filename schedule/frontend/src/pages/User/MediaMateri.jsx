import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000"; // Ganti jika sudah deploy

const MediaMateri = () => {
  const [mediaList, setMediaList] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/media`);
        const data = await resp.json();
        setMediaList(Array.isArray(data) ? data : []);

        await fetch(`${API_BASE_URL}/api/media/mark-read-all`, {
          method: "PATCH",
        });
      } catch (err) {
        console.error("Error fetching media:", err);
      }
    };

    fetchMedia();
  }, []);

  const getYouTubeVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const filteredMedia =
    filter === "all"
      ? mediaList
      : mediaList.filter((media) => media.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
          Media & Dokumentasi
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Daftar media dan dokumentasi yang tersedia.
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-center gap-4 mb-8">
        {["all", "ibadah", "dokumentasi"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded ${
              filter === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {cat === "all"
              ? "Semua"
              : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Media List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredMedia.length > 0 ? (
          filteredMedia.map((media) => {
            const mediaUrl = media.url
              ? media.url.startsWith("http")
                ? media.url
                : `${API_BASE_URL}${media.url}`
              : media.link && media.link.startsWith("http")
              ? media.link
              : "";

            const youTubeId = getYouTubeVideoId(mediaUrl);

            return (
              <div
                key={media._id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center p-2">
                  {youTubeId ? (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${youTubeId}`}
                      title={media.title || media.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : media.type?.startsWith("image/") ? (
                    <img
                      src={mediaUrl}
                      alt={media.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : media.type?.startsWith("video/") ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-48 object-cover rounded"
                    />
                  ) : (
                    <div className="text-gray-600 dark:text-gray-300 text-center">
                      Pratinjau tidak tersedia
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {media.title || media.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm h-16 overflow-hidden">
                    {media.description || "Tidak ada deskripsi"}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow"
                    >
                      Lihat
                    </a>
                    <a
                      href={mediaUrl}
                      download
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg shadow"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300 col-span-full">
            Tidak ada media yang tersedia.
          </p>
        )}
      </div>
    </div>
  );
};

export default MediaMateri;
