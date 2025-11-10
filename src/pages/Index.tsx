import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

type TabType = 'dashboard' | 'clients' | 'settings';

interface ClientWithChat {
  id: number;
  name: string;
  username: string;
  status: string;
  tags: string[];
  lastMessage: string;
  avatar: string;
  chatId: number;
}

const TELEGRAM_API_URL = 'https://functions.poehali.dev/45932f98-ca2f-4788-97f1-698148a33b67';
const CRM_URL = 'https://poehali.dev';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithChat | null>(null);
  const [clients, setClients] = useState<ClientWithChat[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalMessages: 0,
    todayMessages: 0
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
    { id: 'clients', label: 'Клиенты', icon: 'Users' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' },
  ];

  const statsDisplay = [
    { label: 'Всего клиентов', value: stats.totalClients.toString(), change: stats.activeClients > 0 ? `${stats.activeClients} активных` : 'Нет данных', icon: 'Users', color: 'text-blue-600' },
    { label: 'Сообщений сегодня', value: stats.todayMessages.toString(), change: `Всего ${stats.totalMessages}`, icon: 'MessageSquare', color: 'text-green-600' },
    { label: 'Активные диалоги', value: clients.filter(c => c.status === 'active').length.toString(), change: 'Онлайн', icon: 'MessageCircle', color: 'text-purple-600' },
    { label: 'Telegram бот', value: 'Работает', change: 'Подключен', icon: 'Bot', color: 'text-orange-600' },
  ];

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#1a1a1a');
      window.Telegram.WebApp.setBackgroundColor('#1a1a1a');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, statsRes] = await Promise.all([
          fetch(`${TELEGRAM_API_URL}?action=getClients`),
          fetch(`${TELEGRAM_API_URL}?action=getStats`)
        ]);
        
        const clientsData = await clientsRes.json();
        const statsData = await statsRes.json();
        
        if (clientsData.clients) {
          const formattedClients = clientsData.clients.map((client: any) => ({
            id: client.id,
            name: client.first_name && client.last_name 
              ? `${client.first_name} ${client.last_name}` 
              : client.first_name || client.telegram_username || 'Клиент',
            username: client.telegram_username ? `@${client.telegram_username}` : '',
            avatar: (client.first_name || client.telegram_username || 'K').charAt(0).toUpperCase(),
            chatId: client.telegram_chat_id,
            status: client.status || 'active',
            tags: [],
            lastMessage: 'Недавно'
          }));
          setClients(formattedClients);
        }
        
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <ChatWindow
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          </div>
        </div>
      )}
      <div className="flex h-screen bg-muted/30">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">TG CRM</h1>
              <p className="text-xs text-muted-foreground">Telegram Business</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
                onClick={() => setActiveTab(item.id as TabType)}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">АД</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Администратор</p>
              <p className="text-xs text-muted-foreground truncate">TG CRM</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по клиентам..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.open(CRM_URL, '_blank')}
                className="transition-all hover:scale-105"
              >
                <Icon name="ExternalLink" size={16} className="mr-2" />
                Открыть CRM
              </Button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Добро пожаловать в TG CRM!</h2>
                <p className="text-muted-foreground">Управляйте клиентами через Telegram</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsDisplay.map((stat, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className={`${stat.color}`}>
                        <Icon name={stat.icon} size={32} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Последние клиенты</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('clients')}
                    className="transition-colors hover:text-primary"
                  >
                    Все клиенты
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </div>
                {isLoadingClients ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Нет клиентов</p>
                    <p className="text-sm mt-2">Напишите боту /start чтобы добавить первого клиента</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.slice(0, 5).map((client) => (
                      <div 
                        key={client.id} 
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-all cursor-pointer hover:scale-[1.02]"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {client.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.username}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Icon name="MessageCircle" size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Zap" size={24} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Быстрый старт</h3>
                    <p className="text-sm text-muted-foreground">Добавьте своего Telegram бота и начните управлять клиентами</p>
                  </div>
                  <Button 
                    onClick={() => window.open('https://t.me/your_bot', '_blank')}
                    className="transition-all hover:scale-105"
                  >
                    Открыть бота
                    <Icon name="ExternalLink" size={16} className="ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Клиенты</h2>
                <p className="text-muted-foreground">Список всех ваших клиентов из Telegram</p>
              </div>

              {isLoadingClients ? (
                <div className="text-center py-12 text-muted-foreground">Загрузка клиентов...</div>
              ) : filteredClients.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Users" size={64} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold mb-2">Нет клиентов</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Попробуйте изменить запрос поиска' : 'Напишите боту чтобы добавить первого клиента'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.map((client) => (
                    <Card 
                      key={client.id} 
                      className="p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{client.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{client.username}</p>
                          <Badge 
                            variant="secondary" 
                            className="mt-2 text-xs bg-green-100 text-green-700"
                          >
                            {client.status}
                          </Badge>
                        </div>
                        <Button size="icon" variant="ghost" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                        }}>
                          <Icon name="MessageCircle" size={18} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Настройки</h2>
                <p className="text-muted-foreground">Управление системой</p>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Telegram Бот</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Статус бота</p>
                      <p className="text-sm text-muted-foreground">Бот активен и принимает сообщения</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Работает
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full transition-all hover:scale-[1.02]"
                    onClick={() => window.open('https://t.me/your_bot', '_blank')}
                  >
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Открыть бота в Telegram
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Интеграции</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between transition-all hover:bg-accent"
                    onClick={() => window.open(CRM_URL, '_blank')}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="ExternalLink" size={16} />
                      Основная CRM
                    </span>
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between transition-all hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="Database" size={16} />
                      База данных
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Подключена</Badge>
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
    </>
  );
};

export default Index;
