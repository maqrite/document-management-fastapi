// сервисный файл для работы с API документов
export interface Document {
    id: number;
    original_filename: string;
    upload_date: string;
    is_signed: boolean;
    owner: {
        email: string;
        full_name: string | null;
        id: number;
        is_active: boolean;
    };
}

export interface FileUser {
    user_id: string;
    email: string;
    full_name: string;
    can_view: boolean;
    can_sign: boolean;
}

export async function getFiles(token: string): Promise<Document[]> {
    try {
        const response = await fetch("http://localhost:8000/documents/getDocuments", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data.documents) ? data.documents : [];
    } catch (err) {
        console.error('Error fetching documents:', err);
        return [];
    }
}

export async function addFile(token: string, name: string, file: File): Promise<boolean> {
    try {
        const formData = new FormData();
        formData.append("title", name);
        formData.append("file", file);
        const response = await fetch("http://localhost:8000/documents/addDocument/", {
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

export async function getFile(token: string, fileId: string): Promise<Document | null> {
    try {
        const response = await fetch(`http://localhost:8000/documents/getDocument/${fileId}`, {
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

export async function getFileUsers(token: string, fileId: string): Promise<FileUser[]> {
    try {
        const response = await fetch(`http://localhost:8000/documents/getUsers/${fileId}`, {
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
    token: string,
    fileId: string,
    email: string,
): Promise<boolean> {
    try {
        const requestBody = {
            email: email,
            can_view: true,
            can_sign: true,
        };
        const response = await fetch(`http://localhost:8000/documents/addUser/${fileId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        return response.ok;
    } catch (err) {
        console.error('Error adding user to file:', err);
        return false;
    }
}

export async function deleteFile(token: string, fileId: string): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:8000/documents/deleteDocument/${fileId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.ok;
    } catch (err) {
        console.error('Error deleting file:', err);
        return false;
    }
}

export async function replaceFile(token: string, fileId: string, file: File): Promise<boolean> {
    try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`http://localhost:8000/documents/replaceDocument/${fileId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });
        return response.ok;
    } catch (err) {
        console.error('Error replacing file:', err);
        return false;
    }
}

export async function signFile(token: string, fileId: string): Promise<boolean> {
    const body = JSON.stringify({ comments: "Signed from frontend" });

    console.log("Sending request body:", body);

    try {
        const response = await fetch(`http://localhost:8000/documents/signDocument/${fileId}/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body,
        });

        const result = await response.json();
        console.log("Response JSON:", result);

        return response.ok;
    } catch (err) {
        console.error('Error signing file:', err);
        return false;
    }
}
