"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip, X, FileText, Download, Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ScrollArea = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('overflow-auto', className)}>{children}</div>;
};
import { MessageSquare, Search, Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  createdAt: any;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: Record<string, any>; // Map of userId -> timestamp when they read the message
}

interface Conversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, { name: string; email: string; role: string; avatar?: string; photoURL?: string }>;
  lastMessage: string;
  lastMessageTimestamp: any;
  lastSenderId?: string;
  lastReadTimestamps?: Record<string, any>;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [participantAvatars, setParticipantAvatars] = useState<Record<string, string>>({});
  const [participantAvailability, setParticipantAvailability] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch conversations
  useEffect(() => {
    if (!db || !user) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const fetchedConversations: Conversation[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              participants: data.participants || [],
              participantDetails: data.participantDetails || {},
              lastMessage: data.lastMessage || '',
              lastMessageTimestamp: data.lastMessageTimestamp || null,
              lastSenderId: data.lastSenderId || null,
              lastReadTimestamps: data.lastReadTimestamps || {},
              messages: [],
            };
          });

          // Fetch avatar URLs for all participants
          const avatarMap: Record<string, string> = {};
          const participantIds = new Set<string>();
          fetchedConversations.forEach(convo => {
            convo.participants.forEach(pid => {
              if (pid !== user.uid) participantIds.add(pid);
            });
          });

          // Load avatars and availability from Firestore users collection
          const availabilityMap: Record<string, string> = {};
          await Promise.all(
            Array.from(participantIds).map(async (participantId) => {
              try {
                const userDocRef = doc(db, 'users', participantId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  // Try avatar first, then photoURL, then logo (for clients)
                  const avatarUrl = userData.avatar || userData.photoURL || userData.logo || '';
                  if (avatarUrl) {
                    avatarMap[participantId] = avatarUrl;
                  }
                  // Get availability status
                  availabilityMap[participantId] = userData.availabilityStatus || 'available';
                }
              } catch (error) {
                console.error(`Error fetching data for ${participantId}:`, error);
              }
            })
          );

          setParticipantAvatars(avatarMap);
          setParticipantAvailability(availabilityMap);
          setConversations(fetchedConversations);
          
          // Don't auto-select first conversation - let user click to open
          // if (!selectedConversationId && fetchedConversations.length > 0) {
          //   setSelectedConversationId(fetchedConversations[0].id);
          // }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [db, user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!db || !selectedConversationId) return;

    const messagesRef = collection(db, 'conversations', selectedConversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // Check for new messages BEFORE updating state
      if (lastMessageCount > 0 && fetchedMessages.length > lastMessageCount) {
        const newMessages = fetchedMessages.slice(lastMessageCount);
        console.log('New messages detected:', newMessages.length);
        newMessages.forEach(msg => {
          console.log('Processing message from:', msg.senderId, 'Current user:', user?.uid);
          if (msg.senderId !== user?.uid) {
            console.log('Showing notification for message:', msg);
            
            // Play notification sound
            try {
              const audio = new Audio('/notification.mp3');
              audio.volume = 0.5; // Set volume to 50%
              audio.play().catch(err => console.log('Audio play failed:', err));
            } catch (error) {
              console.log('Error playing notification sound:', error);
            }
            
            // Show toast notification
            toast({
              title: '💬 New Message',
              description: `${msg.senderName}: ${msg.text || 'Sent a file'}`,
              duration: 5000,
            });

            // Show browser notification
            if ('Notification' in window) {
              console.log('Notification permission:', Notification.permission);
              if (Notification.permission === 'granted') {
                new Notification('New Message from ' + msg.senderName, {
                  body: msg.text || 'Sent you a file',
                  icon: '/favicon.ico',
                  badge: '/favicon.ico',
                  tag: 'message-notification',
                });
              }
            }
          }
        });
      }
      
      setMessages(fetchedMessages);
      setLastMessageCount(fetchedMessages.length);
      
      // Scroll to bottom when messages change
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [db, selectedConversationId, lastMessageCount, user, toast]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mark conversation as read when selected
  useEffect(() => {
    if (!db || !selectedConversationId || !user) return;

    const markAsRead = async () => {
      try {
        const conversationRef = doc(db, 'conversations', selectedConversationId);
        await updateDoc(conversationRef, {
          [`lastReadTimestamps.${user.uid}`]: serverTimestamp(),
        });
        console.log('Marked conversation as read:', selectedConversationId);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    };

    markAsRead();
  }, [db, selectedConversationId, user]);

  // Mark all messages in the conversation as read
  useEffect(() => {
    if (!db || !selectedConversationId || !user || messages.length === 0) return;

    const markMessagesAsRead = async () => {
      try {
        // Find unread messages from other users
        const unreadMessages = messages.filter(msg => 
          msg.senderId !== user.uid && 
          (!msg.readBy || !msg.readBy[user.uid])
        );

        if (unreadMessages.length === 0) return;

        console.log(`Marking ${unreadMessages.length} messages as read`);

        // Update each unread message
        const messagesRef = collection(db, 'conversations', selectedConversationId, 'messages');
        const updatePromises = unreadMessages.map(async (msg) => {
          const messageRef = doc(messagesRef, msg.id);
          await updateDoc(messageRef, {
            [`readBy.${user.uid}`]: serverTimestamp(),
            status: 'read',
          });
        });

        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    // Small delay to ensure messages are loaded
    const timer = setTimeout(markMessagesAsRead, 500);
    return () => clearTimeout(timer);
  }, [db, selectedConversationId, user, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedConversationId || !user) return;

    console.log('Starting to send message. File selected:', selectedFile?.name);
    setSending(true);
    
    try {
      let fileUrl = '';
      let fileName = '';
      let fileType = '';

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size);
        setUploadingFile(true);
        try {
          const timestamp = Date.now();
          const filePath = `messages/${selectedConversationId}/${timestamp}_${selectedFile.name}`;
          console.log('File path:', filePath);
          
          const fileRef = ref(storage, filePath);
          console.log('Storage ref created, uploading bytes...');
          
          const snapshot = await uploadBytes(fileRef, selectedFile);
          console.log('Upload successful, snapshot:', snapshot);
          
          fileUrl = await getDownloadURL(fileRef);
          console.log('File uploaded successfully. URL:', fileUrl);
          
          fileName = selectedFile.name;
          fileType = selectedFile.type;
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          console.error('Error code:', uploadError.code);
          console.error('Error message:', uploadError.message);
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: uploadError.message || 'Could not upload file. Sending message without attachment.',
          });
        } finally {
          setUploadingFile(false);
        }
      }

      const messagesRef = collection(db, 'conversations', selectedConversationId, 'messages');
      const messageData: any = {
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'You',
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
        status: 'sent',
        readBy: {},
      };

      if (fileUrl) {
        messageData.fileUrl = fileUrl;
        messageData.fileName = fileName;
        messageData.fileType = fileType;
        console.log('Adding file data to message:', { fileName, fileType, fileUrl });
      }

      console.log('Sending message to Firestore:', messageData);
      await addDoc(messagesRef, messageData);
      console.log('Message sent successfully');

      // Update conversation with last message
      const conversationRef = doc(db, 'conversations', selectedConversationId);
      await updateDoc(conversationRef, {
        lastMessage: fileUrl ? `📎 ${fileName}` : newMessage.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: user.uid,
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: 'Message sent',
        description: fileUrl ? 'File sent successfully' : 'Message delivered',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', { code: error.code, message: error.message, stack: error.stack });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select a file smaller than 10MB.',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredConversations = conversations.filter(convo => {
    const otherParticipant = convo.participants.find(p => p !== user?.uid);
    const participantName = otherParticipant ? convo.participantDetails[otherParticipant]?.name : '';
    return participantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherParticipantId = selectedConversation?.participants.find(p => p !== user?.uid);
  const otherParticipant = otherParticipantId ? selectedConversation?.participantDetails[otherParticipantId] : null;

  // Check if a conversation is unread
  const isConversationUnread = (convo: Conversation) => {
    if (!user) return false;
    
    const lastSenderId = convo.lastSenderId;
    const lastMessageTimestamp = convo.lastMessageTimestamp;
    const lastReadTimestamps = convo.lastReadTimestamps || {};
    const userLastRead = lastReadTimestamps[user.uid];
    
    // Unread if last message was from other person and hasn't been read
    if (lastSenderId && lastSenderId !== user.uid) {
      if (!userLastRead || (lastMessageTimestamp && lastMessageTimestamp.toMillis() > userLastRead.toMillis())) {
        return true;
      }
    }
    
    return false;
  };

  // Count unread messages in a conversation
  const getUnreadCount = (convo: Conversation) => {
    if (!user) return 0;
    
    // If the last message was sent by the current user, there are no unread messages for them
    if (convo.lastSenderId === user.uid) {
      return 0;
    }
    
    const lastReadTimestamps = convo.lastReadTimestamps || {};
    const userLastRead = lastReadTimestamps[user.uid];
    
    // If user has never read this conversation, check if there's any message
    if (!userLastRead) {
      // Return 1 if there's a last message from someone else (indicating unread conversation)
      return convo.lastMessage ? 1 : 0;
    }
    
    // If the last message timestamp is newer than user's last read, there are unread messages
    if (convo.lastMessageTimestamp && convo.lastMessageTimestamp.toMillis() > userLastRead.toMillis()) {
      // We can't get exact count without fetching all messages, so return indicator (1+)
      return 1;
    }
    
    return 0;
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get message read status for display
  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null; // Only show status for own messages
    
    const otherParticipantId = selectedConversation?.participants.find(p => p !== user?.uid);
    if (!otherParticipantId) return 'sent';
    
    // Check if other user has read the message
    if (msg.readBy && msg.readBy[otherParticipantId]) {
      return 'read';
    }
    
    // Message is delivered (sent successfully and conversation exists)
    return msg.status || 'sent';
  };

  // Get availability status badge
  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available', variant: 'default' as const, color: 'bg-green-500' };
      case 'away':
        return { text: 'Away', variant: 'secondary' as const, color: 'bg-yellow-500' };
      case 'not-available':
        return { text: 'Not Available', variant: 'destructive' as const, color: 'bg-red-500' };
      default:
        return { text: 'Available', variant: 'default' as const, color: 'bg-green-500' };
    }
  };

  // Render read receipt icon
  const renderReadReceipt = (msg: Message) => {
    const status = getMessageStatus(msg);
    if (!status) return null;
    
    if (status === 'read') {
      return (
        <CheckCheck className="h-3 w-3 inline ml-1 text-blue-500 dark:text-blue-400" />
      );
    } else if (status === 'delivered') {
      return (
        <CheckCheck className="h-3 w-3 inline ml-1 opacity-70" />
      );
    } else {
      return (
        <Check className="h-3 w-3 inline ml-1 opacity-70" />
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-primary" /> Messages
            </h1>
            <p className="text-muted-foreground">Communicate with clients regarding your projects and proposals.</p>
        </div>

        <Card className="flex h-[calc(100vh-14rem)]">
            {/* Conversation List Panel */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search conversations..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-grow">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-2" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Clients will message you about their job postings</p>
                      </div>
                    ) : (
                      filteredConversations.map(convo => {
                        const otherParticipantId = convo.participants.find(p => p !== user?.uid);
                        const otherParticipantInfo = otherParticipantId ? convo.participantDetails[otherParticipantId] : null;
                        const otherParticipantName = otherParticipantInfo?.name || 'Unknown';
                        const avatarUrl = otherParticipantId ? participantAvatars[otherParticipantId] : '';
                        const isUnread = isConversationUnread(convo);
                        const unreadCount = getUnreadCount(convo);
                        
                        return (
                          <button
                              key={convo.id}
                              onClick={() => setSelectedConversationId(convo.id)}
                              className={cn(
                                  "flex w-full items-start gap-4 p-4 text-left hover:bg-accent transition-colors border-b",
                                  selectedConversationId === convo.id && 'bg-accent border-l-4 border-l-primary'
                              )}
                          >
                              <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                                  <AvatarImage src={avatarUrl} alt={otherParticipantName} />
                                  <AvatarFallback>{otherParticipantName.substring(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center gap-2 mb-1">
                                      <p className={cn("font-semibold truncate flex-1", isUnread && "font-bold")}>{otherParticipantName}</p>
                                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(convo.lastMessageTimestamp)}</p>
                                        {unreadCount > 0 && (
                                          <Badge variant="destructive" className="h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center text-xs font-bold">
                                            {unreadCount}
                                          </Badge>
                                        )}
                                      </div>
                                  </div>
                                  <p className={cn("text-sm text-muted-foreground truncate", isUnread && "font-semibold text-foreground")}>{convo.lastMessage || 'No messages yet'}</p>
                              </div>
                          </button>
                        );
                      })
                    )}
                </ScrollArea>
            </div>

            {/* Message View Panel */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation && otherParticipant ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParticipantId ? participantAvatars[otherParticipantId] : ''} alt={otherParticipant.name} />
                                <AvatarFallback>{otherParticipant.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold">{otherParticipant.name}</p>
                                  {getUnreadCount(selectedConversation) > 0 && (
                                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-xs font-bold">
                                      {getUnreadCount(selectedConversation)} unread
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">{otherParticipant.role}</p>
                                  {otherParticipantId && participantAvailability[otherParticipantId] && (
                                    <Badge 
                                      variant={getAvailabilityBadge(participantAvailability[otherParticipantId]).variant}
                                      className="text-xs flex items-center gap-1"
                                    >
                                      <span 
                                        className={cn(
                                          "h-2 w-2 rounded-full",
                                          getAvailabilityBadge(participantAvailability[otherParticipantId]).color
                                        )}
                                      />
                                      {getAvailabilityBadge(participantAvailability[otherParticipantId]).text}
                                    </Badge>
                                  )}
                                </div>
                            </div>
                        </div>
                        
                        <ScrollArea className="flex-grow p-4 bg-muted/20">
                            <div className="space-y-4">
                                {messages.map(msg => {
                                  const isCurrentUser = msg.senderId === user?.uid;
                                  return (
                                    <div key={msg.id} className={cn(
                                        "flex gap-3",
                                        isCurrentUser ? 'justify-end' : 'justify-start'
                                    )}>
                                        {!isCurrentUser && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{otherParticipant.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                                            isCurrentUser 
                                              ? 'bg-primary text-primary-foreground dark:bg-primary/90' 
                                              : 'bg-muted text-foreground dark:bg-muted/80'
                                        )}>
                                            {msg.fileUrl && (
                                              <a 
                                                href={msg.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={cn(
                                                  "flex items-center gap-2 mb-2 p-2 rounded border transition-colors",
                                                  isCurrentUser 
                                                    ? 'border-primary-foreground/20 hover:bg-primary-foreground/10' 
                                                    : 'border-border hover:bg-accent'
                                                )}
                                              >
                                                <FileText className="h-4 w-4" />
                                                <span className="text-sm flex-1 truncate">{msg.fileName}</span>
                                                <Download className="h-4 w-4" />
                                              </a>
                                            )}
                                            {msg.text && <p className="text-sm">{msg.text}</p>}
                                            <div className="flex items-center justify-between mt-1">
                                              <p className={cn(
                                                  "text-xs opacity-70"
                                              )}>
                                                {formatTimestamp(msg.createdAt)}
                                              </p>
                                              {isCurrentUser && (
                                                <span className="text-xs">
                                                  {renderReadReceipt(msg)}
                                                </span>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                  );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="space-y-2">
                                {selectedFile && (
                                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {(selectedFile.size / 1024).toFixed(1)} KB
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleRemoveFile}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      onChange={handleFileSelect}
                                      className="hidden"
                                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => fileInputRef.current?.click()}
                                      disabled={sending || uploadingFile}
                                      className="px-3"
                                    >
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input 
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        autoComplete="off"
                                        disabled={sending || uploadingFile}
                                    />
                                    <Button type="submit" disabled={sending || uploadingFile || (!newMessage.trim() && !selectedFile)}>
                                        {(sending || uploadingFile) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                        <div className="rounded-full bg-primary/10 p-6 mb-4">
                          <MessageSquare className="h-16 w-16 text-primary"/>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                        <p className="text-sm max-w-md">Choose a conversation from the left to view messages and continue chatting with clients.</p>
                    </div>
                )}
            </div>
        </Card>
    </div>
  );
}
