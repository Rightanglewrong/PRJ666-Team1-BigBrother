"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/authenticate";
import Link from "next/link";
import CustomCard from "../../components/Card/CustomCard";
import { Button, Typography } from "@mui/material";
import styles from "../HomePage.module.css";

const AdminPage = () => {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // If the user is not logged in, redirect to login
      // Remove the invalid token if any exists
      localStorage.removeItem("token");
      router.push("/login");
    } else if (user.accountType !== "Admin") {
      // If the user is not an Admin, redirect or show an error
      router.push("/");
    }
  }, [user, router]);

  // Render an error if user data is still loading or is unauthorized
  if (!user || user.accountType !== "Admin") {
    return (
      <Typography variant="h5" className={styles.error}>
        Unauthorized Access
      </Typography>
    );
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
                <Button size="small" color="primary">
                  Go to Activity Log
                </Button>
              </Link>
            }
          />

          {/* Progress Reports */}
          <CustomCard
            title="Progress Reports"
            content="Manage and view progress reports for children."
            actions={
              <Link href="/admin/progressReport/index">
                <Button size="small" color="primary">
                  Go to Progress Reports
                </Button>
              </Link>
            }
          />

          {/* Media */}
          <CustomCard
            title="Media"
            content="Upload and manage media files."
            actions={
              <Link href="/admin/mediaGallery">
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
                <Button size="small" color="primary">
                  Go to Relationships
                </Button>
              </Link>
            }
          />

          {/* Children */}
          <CustomCard
            title="Children"
            content="View and manage children profiles."
            actions={
              <Link href="/admin/children">
                <Button size="small" color="primary">
                  Go to Children
                </Button>
              </Link>
            }
          />

          {/* Users */}
          <CustomCard
            title="Users"
            content="View and manage User profiles."
            actions={
              <Link href="/admin/user">
                <Button size="small" color="primary">
                  Go to Users
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
