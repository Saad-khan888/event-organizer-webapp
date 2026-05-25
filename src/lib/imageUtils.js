// Helper for image handling with backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BASE_URL = API_URL.replace('/api', '');

console.log('🔧 imageUtils config:', { API_URL, BASE_URL });

export const getImageUrl = (bucket = 'avatars', filename) => {
  if (!filename) {
    console.log('🖼️ Image URL: No filename provided');
    return null;
  }
  
  // If it's already a full URL (Cloudinary or external)
  if (filename.startsWith('http') || filename.startsWith('data:')) {
    console.log('🖼️ Image URL: Using external URL:', filename);
    return filename;
  }
  
  // If it's already a full path from our backend
  if (filename.startsWith('/uploads/')) {
    const url = `${BASE_URL}${filename}`;
    console.log('🖼️ Image URL (full path):', filename, '→', url);
    return url;
  }
  
  // Construct URL to backend (for local storage)
  const url = `${BASE_URL}/uploads/${bucket}/${filename}`;
  console.log('🖼️ Image URL (constructed):', bucket, filename, '→', url);
  return url;
};
