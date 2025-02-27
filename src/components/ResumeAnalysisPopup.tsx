import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, Divider, Card, Grid, CircularProgress, Button, Tooltip } from '@mui/material';
import { Close as CloseIcon, WorkOutline as WorkIcon, ArrowUpward as ArrowUpwardIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface ResumeAnalysisPopupProps {
  open: boolean;
  onClose: () => void;
  analysis: string;
  loading?: boolean;
  onSaveJob?: (title: string) => void;
  mockelloId?: string;
}

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <CircularProgress 
        size={60}
        thickness={4}
        sx={{ 
          color: '#BE185D',
          mb: 3
        }}
      />
    </motion.div>
    <Typography
      variant="h6"
      sx={{
        color: 'white',
        fontWeight: 500,
        textAlign: 'center',
        background: 'linear-gradient(45deg, #BE185D 30%, white 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      Analyzing Your Resume...
    </Typography>
  </motion.div>
);

const JobCard = ({ title, onSave }: { title: string; onSave?: (title: string) => void }) => (
  <Grid item xs={12} sm={6} md={4}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(190, 24, 93, 0.2)',
          borderRadius: '12px',
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#BE185D',
            boxShadow: '0 4px 20px rgba(190, 24, 93, 0.2)',
            background: 'rgba(255, 255, 255, 0.08)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ 
            color: '#BE185D',
            mr: 2,
            fontSize: '1.5rem',
            lineHeight: 1,
            mt: '2px'
          }}>•</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
              lineHeight: 1.3,
              mb: 2
            }}>
              {title}
            </Typography>
            <Button
              startIcon={<ArrowUpwardIcon />}
              onClick={() => onSave?.(title)}
              sx={{
                color: '#BE185D',
                fontSize: '0.9rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(190, 24, 93, 0.1)',
                }
              }}
            >
              Save as PDF
            </Button>
          </Box>
        </Box>
      </Card>
    </motion.div>
  </Grid>
);

export default function ResumeAnalysisPopup({ 
  open, 
  onClose, 
  analysis, 
  loading = false, 
  onSaveJob,
  mockelloId 
}: ResumeAnalysisPopupProps) {
  const [copyTooltip, setCopyTooltip] = useState('Copy ID');

  const handleCopyId = () => {
    if (mockelloId) {
      navigator.clipboard.writeText(mockelloId);
      setCopyTooltip('Copied!');
      setTimeout(() => setCopyTooltip('Copy ID'), 2000);
    }
  };

  // Extract job titles from the analysis text
  const jobTitles = analysis.match(/(?<=^|\n)[\w\s()]+(?=\n|$)/gm)?.filter(title => 
    !title.includes('#') && 
    !title.includes('Based on') && 
    title.trim().length > 0
  ) || [];

  const components = {
    h1: ({ children }: any) => {
      if (children === 'Job Recommendations') {
        return (
          <>
            <Typography variant="h4" sx={{ 
              color: '#BE185D',
              fontWeight: 700,
              mb: 3,
              mt: 4
            }}>
              {children}
            </Typography>
            <Grid container spacing={3}>
              {jobTitles.map((title, index) => (
                <JobCard 
                  key={index} 
                  title={title.trim()} 
                  onSave={onSaveJob}
                />
              ))}
            </Grid>
          </>
        );
      }
      return (
        <Typography variant="h4" sx={{ 
          color: '#BE185D',
          fontWeight: 700,
          mb: 2,
          mt: 3
        }}>
          {children}
        </Typography>
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          scroll="paper"
          PaperProps={{
            style: {
              background: 'transparent',
              boxShadow: 'none',
              maxHeight: '90vh'
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(190, 24, 93, 0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <AnimatePresence>
              {loading && <LoadingOverlay />}
            </AnimatePresence>

            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #BE185D 30%, #9D174D 90%)',
              color: 'white',
              p: 3,
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: mockelloId ? 2 : 0
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Resume Analysis
                </Typography>
                <IconButton
                  onClick={onClose}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {mockelloId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ width: '100%' }}
                >
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 500,
                        letterSpacing: '0.05em'
                      }}
                    >
                      Your Mockello ID:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      px: 2,
                      py: 0.5
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'white',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          fontFamily: 'monospace'
                        }}
                      >
                        {mockelloId}
                      </Typography>
                      <Tooltip title={copyTooltip} placement="top">
                        <IconButton 
                          size="small"
                          onClick={handleCopyId}
                          sx={{ 
                            color: 'white',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </DialogTitle>
            <DialogContent sx={{ 
              p: 4,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#BE185D',
                borderRadius: '4px',
                '&:hover': {
                  background: '#9D174D',
                },
              },
            }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{
                  color: 'white',
                  '& h1, & h2, & h3': {
                    color: '#BE185D',
                    fontWeight: 700,
                    mb: 2,
                    mt: 3
                  },
                  '& p': {
                    mb: 2,
                    lineHeight: 1.7
                  },
                  '& ul': {
                    mb: 2,
                    pl: 3,
                    listStyle: 'none',
                    '& li': {
                      position: 'relative',
                      '&:before': {
                        content: '"•"',
                        color: '#BE185D',
                        position: 'absolute',
                        left: -20,
                        top: 0,
                        fontSize: '1.2em'
                      }
                    }
                  },
                  '& li': {
                    mb: 1
                  },
                  '& hr': {
                    my: 3,
                    borderColor: 'rgba(190, 24, 93, 0.2)'
                  }
                }}
              >
                <ReactMarkdown components={components}>{analysis}</ReactMarkdown>
              </Box>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 