export interface UploadResponse {
    id: string;
    name: string;
    status: string;
}

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: Date.now().toString(),
        name: file.name,
        status: 'На подписании'
    };
};

export const getDocuments = async (): Promise<UploadResponse[]> => {
    return [
        { id: '1', name: 'Пример документа.docx', status: 'На подписании' }
    ];
};