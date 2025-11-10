import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ChatWindow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

type TabType = 'dashboard' | 'clients' | 'deals' | 'tasks' | 'settings';

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithChat | null>(null);
  const [clients, setClients] = useState<ClientWithChat[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const sidebarItems = [
    { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
    { id: 'clients', label: 'Клиенты', icon: 'Users' },
    { id: 'deals', label: 'Сделки', icon: 'TrendingUp' },
    { id: 'tasks', label: 'Задачи', icon: 'CheckSquare' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' },
  ];

  const stats = [
    { label: 'Всего клиентов', value: clients.length.toString(), change: '+12%', icon: 'Users', color: 'text-blue-600' },
    { label: 'Активные сделки', value: '86', change: '+8%', icon: 'TrendingUp', color: 'text-green-600' },
    { label: 'Выполнено задач', value: '342', change: '+24%', icon: 'CheckCircle2', color: 'text-purple-600' },
    { label: 'Подключено каналов', value: '14', change: '+2', icon: 'MessageSquare', color: 'text-orange-600' },
  ];

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch(`${TELEGRAM_API_URL}?action=getClients`);
        const data = await response.json();
        
        if (data.clients) {
          const formattedClients = data.clients.map((client: any) => ({
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
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
    const interval = setInterval(loadClients, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncMessages = async () => {
      try {
        await fetch(`${TELEGRAM_API_URL}?action=syncUpdates&offset=-1`);
      } catch (error) {
        console.error('Error syncing messages:', error);
      }
    };

    syncMessages();
    const interval = setInterval(syncMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const deals = [
    { id: 1, client: 'Александр Иванов', amount: '150,000 ₽', stage: 'Переговоры', probability: 75, channel: 'Telegram Premium' },
    { id: 2, client: 'Мария Петрова', amount: '85,000 ₽', stage: 'Новая заявка', probability: 30, channel: 'Канал поддержки' },
    { id: 3, client: 'Дмитрий Смирнов', amount: '220,000 ₽', stage: 'Согласование', probability: 90, channel: 'VIP чат' },
    { id: 4, client: 'Анна Волкова', amount: '45,000 ₽', stage: 'Оплата', probability: 95, channel: 'Основной канал' },
  ];

  const tasks = [
    { id: 1, title: 'Связаться с клиентом Ивановым', priority: 'high', dueDate: 'Сегодня, 15:00', assignee: 'Вы', status: 'pending' },
    { id: 2, title: 'Подготовить коммерческое предложение', priority: 'medium', dueDate: 'Завтра, 12:00', assignee: 'Менеджер А.', status: 'in_progress' },
    { id: 3, title: 'Настроить автоответчик в канале', priority: 'low', dueDate: 'Через 3 дня', assignee: 'Тех. отдел', status: 'pending' },
    { id: 4, title: 'Провести обучение новых операторов', priority: 'medium', dueDate: 'Через 2 дня', assignee: 'Вы', status: 'completed' },
  ];

  const channels = [
    { id: 1, name: 'Основной канал', type: 'channel', subscribers: 12450, status: 'active' },
    { id: 2, name: 'VIP клиенты', type: 'group', members: 127, status: 'active' },
    { id: 3, name: 'Поддержка 24/7', type: 'group', members: 8, status: 'active' },
    { id: 4, name: 'Новости компании', type: 'channel', subscribers: 8920, status: 'active' },
  ];

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
                className={`w-full justify-start gap-3 ${
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
              <AvatarFallback className="bg-primary text-primary-foreground">АП</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Администратор</p>
              <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
            </div>
            <Button size="icon" variant="ghost" className="text-sidebar-foreground">
              <Icon name="MoreVertical" size={20} />
            </Button>
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
                  placeholder="Поиск по клиентам, сделкам, задачам..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="icon">
                <Icon name="Bell" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="HelpCircle" size={20} />
              </Button>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Добро пожаловать в CRM!</h2>
                <p className="text-muted-foreground">Управляйте клиентами, сделками и задачами в одном месте</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Последние сделки</h3>
                    <Button variant="ghost" size="sm">
                      Все сделки
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {deals.slice(0, 3).map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{deal.client}</p>
                          <p className="text-sm text-muted-foreground">{deal.stage}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{deal.amount}</p>
                          <p className="text-sm text-muted-foreground">{deal.probability}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Задачи на сегодня</h3>
                    <Button variant="ghost" size="sm">
                      Все задачи
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.dueDate.includes('Сегодня')).map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                        <div className="mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' : 
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Клиенты</h2>
                  <p className="text-muted-foreground">Управление базой клиентов</p>
                </div>
                <Button>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить клиента
                </Button>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center py-12">
                      <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Icon name="Users" size={64} className="text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Нет клиентов</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Напишите боту в Telegram (@srmtgbot),<br />
                        и контакт появится здесь автоматически
                      </p>
                      <Button variant="outline" onClick={() => window.open('https://t.me/srmtgbot', '_blank')}>
                        <Icon name="Send" size={20} className="mr-2" />
                        Написать боту
                      </Button>
                    </div>
                  ) : (
                    clients.filter(c => 
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.username.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
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
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Активен
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedClient(client)}
                          >
                            <Icon name="MessageCircle" size={20} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Сделки</h2>
                  <p className="text-muted-foreground">Отслеживайте прогресс ваших продаж</p>
                </div>
                <Button>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Новая сделка
                </Button>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{deal.client}</p>
                          <p className="text-sm text-muted-foreground">{deal.channel}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-primary">{deal.amount}</p>
                          <Badge variant="secondary">{deal.stage}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Вероятность закрытия</span>
                          <span className="font-medium">{deal.probability}%</span>
                        </div>
                        <Progress value={deal.probability} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Задачи</h2>
                  <p className="text-muted-foreground">Планируйте и отслеживайте выполнение задач</p>
                </div>
                <Button>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать задачу
                </Button>
              </div>

              <div className="flex gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Фильтр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все задачи</SelectItem>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершенные</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {task.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {task.assignee}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status === 'completed' ? 'Выполнено' : 
                         task.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold">Настройки</h2>
                <p className="text-muted-foreground">Управление системой и интеграциями</p>
              </div>

              <div className="grid gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Telegram интеграция</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Статус подключения</p>
                        <p className="text-sm text-muted-foreground">Telegram Bot API активен</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Подключено
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Автосинхронизация</p>
                        <p className="text-sm text-muted-foreground">Автоматическое сохранение новых контактов</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Включено
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Каналы и группы</h3>
                  <div className="space-y-3">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name="Hash" size={20} className="text-muted-foreground" />
                          <div>
                            <p className="font-medium">{channel.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {channel.type === 'channel' 
                                ? `${channel.subscribers} подписчиков`
                                : `${(channel as any).members} участников`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Активен
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Icon name="Settings" size={20} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Автоматизация</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Автоответчик</p>
                        <p className="text-sm text-muted-foreground">Автоматические ответы на популярные вопросы</p>
                      </div>
                      <Button variant="outline">Настроить</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Переадресация сообщений</p>
                        <p className="text-sm text-muted-foreground">Автоматическое распределение диалогов между операторами</p>
                      </div>
                      <Button variant="outline">Настроить</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
    </>
  );
};

export default Index;
