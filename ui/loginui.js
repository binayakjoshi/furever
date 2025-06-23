import { Box, Typography, Button, Divider, Link } from '@mui/material';
import { styled } from '@mui/system';

// Container
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(4, 2),
  margin: '0 auto',
  maxWidth: '28rem',
}));
