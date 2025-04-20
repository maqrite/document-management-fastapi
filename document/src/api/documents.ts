import axios from 'axios';

export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};