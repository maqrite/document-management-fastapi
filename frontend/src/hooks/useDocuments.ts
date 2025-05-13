import { useState } from 'react';
import axios from 'axios';

type Document = {
    id: string;
    name: string;
    status: 'pending' | 'signed';
    fileType: string;
    owner: string;
    signers: string[];
};

export default function useDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);

    const uploadDocument = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setDocuments([...documents, response.data]);
        return response.data;
    };

    const signDocument = async (docId: string) => {
        await axios.post(`/api/documents/${docId}/sign`);
        setDocuments(documents.map(doc =>
            doc.id === docId ? { ...doc, status: 'signed' } : doc
        ));
    };

    return { documents, uploadDocument, signDocument };
}