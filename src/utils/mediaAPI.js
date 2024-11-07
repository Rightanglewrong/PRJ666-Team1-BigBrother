const BACKEND_URL = "https://big-brother-be-3d6ad173758c.herokuapp.com/";

// API call to fetch media by location ID
export const fetchMediaByLocationID = async (locationID) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${BACKEND_URL}v1/media/by-location/${locationID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching media by location: ${response.statusText}`);
        }

        const data = await response.json();
        return data.mediaEntries; // mediaEntries now contains metadata including mediaID
    } catch (error) {
        console.error('Error fetching media by location ID:', error);
        throw error;
    }
};

// API call to paginate the media entries and use pre-signed URLs for the images
export const fetchPaginatedMedia = async (mediaEntries, page) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${BACKEND_URL}v1/media/paginated-media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mediaEntries,
                page,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching paginated media: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Return media files with pre-signed URLs or base64 strings
        return data.mediaFiles.map(file => ({
            ...file,
            url: file.FileData || file.presignedUrl, // FileData as base64 or presigned URL
        }));
    } catch (error) {
        console.error('Error fetching paginated media:', error);
        throw error;
    }
};

// Main function to handle both calls in sequence
export const getPaginatedMediaByLocation = async (locationID, page) => {
    try {
        // Step 1: Fetch all media entries by location ID
        const mediaEntries = await fetchMediaByLocationID(locationID);

        // Step 2: Fetch paginated media with pre-signed URLs based on the entries and page number
        const paginatedMedia = await fetchPaginatedMedia(mediaEntries, page);

        return paginatedMedia;
    } catch (error) {
        console.error('Error fetching paginated media by location:', error);
        throw error;
    }
};
