import { useState, useRef, FormEvent } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Paper, Grid, Chip } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { Montserrat, Inter } from 'next/font/google';
import Image from 'next/image';
import { analyzeResume } from '@/services/openai';
import ResumeAnalysisPopup from '@/components/ResumeAnalysisPopup';
import { generateMockelloId } from '@/utils/generateMockelloId';

const montserrat = Montserrat({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: string[];
  achievements: string[];
  interests: string[];
}

const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const fadeIn = {
  initial: { 
    opacity: 0
  },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.8
    }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export default function ResumeParser() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    education: [''],
    experience: [''],
    skills: [''],
    projects: [''],
    achievements: [''],
    interests: [''],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [mockelloId, setMockelloId] = useState<string>('');
  const savedJobsRef = useRef<HTMLDivElement>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    // Add artificial delay for scanning animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to parse resume');

      const parsedData = await response.json();
      setFormData(prev => ({
        ...prev,
        ...parsedData,
      }));
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Failed to parse resume. Please fill in the details manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Delete previous record with the same phone number
      const deleteResponse = await fetch('/api/delete-resume', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
        }),
      });

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        throw new Error('Failed to delete previous record');
      }

      // Generate unique Mockello ID
      const uniqueId = generateMockelloId({
        companyName: formData.fullName,
        description: formData.experience[0],
      });
      setMockelloId(uniqueId);

      // Get resume analysis
      const analysis = await analyzeResume(formData);
      setAnalysis(analysis);
      setAnalysisOpen(true);

      // Save to MongoDB with complete analysis
      const response = await fetch('/api/save-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mockelloId: uniqueId,
          ...formData,
          analysis, // Save the complete analysis including job recommendations
          createdAt: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume data');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayFieldChange = (
    field: ArrayField,
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      ),
    }));
  };

  const addArrayField = (field: ArrayField) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const arrayFields = ['education', 'experience', 'skills', 'projects', 'achievements', 'interests'] as const;
  type ArrayField = typeof arrayFields[number];
  
  const isArrayField = (field: string): field is ArrayField => 
    arrayFields.includes(field as ArrayField);

  const handleSaveJob = (title: string) => {
    if (!savedJobs.includes(title)) {
      setSavedJobs(prev => [...prev, title]);
      // Scroll to saved jobs section with offset for header
      setTimeout(() => {
        const yOffset = -100; // Offset to account for fixed header
        const element = savedJobsRef.current;
        if (element) {
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <Box className={inter.className} sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'black',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Mockello Branding */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: inter.style.fontFamily,
              fontWeight: 800,
              background: 'linear-gradient(45deg, #BE185D 30%, white 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Mockello
          </Typography>
        </motion.div>
      </Box>

      {/* Background gradient animation */}
      <Box
        component={motion.div}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'fixed',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(190,24,93,0.1) 0%, rgba(0,0,0,0) 50%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Box 
        component={motion.div}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        sx={{ 
          maxWidth: 1200,
          margin: '4rem auto 2rem',
          padding: 4,
          flex: 1,
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Animated gradient border */}
        <Box
          component={motion.div}
          variants={shimmer}
          animate="animate"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #BE185D, transparent)',
            backgroundSize: '200% 100%',
          }}
        />

        <Paper 
          elevation={6} 
          sx={{ 
            padding: { xs: 2, sm: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(190, 24, 93, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Paper background animation */}
          <Box
            component={motion.div}
            animate={{
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '150%',
              height: '150%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, #BE185D 0%, transparent 60%)',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />

          <Box 
            component={motion.div}
            variants={fadeInUp}
            sx={{ 
              textAlign: 'center', 
              mb: 8,
              position: 'relative'
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h2" 
                gutterBottom
                sx={{ 
                  fontFamily: inter.style.fontFamily,
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(45deg, #BE185D 30%, white 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                  textTransform: 'uppercase'
                }}
              >
                Resume Parser
              </Typography>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  maxWidth: '700px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                  letterSpacing: '0.02em',
                  fontFamily: inter.style.fontFamily
                }}
              >
                Upload your resume and let our AI extract the information automatically
              </Typography>
            </motion.div>
          </Box>

          <Box 
            component={motion.div}
            variants={fadeInUp}
            sx={{ 
              mb: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #BE185D 30%, #9D174D 90%)',
                  color: 'white',
                  padding: '16px 48px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  boxShadow: '0 4px 20px rgba(190, 24, 93, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #9D174D 30%, #BE185D 90%)',
                    boxShadow: '0 6px 30px rgba(190, 24, 93, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(190, 24, 93, 0.5)',
                  }
                }}
              >
                {loading ? 'Scanning...' : 'Upload Resume'}
              </Button>
            </motion.div>
            <AnimatePresence>
              {loading && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '400px',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      marginTop: '24px',
                      overflow: 'hidden'
                    }}
                  >
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ 
                        x: '100%',
                        transition: {
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear"
                        }
                      }}
                      style={{
                        position: 'absolute',
                        width: '50%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, #BE185D, transparent)',
                        borderRadius: '2px'
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      marginTop: '12px',
                      color: '#BE185D',
                      fontFamily: inter.style.fontFamily,
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    Analyzing your resume...
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </Box>

          <Box 
            component={motion.div} 
            variants={fadeIn}
            sx={{ position: 'relative' }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 4,
                        color: '#BE185D',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        fontFamily: inter.style.fontFamily,
                        position: 'relative',
                        display: 'inline-block',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: '60%',
                          height: '3px',
                          background: 'linear-gradient(90deg, #BE185D, transparent)'
                        }
                      }}
                    >
                      Required Information
                    </Typography>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    value={formData.fullName === "Please enter your full name manually" ? "" : formData.fullName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, fullName: e.target.value }));
                      if (errors.fullName) {
                        setErrors(prev => ({ ...prev, fullName: '' }));
                      }
                    }}
                    error={!!errors.fullName}
                    helperText={errors.fullName || "Please enter your full name"}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        '& fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#BE185D',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: inter.style.fontFamily,
                        fontWeight: 500
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        fontFamily: inter.style.fontFamily,
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        padding: '16px'
                      },
                      '& .MuiFormHelperText-root': {
                        fontFamily: inter.style.fontFamily,
                        fontSize: '0.85rem',
                        marginTop: '8px',
                        color: errors.fullName ? '#f44336' : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    error={!!errors.email}
                    helperText={errors.email || "Enter your email address"}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        '& fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#BE185D',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: inter.style.fontFamily,
                        fontWeight: 500
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        fontFamily: inter.style.fontFamily,
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        padding: '16px'
                      },
                      '& .MuiFormHelperText-root': {
                        fontFamily: inter.style.fontFamily,
                        fontSize: '0.85rem',
                        marginTop: '8px',
                        color: errors.email ? '#f44336' : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone"
                    value={formData.phone === "Please enter your phone number manually" ? "" : formData.phone}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    error={!!errors.phone}
                    helperText={errors.phone || "Enter your phone number"}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        '& fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.3)',
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(190, 24, 93, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#BE185D',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: inter.style.fontFamily,
                        fontWeight: 500
                      },
                      '& .MuiInputBase-input': {
                        color: 'white',
                        fontFamily: inter.style.fontFamily,
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        padding: '16px'
                      },
                      '& .MuiFormHelperText-root': {
                        fontFamily: inter.style.fontFamily,
                        fontSize: '0.85rem',
                        marginTop: '8px',
                        color: errors.phone ? '#f44336' : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>

                {/* Resume Sections */}
                {arrayFields.map((field) => (
                  <Grid item xs={12} key={field}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        textTransform: 'capitalize',
                        mb: 2,
                        color: '#BE185D',
                        fontWeight: 700,
                        fontFamily: inter.style.fontFamily,
                        letterSpacing: '-0.01em',
                        position: 'relative',
                        display: 'inline-block',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -4,
                          left: 0,
                          width: '40%',
                          height: '2px',
                          background: 'linear-gradient(90deg, #BE185D, transparent)'
                        }
                      }}
                    >
                      {field}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label={field}
                      value={formData[field][0] || ''}
                      onChange={(e) => handleArrayFieldChange(field, 0, e.target.value)}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          '& fieldset': {
                            borderColor: 'rgba(190, 24, 93, 0.3)',
                            borderWidth: '2px'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(190, 24, 93, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#BE185D',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontFamily: inter.style.fontFamily,
                          fontWeight: 500
                        },
                        '& .MuiInputBase-input': {
                          color: 'white',
                          fontFamily: inter.style.fontFamily,
                          fontSize: '1.1rem',
                          fontWeight: 400,
                          padding: '16px'
                        }
                      }}
                      placeholder={`Enter your ${field.toLowerCase()} here...`}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        mt: 6,
                        height: 60,
                        background: 'linear-gradient(45deg, #BE185D 30%, #9D174D 90%)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        fontFamily: inter.style.fontFamily,
                        letterSpacing: '0.02em',
                        borderRadius: '30px',
                        boxShadow: '0 4px 20px rgba(190, 24, 93, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #9D174D 30%, #BE185D 90%)',
                          boxShadow: '0 6px 30px rgba(190, 24, 93, 0.4)',
                        }
                      }}
                    >
                      Save Resume
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </Box>

      {/* Saved Jobs Section */}
      <AnimatePresence>
        {savedJobs.length > 0 && (
          <motion.div
            ref={savedJobsRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderBottom: '1px solid rgba(190, 24, 93, 0.2)',
                backdropFilter: 'blur(10px)',
                py: 2,
                px: 4,
                mt: 8
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#BE185D',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Saved Jobs
              </Typography>
              <Grid container spacing={2}>
                {savedJobs.map((job, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={job}
                      onDelete={() => setSavedJobs(prev => prev.filter(j => j !== job))}
                      sx={{
                        background: 'rgba(190, 24, 93, 0.1)',
                        border: '1px solid rgba(190, 24, 93, 0.3)',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: '#BE185D',
                          '&:hover': {
                            color: '#9D174D'
                          }
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Footer styles */}
      <Box sx={{ transform: 'scale(0.9)', opacity: 0.9 }}>
        <Footer />
      </Box>

      <ResumeAnalysisPopup
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        analysis={analysis}
        loading={loading}
        onSaveJob={handleSaveJob}
        mockelloId={mockelloId}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Box>
  );
} 