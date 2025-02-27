import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  Box,
  Heading,
  List,
  ListItem,
  Badge,
  Link,
  Spinner,
  Center,
  Divider,
  Stack
} from '@chakra-ui/react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mockelloId: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  achievements: string[];
}

export default function ResumeModal({ isOpen, onClose, mockelloId }: ResumeModalProps) {
  const [resumeData, setResumeData] = React.useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && mockelloId) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/resumes/${mockelloId}`)
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            throw new Error(data.message);
          }
          setResumeData(data);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, mockelloId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resume</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading ? (
            <Center py={8}>
              <Spinner />
            </Center>
          ) : error ? (
            <Center py={8}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : resumeData ? (
            <Stack spacing={6} align="stretch">
              {/* Header Section */}
              <Box>
                <Heading size="lg">{resumeData.fullName}</Heading>
                <Text mt={2}>{resumeData.email}</Text>
                <Text>{resumeData.phone}</Text>
                {resumeData.resumeUrl && (
                  <Link href={resumeData.resumeUrl} color="blue.500" mt={2}>
                    Download PDF Resume
                  </Link>
                )}
              </Box>

              {/* Skills Section */}
              {resumeData.skills?.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={3}>Skills</Heading>
                    <HStack spacing={2} flexWrap="wrap">
                      {resumeData.skills.map((skill, index) => (
                        <Badge key={index} colorScheme="blue" mb={2}>
                          {skill}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                </>
              )}

              {/* Experience Section */}
              {resumeData.experience?.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={3}>Experience</Heading>
                    <Stack spacing={4} align="stretch">
                      {resumeData.experience.map((exp, index) => (
                        <Box key={index}>
                          <Text fontWeight="bold">{exp.role}</Text>
                          <Text>{exp.company} • {exp.duration}</Text>
                          <Text mt={1}>{exp.description}</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

              {/* Achievements Section */}
              {resumeData.achievements?.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={3}>Achievements</Heading>
                    <List spacing={2}>
                      {resumeData.achievements.map((achievement, index) => (
                        <ListItem key={index}>• {achievement}</ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}
            </Stack>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 