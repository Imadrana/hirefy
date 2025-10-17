'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageSquare, Search, Send } from 'lucide-react';

const conversations = [
  {
    id: 'conv1',
    clientId: 'CLIENT001',
    clientName: 'Innovate Inc.',
    clientAvatar: 'https://placehold.co/100x100.png',
    lastMessage: 'You: Thanks for the opportunity!',
    lastMessageTimestamp: '1h ago',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'Innovate Inc.', text: 'Hi Alex! We were impressed with your proposal for the API Integration project and would like to hire you.', timestamp: '1 day ago' },
      { id: 'm2', sender: 'You', text: 'That\'s fantastic news! I\'m excited to get started. What are the next steps?', timestamp: '23h ago' },
      { id: 'm3', sender: 'Innovate Inc.', text: 'Please review the contract in your portal. Once you accept, we can fund the first milestone.', timestamp: '4h ago' },
      { id: 'm4', sender: 'You', text: 'Thanks for the opportunity!', timestamp: '1h ago' },
    ],
  },
  {
    id: 'conv2',
    clientId: 'CLIENT002',
    clientName: 'Tech Solutions Ltd.',
    clientAvatar: 'https://placehold.co/100x100.png',
    lastMessage: 'Great, I\'ve just sent over the credentials.',
    lastMessageTimestamp: '3h ago',
    unreadCount: 1,
     messages: [
      { id: 'm1', sender: 'You', text: 'Hi there, I\'m starting on the database migration today. Could you please provide access to the staging server?', timestamp: '5 hours ago' },
      { id: 'm2', sender: 'Tech Solutions Ltd.', text: 'Great, I\'ve just sent over the credentials.', timestamp: '3 hours ago' },
    ],
  },
  {
    id: 'conv3',
    clientId: 'CLIENT003',
    clientName: 'Shopify Gurus',
    clientAvatar: 'https://placehold.co/100x100.png',
    lastMessage: 'You: Following up on my proposal.',
    lastMessageTimestamp: '2d ago',
    unreadCount: 0,
     messages: [
       { id: 'm1', sender: 'You', text: 'Following up on my proposal.', timestamp: '2 days ago' },
    ],
  },
];


export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState(conversations[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log({
      conversationId: selectedConversation.id,
      text: newMessage,
    });
    
    const newMsg = { id: `m${Date.now()}`, sender: 'You', text: newMessage, timestamp: 'Just now'};
    const index = conversations.findIndex(c => c.id === selectedConversationId);
    if(index !== -1) {
        conversations[index].messages.push(newMsg);
        conversations[index].lastMessage = `You: ${newMessage}`;
    }

    setNewMessage('');
  }

  const filteredConversations = conversations.filter(c =>
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    {filteredConversations.map(convo => (
                        <button
                            key={convo.id}
                            onClick={() => setSelectedConversationId(convo.id)}
                            className={cn(
                                "flex w-full items-start gap-4 p-4 text-left hover:bg-accent transition-colors",
                                selectedConversationId === convo.id && 'bg-accent'
                            )}
                        >
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarImage src={convo.clientAvatar} alt={convo.clientName} />
                                <AvatarFallback>{convo.clientName.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold truncate">{convo.clientName}</p>
                                    <p className="text-xs text-muted-foreground">{convo.lastMessageTimestamp}</p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                    {convo.unreadCount > 0 && (
                                        <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {convo.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </ScrollArea>
            </div>

            {/* Message View Panel */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedConversation.clientAvatar} alt={selectedConversation.clientName} />
                                <AvatarFallback>{selectedConversation.clientName.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{selectedConversation.clientName}</p>
                            </div>
                        </div>
                        
                        <ScrollArea className="flex-grow p-4 bg-muted/20">
                            <div className="space-y-4">
                                {selectedConversation.messages.map(msg => (
                                    <div key={msg.id} className={cn(
                                        "flex gap-3",
                                        msg.sender === 'You' ? 'justify-end' : 'justify-start'
                                    )}>
                                        {msg.sender !== 'You' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={selectedConversation.clientAvatar} />
                                                <AvatarFallback>{selectedConversation.clientName.substring(0,2)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                                            msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-background'
                                        )}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={cn(
                                                "text-xs mt-1",
                                                msg.sender === 'You' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            )}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input 
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoComplete="off"
                                />
                                <Button type="submit">
                                    <Send className="h-4 w-4"/>
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
