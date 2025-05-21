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

export async function getFiles(): Promise<Document[]> {
    console.log(`Getting files for user`);
    try {
        console.log("Sending getting files request");
        const response = await fetch("http://localhost:8000/documents/getDocuments", {
            method: "GET",
            headers: {},
        });

        console.log("Response status:", response.status);

        if (!response.ok) return [];
        const data = await response.json();

        console.log("Response data:", data);

        return data
    } catch (err) {
        console.error('Error fetching documents:', err);
        return [];
    }
}

export async function addFile(file: File): Promise<boolean> {
    console.log(`Adding files for user`);
    try {
        const formData = new FormData();
        formData.append("file", file);
        console.log("Sending add file request");
        const response = await fetch("http://localhost:8000/documents/addDocument", {
            method: "POST",
            headers: {},
            body: formData,
        });

        console.log("Response status:", response.status);

        return response.ok;
    } catch (err) {
        console.error('Error uploading file:', err);
        return false;
    }
}

export async function getFile(fileId: string): Promise<Document | null> {
    console.log(`Getting file for user`);
    try {
        console.log("Sending getting file request");
        const response = await fetch(`http://localhost:8000/documents/getDocument/${fileId}`, {
            method: "GET",
            headers: {},
        });

        console.log("Response status:", response.status);

        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.error('Error fetching file:', err);
        return null;
    }
}

export async function getFileUsers(fileId: string): Promise<FileUser[]> {
    console.log(`Getting users for file`);
    try {
        console.log("Sending getting users request");
        const response = await fetch(`http://localhost:8000/documents/getUsers/${fileId}`, {
            method: "GET",
            headers: {},
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
    fileId: string,
    email: string,
): Promise<boolean> {
    console.log(`Adding users for file`);
    try {
        console.log("Sending adding users request");
        const response = await fetch(`http://localhost:8000/documents/addUser/${fileId}`, {
            method: "POST",
            headers: {
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
