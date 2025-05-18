// сервисный файл для работы с API документов
export interface Document {
    id: string;
    name: string;
    size: number;
    uploaded_at: string;
    owner_email: string;
    owner_name: string;
}

export interface FileUser {
    id: string;
    email: string;
    name: string;
    access_level: 'view' | 'edit';
}

export async function getFiles(token: string): Promise<Document[]> {
    try {
        const response = await fetch("/api/documents", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.error('Error fetching documents:', err);
        return [];
    }
}

export async function addFile(file: File, token: string): Promise<boolean> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        return response.ok;
    } catch (err) {
        console.error('Error uploading file:', err);
        return false;
    }
}

export async function getFile(fileId: string, token: string): Promise<Document | null> {
    try {
        const response = await fetch(`/api/documents/${fileId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.error('Error fetching file:', err);
        return null;
    }
}

export async function getFileUsers(fileId: string, token: string): Promise<FileUser[]> {
    try {
        const response = await fetch(`/api/documents/${fileId}/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.error('Error fetching file users:', err);
        return [];
    }
}

export async function addFileUser(
    fileId: string,
    email: string,
    token: string
): Promise<boolean> {
    try {
        const response = await fetch(`/api/documents/${fileId}/users`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        return response.ok;
    } catch (err) {
        console.error('Error adding user to file:', err);
        return false;
    }
}