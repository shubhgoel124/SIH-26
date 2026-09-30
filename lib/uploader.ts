import axios from 'axios';

export const uploader = async (file: File | undefined, folder: string = 'uploads'): Promise<{ url: string; publicId: string } | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
        const res = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 2 minute timeout for large files
        });

        if (res.status !== 200 || !res.data.url) {
            console.error('upload failed', res.statusText);
            return null;
        }

        console.log('upload done', res.data.url);
        return { url: res.data.url, publicId: res.data.publicId };
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            throw new Error('Upload timed out. Please try with a smaller file.');
        }
        throw error;
    }
}