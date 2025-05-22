// сервисный файл для работы с API документов
export interface Document {
    id: number;
    original_filename: string;
    upload_date: string;
    size?: number;
    owner: {
      email: string;
      full_name: string | null;
      id: number;
      is_active: boolean;
    };
  }

export interface FileUser {
    id: string;
    email: string;
    name: string;
    access_level: 'view' | 'edit';
}

export async function getFiles(token: string): Promise<Document[]> {
    console.log(`Getting files for user`);
    try {
        console.log("Sending getting files request");
        const response = await fetch("http://localhost:8000/documents/getDocuments", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log("Response status:", response.status);

        if (!response.ok) return [];
        const data = await response.json();

        console.log("Response data:", data);

        return Array.isArray(data.documents) ? data.documents : [];
    } catch (err) {
        console.error('Error fetching documents:', err);
        return [];
    }
}

export async function addFile(token: string, name: string, file: File): Promise<boolean> {
    console.log(`Adding files for user`);
    try {
        const formData = new FormData();
        formData.append("title", name);
        formData.append("file", file);
        console.log("Sending add file request");
        const response = await fetch("http://localhost:8000/documents/addDocument/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        console.log("Response status:", response.status);

        return response.ok;
    } catch (err) {
        console.error('Error uploading file:', err);
        return false;
    }
}

export async function getFile(token: string, fileId: string): Promise<Document | null> {
    console.log(`Getting file for user`);
    try {
        console.log("Sending getting file request");
        const response = await fetch(`http://localhost:8000/documents/getDocument/${fileId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log("Response status:", response.status);

        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.error('Error fetching file:', err);
        return null;
    }
}

export async function getFileUsers(token: string, fileId: string): Promise<FileUser[]> {
    console.log(`Getting users for file`);
    try {
        console.log("Sending getting users request");
        const response = await fetch(`http://localhost:8000/documents/getUsers/${fileId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        console.log("Response status:", response.status);

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
    console.log(`Adding users for file`);
    try {
        console.log("Sending adding users request");
        const response = await fetch(`http://localhost:8000/documents/addUser/${fileId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        console.log("Response status:", response.status);

        return response.ok;
    } catch (err) {
        console.error('Error adding user to file:', err);
        return false;
    }
}
