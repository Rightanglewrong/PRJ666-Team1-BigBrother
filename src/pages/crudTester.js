import { useState } from 'react';
import Image from 'next/image';
import { 
  uploadFileToS3, 
  retrieveFileFromS3, 
  updateFileInS3, 
  deleteFileFromS3 
} from '../utils/api';

export default function CrudTest() {
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState('');
  const [message, setMessage] = useState('');
  const [retrievedFile, setRetrievedFile] = useState(null);
  const [updateFile, setUpdateFile] = useState(null);

  // Handle S3 file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      const data = await uploadFileToS3(file);
      setMessage(`${data.message}, Filekey= ${data.url.split('/').pop()}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle file retrieval
  const handleFileRetrieve = async () => {
    try {
      const { fileUrl, contentType} = await retrieveFileFromS3(fileKey);

      if (contentType.startsWith('image/')) {
        setRetrievedFile({ type: 'image', url: fileUrl, alt: fileKey });
      } else if (contentType.startsWith('video/')) {
        setRetrievedFile({ type: 'video', url: fileUrl });
      } else {
        setRetrievedFile({ type: 'file', url: fileUrl });
      }

      setMessage('File retrieved successfully');
    } catch (error) {
      setMessage('Error retrieving file');
    }
  };

  // Handle file update
  const handleFileUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = await updateFileInS3(fileKey, updateFile);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Handle file deletion
  const handleFileDelete = async () => {
    try {
      const data = await deleteFileFromS3(fileKey);
      setMessage(data.message);
      setFileKey(''); // Clear the file key after deletion
    } catch (error) {
      setMessage('Error deleting file');
    }
  };

  return (
    <div>
      <h1>S3 CRUD Test Page</h1>
      <p>{message}</p>

      {/* S3 Upload Section */}
      <h2>Upload File to S3</h2>
      <form onSubmit={handleFileUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload File</button>
      </form>

      {/* S3 Update Section */}
      <h2>Update File in S3</h2>
      <form onSubmit={handleFileUpdate}>
        <input
          type="file"
          onChange={(e) => setUpdateFile(e.target.files[0])}
        />
        <button type="submit" disabled={!fileKey}>Update File</button>
      </form>

      <h2>Retrieve/Delete File from S3</h2>
      <input
        type="text"
        value={fileKey}
        placeholder="File key (from upload)"
        onChange={(e) => setFileKey(e.target.value)}
      />
      <button onClick={handleFileRetrieve} disabled={!fileKey}>
        Retrieve File
      </button>
      <button onClick={handleFileDelete} disabled={!fileKey}>
        Delete File
      </button>

      {/* Display retrieved file */}
      {retrievedFile && retrievedFile.type === 'image' && (
        <div>
          <h3>Retrieved Image:</h3>
          <Image src={retrievedFile.url} alt={retrievedFile.alt} width={800} height={800} style={{ maxWidth: 'auto', height: 'auto' }} />
        </div>
      )}

      {retrievedFile && retrievedFile.type === 'video' && (
        <div>
          <h3>Retrieved Video:</h3>
          <video src={retrievedFile.url} controls style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}

      {retrievedFile && retrievedFile.type === 'file' && (
        <div>
          <h3>Retrieved File:</h3>
          <a href={retrievedFile.url} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        </div>
      )}
    </div>
  );
}
