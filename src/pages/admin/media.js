import { useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import styles from './media.module.css';

const MediaUploadPage = () => {
  const [child, setChild] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = (e) => {
    console.log('Files uploaded:', e.target.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Uploading media for child:', child, 'with description:', description);
  };

  const handleCancel = () => {
    setChild('');
    setDescription('');
    console.log('Form reset');
  };

  return (
    <div className={styles.mediaUploadPage}>
      <h1 className={styles.title}>Upload Picture/Video</h1>
      <form className={styles.mediaUploadForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Choose Files to Upload</label>
          <input type="file" multiple onChange={handleFileUpload} className={styles.formInputFile} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Child Selection</label>
          <select
            value={child}
            onChange={(e) => setChild(e.target.value)}
            className={styles.formInputSelect}
          >
            <option value="">Select Child</option>
            <option value="child1">Benny</option>
            <option value="child2">Alex</option>
            <option value="child3">Justin</option>
            <option value="child3">Steven</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description</label>
          <textarea
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formInputTextarea}
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.buttonUpload}>Upload</button>
          <button type="button" className={styles.buttonCancel} onClick={handleCancel}>Cancel</button>
        </div>
      </form>
      <footer className={styles.mediaFooter}>
        <a href="/contacts" className={styles.footerLink}>Contacts</a>
        <a href="/terms" className={styles.footerLink}>Terms of Service</a>
      </footer>
    </div>
  );
}

export default withAuth(MediaUploadPage);  // Wrap the page with the HOC