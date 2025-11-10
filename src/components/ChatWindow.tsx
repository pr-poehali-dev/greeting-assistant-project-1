import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'client';
  timestamp: string;
  username?: string;
}

interface Client {
  id: number;
  name: string;
  username: string;
  avatar: string;
  chatId: number;
}

interface ChatWindowProps {
  client: Client;
  onClose: () => void;
}

const TELEGRAM_API_URL = 'https://functions.poehali.dev/45932f98-ca2f-4788-97f1-698148a33b67';

const ChatWindow = ({ client, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUpdateIdRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const offset = lastUpdateIdRef.current > 0 ? lastUpdateIdRef.current + 1 : -1;
      const response = await fetch(`${TELEGRAM_API_URL}?action=getUpdates&offset=${offset}`);
      const data = await response.json();

      if (data.ok && data.result && data.result.length > 0) {
        const newMessages: Message[] = [];

        data.result.forEach((update: any) => {
          if (update.message && update.message.chat.id === client.chatId) {
            const msg = update.message;
            newMessages.push({
              id: msg.message_id,
              text: msg.text || '',
              from: msg.from.is_bot ? 'user' : 'client',
              timestamp: new Date(msg.date * 1000).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              username: msg.from.username || msg.from.first_name,
            });

            if (update.update_id > lastUpdateIdRef.current) {
              lastUpdateIdRef.current = update.update_id;
            }
          }
        });

        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [client.chatId]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch(TELEGRAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          chat_id: client.chatId,
          text: inputText,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        const newMessage: Message = {
          id: data.result.message_id,
          text: inputText,
          from: 'user',
          timestamp: new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {client.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{client.name}</p>
            <p className="text-sm text-muted-foreground">{client.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Phone" size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Загрузка сообщений...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет сообщений</p>
              <p className="text-sm text-muted-foreground mt-1">
                Начните переписку с клиентом
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.from === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.from === 'client' && message.username && (
                    <p className="text-xs font-semibold mb-1 text-primary">
                      {message.username}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.from === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Paperclip" size={20} />
          </Button>
          <Input
            placeholder="Введите сообщение..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isSending || !inputText.trim()}>
            {isSending ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              <Icon name="Send" size={20} />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;
