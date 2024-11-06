// components/CustomCard.js
import React from 'react';
import { Card, CardContent, CardActions, Typography } from '@mui/material';

const CustomCard = ({ title, content, actions }) => {
  return (
    <Card sx={{ maxWidth: 345, borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', margin: '20px auto' }}>
      <CardContent>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </Card>
  );
};

export default CustomCard;