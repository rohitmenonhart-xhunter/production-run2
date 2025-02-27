import { ChatMessageType, ChatTile } from "@/components/chat/ChatTile";
import {
  TrackReferenceOrPlaceholder,
  useChat,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/components-react";
import {
  LocalParticipant,
  Participant,
  Track,
  TranscriptionSegment,
} from "livekit-client";
import { useEffect, useState } from "react";

export function TranscriptionTile({
  agentAudioTrack,
  accentColor,
  onTranscriptionUpdate,
}: {
  agentAudioTrack: TrackReferenceOrPlaceholder;
  accentColor: string;
  onTranscriptionUpdate?: (messages: ChatMessageType[]) => void;
}) {
  const agentMessages = useTrackTranscription(agentAudioTrack);
  const localParticipant = useLocalParticipant();
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [transcripts, setTranscripts] = useState<Map<string, ChatMessageType>>(
    new Map()
  );
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { chatMessages, send: sendChat } = useChat();

  // store transcripts
  useEffect(() => {
    const newTranscripts = new Map(transcripts);
    
    // Process agent messages
    agentMessages.segments.forEach((s) => {
      if (s.text.trim()) { // Only process non-empty messages
        const message = segmentToChatMessage(
          s,
          newTranscripts.get(s.id),
          agentAudioTrack.participant
        );
        newTranscripts.set(s.id, message);
      }
    });
    
    // Process local messages
    localMessages.segments.forEach((s) => {
      if (s.text.trim()) { // Only process non-empty messages
        const message = segmentToChatMessage(
          s,
          newTranscripts.get(s.id),
          localParticipant.localParticipant
        );
        newTranscripts.set(s.id, message);
      }
    });

    // Combine all messages
    const allMessages = Array.from(newTranscripts.values());

    // Add chat messages
    chatMessages.forEach((msg) => {
      const isAgent = msg.from?.identity === agentAudioTrack.participant?.identity;
      const isSelf = msg.from?.identity === localParticipant.localParticipant.identity;
      const name = isAgent ? "HR Assistant" : (isSelf ? "You" : msg.from?.name || "Unknown");
      
      if (msg.message.trim()) { // Only add non-empty messages
        allMessages.push({
          name,
          message: msg.message,
          timestamp: msg.timestamp,
          isSelf,
        });
      }
    });

    // Sort messages by timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    // Remove duplicate messages and empty messages
    const uniqueMessages = allMessages.filter((msg, index, self) => 
      msg.message.trim() && // Remove empty messages
      index === self.findIndex((m) => (
        m.message === msg.message &&
        m.timestamp === msg.timestamp &&
        m.name === msg.name
      ))
    );

    setMessages(uniqueMessages);
    setTranscripts(newTranscripts);
    
    // Notify parent component of new messages
    if (onTranscriptionUpdate) {
      onTranscriptionUpdate(uniqueMessages);
    }
  }, [
    transcripts,
    agentMessages.segments,
    localMessages.segments,
    chatMessages,
    localParticipant.localParticipant,
    agentAudioTrack.participant,
    onTranscriptionUpdate
  ]);

  return (
    <ChatTile 
      messages={messages} 
      accentColor={accentColor} 
      onSend={sendChat} 
    />
  );
}

function segmentToChatMessage(
  s: TranscriptionSegment,
  existingMessage: ChatMessageType | undefined,
  participant: Participant
): ChatMessageType {
  const isLocal = participant instanceof LocalParticipant;
  return {
    message: s.final ? s.text.trim() : `${s.text.trim()} ...`,
    name: isLocal ? "You" : "HR Assistant",
    isSelf: isLocal,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
}
