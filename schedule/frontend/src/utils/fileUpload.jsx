import axios from 'axios';

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const response = await axios.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data; // Return data jika upload berhasil
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error; // Lempar error jika terjadi masalah
  }
};

