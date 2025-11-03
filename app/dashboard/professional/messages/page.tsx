/*Create a Next.js "use client" page called MessagesPage that implements a messaging interface for communicating with clients. Use React, TailwindCSS, shadcn/ui components, and lucide-react icons.

Requirements:

Maintain a list of conversations in a constant array with fields:

id, clientId, clientName, clientAvatar, lastMessage, lastMessageTimestamp, unreadCount, messages (array of {id, sender, text, timestamp})

Use state hooks:

selectedConversationId to track the active conversation

searchTerm for filtering conversations

newMessage for the message input

Include a conversation list panel on the left:

Search bar with a Search icon

Scrollable list of conversations

Highlight the selected conversation

Show client avatar using Avatar, unread message badge, last message, and timestamp

Include a message view panel on the right:

Header with client avatar and name

Scrollable message history

Messages aligned left/right based on sender (You vs client)

Messages styled with background colors (bg-primary for your messages)

Show timestamp below each message

Include input box at bottom to type and send new messages:

Input field and Button with Send icon

On submit, add new message to selected conversation and update lastMessage

Use cn utility for conditional classNames

Provide placeholder avatars for clients and fallback initials

Show a default empty state when no conversation is selected

Make the layout responsive with Card container, split 1/3 for conversation list and 2/3 for message view

Include all relevant lucide-react icons: MessageSquare, Search, Send

Generate the complete functional component code, including all imports, JSX structure, state management, search filter, message sending logic, and Tailwind styling.*/
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
}

interface Conversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, { name: string; email: string; role: string }>;
  lastMessage: string;
  lastMessageTimestamp: any;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedConversations: Conversation[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              participants: data.participants || [],
              participantDetails: data.participantDetails || {},
              lastMessage: data.lastMessage || '',
              lastMessageTimestamp: data.lastMessageTimestamp || null,
              messages: [],
            };
          });

          setConversations(fetchedConversations);
          
          // Select first conversation if none selected
          if (!selectedConversationId && fetchedConversations.length > 0) {
            setSelectedConversationId(fetchedConversations[0].id);
          }
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

      setMessages(fetchedMessages);
      
      // Scroll to bottom when messages change
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [db, selectedConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'conversations', selectedConversationId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.email?.split('@')[0] || 'You',
        text: newMessage,
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
      });

      // Update conversation with last message
      const conversationRef = doc(db, 'conversations', selectedConversationId);
      await updateDoc(conversationRef, {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setSending(false);
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
                        
                        return (
                          <button
                              key={convo.id}
                              onClick={() => setSelectedConversationId(convo.id)}
                              className={cn(
                                  "flex w-full items-start gap-4 p-4 text-left hover:bg-accent transition-colors",
                                  selectedConversationId === convo.id && 'bg-accent'
                              )}
                          >
                              <Avatar className="h-10 w-10 border-2 border-primary/20">
                                  <AvatarFallback>{otherParticipantName.substring(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow overflow-hidden">
                                  <div className="flex justify-between items-center">
                                      <p className="font-semibold truncate">{otherParticipantName}</p>
                                      <p className="text-xs text-muted-foreground">{formatTimestamp(convo.lastMessageTimestamp)}</p>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                      <p className="text-sm text-muted-foreground truncate">{convo.lastMessage || 'No messages yet'}</p>
                                  </div>
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
                                <AvatarFallback>{otherParticipant.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{otherParticipant.name}</p>
                                <p className="text-sm text-muted-foreground">{otherParticipant.role}</p>
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
                                            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-background'
                                        )}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={cn(
                                                "text-xs mt-1",
                                                isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            )}>{formatTimestamp(msg.createdAt)}</p>
                                        </div>
                                    </div>
                                  );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input 
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoComplete="off"
                                    disabled={sending}
                                />
                                <Button type="submit" disabled={sending || !newMessage.trim()}>
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <p className="text-lg">Select a conversation</p>
                        <p>Choose one of your contacts to start chatting.</p>
                    </div>
                )}
            </div>
        </Card>
    </div>
  );
}

