import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface HR {
  _id: string;
  name: string;
  email: string;
  username: string;
  companyId: string;
  assignedCandidates: string[];
  createdAt: Date;
}

interface Candidate {
  _id: string;
  mockelloId: string;
  fullName: string;
  email: string;
  appliedRole: string;
  status: string;
}

export default function HRManagementTab() {
  const [hrs, setHrs] = useState<HR[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAddingHR, setIsAddingHR] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedHR, setSelectedHR] = useState<HR | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchHRs();
    fetchCandidates();
  }, []);

  useEffect(() => {
    // Initialize selected candidates when HR is selected
    if (selectedHR) {
      setSelectedCandidates(new Set(selectedHR.assignedCandidates || []));
    } else {
      setSelectedCandidates(new Set());
    }
  }, [selectedHR]);

  const fetchHRs = async () => {
    try {
      const companyEmail = localStorage.getItem('company_email');
      if (!companyEmail) throw new Error('Company not authenticated');

      const response = await fetch(`/api/company/hrs?email=${companyEmail}`);
      if (!response.ok) throw new Error('Failed to fetch HRs');
      
      const data = await response.json();
      setHrs(data.hrs);
    } catch (error) {
      console.error('Error fetching HRs:', error);
      setError('Failed to load HR list');
    }
  };

  const fetchCandidates = async () => {
    try {
      const companyEmail = localStorage.getItem('company_email');
      if (!companyEmail) throw new Error('Company not authenticated');

      const response = await fetch(`/api/company/candidates?email=${companyEmail}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      
      const data = await response.json();
      setCandidates(data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load candidate list');
    }
  };

  const handleAddHR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyEmail = localStorage.getItem('company_email');
      if (!companyEmail) throw new Error('Company not authenticated');

      const response = await fetch('/api/company/hrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create HR');

      setHrs(prev => [...prev, data.hr]);
      setSuccess('HR created successfully');
      setIsAddingHR(false);
      setFormData({ name: '', email: '', username: '', password: '' });
    } catch (error) {
      console.error('Error creating HR:', error);
      setError(error instanceof Error ? error.message : 'Failed to create HR');
    }
  };

  const handleDeleteHR = async (hrId: string) => {
    try {
      const response = await fetch(`/api/company/hrs/${hrId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete HR');

      setSuccess('HR deleted successfully');
      setHrs(hrs.filter(hr => hr._id !== hrId));
    } catch (error) {
      console.error('Error deleting HR:', error);
      setError('Failed to delete HR');
    }
  };

  const handleAssignCandidates = async (hrId: string, candidateIds: string[]) => {
    try {
      const companyEmail = localStorage.getItem('company_email');
      if (!companyEmail) throw new Error('Company not authenticated');

      const response = await fetch(`/api/company/hrs/${hrId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: companyEmail,
          candidateIds: Array.from(selectedCandidates)
        }),
      });

      if (!response.ok) throw new Error('Failed to assign candidates');

      setSuccess('Candidates assigned successfully');
      setOpenAssign(false);
      setSelectedHR(null);
      setSelectedCandidates(new Set());
      fetchHRs();
    } catch (error) {
      console.error('Error assigning candidates:', error);
      setError('Failed to assign candidates');
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#BE185D]">HR Management</h2>
        <button
          onClick={() => setIsAddingHR(true)}
          className="px-4 py-2 bg-[#BE185D] text-white rounded-lg hover:bg-[#BE185D]/90 transition-colors"
        >
          Add New HR
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">&times;</button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right">&times;</button>
        </div>
      )}

      {/* HR List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hrs.map((hr) => (
          <div key={hr._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#BE185D]/30 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#BE185D]/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{hr.name}</h3>
                    <p className="text-sm text-gray-500">{hr.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteHR(hr._id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete HR"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>

              {/* Assigned Candidates */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Assigned Candidates</span>
                  <span className="text-sm text-gray-500">{hr.assignedCandidates?.length || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hr.assignedCandidates?.slice(0, 3).map((candidateId) => {
                    const candidate = candidates.find(c => c._id === candidateId);
                    return candidate ? (
                      <Chip
                        key={candidateId}
                        label={candidate.fullName}
                        size="small"
                        className="bg-[#BE185D]/10 text-[#BE185D]"
                      />
                    ) : null;
                  })}
                  {hr.assignedCandidates?.length > 3 && (
                    <Chip
                      label={`+${hr.assignedCandidates.length - 3} more`}
                      size="small"
                      className="bg-gray-100 text-gray-600"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedHR(hr);
                    setOpenAssign(true);
                  }}
                  className="w-full px-4 py-2 bg-[#BE185D]/10 text-[#BE185D] rounded-lg hover:bg-[#BE185D]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <PersonAddIcon fontSize="small" />
                  Assign Candidates
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Assignment Dialog */}
      <Dialog 
        open={openAssign} 
        onClose={() => {
          setOpenAssign(false);
          setSelectedHR(null);
          setSelectedCandidates(new Set());
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Candidates</h2>
              <p className="text-sm text-gray-500 mt-1">
                Select candidates to assign to {selectedHR?.name}
              </p>
            </div>
            <button
              onClick={() => {
                setOpenAssign(false);
                setSelectedHR(null);
                setSelectedCandidates(new Set());
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No candidates available for assignment</p>
              </div>
            ) : (
              <List>
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidates.has(candidate._id);
                  return (
                    <ListItem
                      key={candidate._id}
                      className={`rounded-lg mb-2 cursor-pointer ${
                        isSelected ? 'bg-[#BE185D]/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleCandidateSelection(candidate._id)}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-10 h-10 rounded-full bg-[#BE185D]/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{candidate.fullName}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                          <div className="text-sm text-gray-500">Applied for: {candidate.appliedRole}</div>
                        </div>
                        <Chip
                          label={isSelected ? 'Selected' : 'Not Selected'}
                          className={isSelected ? 'bg-[#BE185D]/10 text-[#BE185D]' : 'bg-gray-100 text-gray-600'}
                          size="small"
                        />
                      </div>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAssign(false);
              setSelectedHR(null);
              setSelectedCandidates(new Set());
            }}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedHR) {
                handleAssignCandidates(selectedHR._id, Array.from(selectedCandidates));
              }
            }}
            className="bg-[#BE185D] text-white hover:bg-[#BE185D]/90"
          >
            Assign Selected ({selectedCandidates.size})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add HR Form */}
      {isAddingHR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full shadow-xl overflow-hidden"
          >
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Add New HR</h3>
                <p className="text-sm text-gray-500 mt-1">Create credentials for a new HR team member</p>
              </div>
              <button
                onClick={() => setIsAddingHR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddHR} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    placeholder="Enter HR's full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    placeholder="Enter work email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    placeholder="Choose a username"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">This will be used to log in to the HR dashboard</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:border-[#BE185D] focus:ring-2 focus:ring-[#BE185D]/20 transition-all text-gray-800 placeholder-gray-400"
                    placeholder="Enter a strong password"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters long</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddingHR(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#BE185D] text-white hover:bg-[#BE185D]/90 transition-all font-medium shadow-lg shadow-[#BE185D]/20"
                >
                  Create HR Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 