'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../utils/api';
import Link from "next/link";
import CustomCard from '../../components/Card/CustomCard';
import { Button } from '@mui/material';
import styles from "../HomePage.module.css";

const AdminPage = () => {
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Invalid token:', error);
        setError('Session expired, please log in again.');
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    validateToken();
  }, [router]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.floatingCard}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        <div className={styles.gridSection}>
          {/* Activity Log */}
          <CustomCard
            title="Activity Log"
            content="View all administrative activity logs."
            actions={
              <Link href="/admin/activity-log">
                <Button size="small" color="primary">Go to Activity Log</Button>
              </Link>
            }
          />

          {/* Progress Reports */}
          <CustomCard
            title="Progress Reports"
            content="Manage and view progress reports for children."
            actions={
              <Link href="/admin/progressReport">
                <Button size="small" color="primary">Go to Progress Reports</Button>
              </Link>
            }
          />

          {/* Media */}
          <CustomCard
            title="Media"
            content="Upload and manage media files."
            actions={
              <Link href="/admin/media">
                <Button size="small" color="primary">Go to Media</Button>
              </Link>
            }
          />

          {/* Relationships */}
          <CustomCard
            title="Relationships"
            content="Manage relationships between children and guardians."
            actions={
              <Link href="/admin/relationship">
                <Button size="small" color="primary">Go to Relationships</Button>
              </Link>
            }
          />

          {/* Children */}
          <CustomCard
            title="Children"
            content="View and manage children profiles."
            actions={
              <Link href="/admin/children">
                <Button size="small" color="primary">Go to Children</Button>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
