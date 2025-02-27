import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useDisclosure,
  Stack
} from '@chakra-ui/react';
import ResumeModal from './ResumeModal';

interface CandidateCardProps {
  candidate: {
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    candidateSkills: string[];
    candidateExperience: string;
    jobTitle: string;
    status: string;
    candidateMockelloId: string;
  };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        bg="white"
        shadow="sm"
        width="100%"
      >
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              {candidate.candidateName}
            </Text>
            <Badge colorScheme={candidate.status === 'accepted' ? 'green' : candidate.status === 'rejected' ? 'red' : 'yellow'}>
              {candidate.status}
            </Badge>
          </HStack>
          
          <Text color="gray.600">{candidate.jobTitle}</Text>
          
          <Text fontSize="sm">{candidate.candidateEmail}</Text>
          {candidate.candidatePhone && (
            <Text fontSize="sm">{candidate.candidatePhone}</Text>
          )}
          
          {candidate.candidateExperience && (
            <Text fontSize="sm" color="gray.600">
              {candidate.candidateExperience}
            </Text>
          )}
          
          {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
            <HStack spacing={2} flexWrap="wrap">
              {candidate.candidateSkills.map((skill, index) => (
                <Badge key={index} colorScheme="blue" variant="subtle">
                  {skill}
                </Badge>
              ))}
            </HStack>
          )}
          
          <HStack spacing={2} justify="flex-end">
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onOpen}
            >
              View Resume
            </Button>
          </HStack>
        </Stack>
      </Box>

      <ResumeModal
        isOpen={isOpen}
        onClose={onClose}
        mockelloId={candidate.candidateMockelloId}
      />
    </>
  );
} 