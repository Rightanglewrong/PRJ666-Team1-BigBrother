import { useState } from 'react';

export default function MediaUploadPage() {
  const [child, setChild] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = (e) => {
    console.log('Files uploaded:', e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Uploading media for child:', child, 'with description:', description);
  };

  return (
    <div className="upload-page">
      <h1>Upload Picture/Video</h1>
      <form onSubmit={handleSubmit}>
        <div className="upload-section">
          <label>Upload Section</label>
          <input type="file" multiple onChange={handleFileUpload} />
        </div>
        <div className="child-selection">
          <label>Child Selection</label>
          <select value={child} onChange={(e) => setChild(e.target.value)}>
            <option value="">Select Child</option>
            <option value="child1">Child 1</option>
            <option value="child2">Child 2</option>
          </select>
        </div>
        <div className="description">
          <label>Description</label>
          <textarea
            placeholder="Enter texts..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="buttons">
          <button type="submit">Upload</button>
          <button type="button">Cancel</button>
        </div>
      </form>
      <footer className="footer">
        <a href="/contacts" className="contact">Contacts</a>
        <a href="/terms" className="terms">Terms of service</a>
      </footer>
    </div>
  );
}
