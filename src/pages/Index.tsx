import { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
    { id: 'clients', label: 'Клиенты', icon: 'Users' },
    { id: 'deals', label: 'Сделки', icon: 'TrendingUp' },
    { id: 'tasks', label: 'Задачи', icon: 'CheckSquare' },
    { id: 'settings', label: 'Настройки', icon: 'Settings' },
  ];

  const stats = [
    { label: 'Всего клиентов', value: '1,248', change: '+12%', icon: 'Users', color: 'text-blue-600' },
    { label: 'Активные сделки', value: '86', change: '+8%', icon: 'TrendingUp', color: 'text-green-600' },
    { label: 'Выполнено задач', value: '342', change: '+24%', icon: 'CheckCircle2', color: 'text-purple-600' },
    { label: 'Подключено каналов', value: '14', change: '+2', icon: 'MessageSquare', color: 'text-orange-600' },
  ];

  const clients = [
    { id: 1, name: 'Александр Иванов', username: '@alex_ivanov', status: 'active', tags: ['VIP', 'Постоянный'], lastMessage: '2 часа назад', avatar: 'АИ' },
    { id: 2, name: 'Мария Петрова', username: '@maria_p', status: 'new', tags: ['Новый'], lastMessage: '5 минут назад', avatar: 'МП' },
    { id: 3, name: 'Дмитрий Смирнов', username: '@dmitry_s', status: 'active', tags: ['Постоянный'], lastMessage: '1 день назад', avatar: 'ДС' },
    { id: 4, name: 'Елена Козлова', username: '@elena_k', status: 'inactive', tags: ['Холодный'], lastMessage: '5 дней назад', avatar: 'ЕК' },
  ];

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
                        <Badge variant="secondary" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                        <Icon name={stat.icon} size={24} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Активные сделки
                  </h3>
                  <div className="space-y-4">
                    {deals.slice(0, 3).map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{deal.client}</p>
                          <p className="text-sm text-muted-foreground">{deal.channel}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{deal.amount}</p>
                          <Badge variant="outline" className="mt-1">{deal.stage}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Посмотреть все сделки
                  </Button>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="CheckSquare" size={20} />
                    Задачи на сегодня
                  </h3>
                  <div className="space-y-3">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{task.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Все задачи
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Клиенты</h2>
                  <p className="text-muted-foreground">База контактов из Telegram</p>
                </div>
                <Button className="gap-2">
                  <Icon name="Plus" size={20} />
                  Добавить клиента
                </Button>
              </div>

              <Card className="p-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input placeholder="Поиск по имени или username..." />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все клиенты</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="new">Новые</SelectItem>
                      <SelectItem value="inactive">Неактивные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">{client.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.username}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {client.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{client.lastMessage}</p>
                        <Badge variant={
                          client.status === 'active' ? 'default' :
                          client.status === 'new' ? 'secondary' : 'outline'
                        } className="mt-1">
                          {client.status === 'active' ? 'Активен' : client.status === 'new' ? 'Новый' : 'Неактивен'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Icon name="MessageSquare" size={20} />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Сделки</h2>
                  <p className="text-muted-foreground">Воронка продаж и активные сделки</p>
                </div>
                <Button className="gap-2">
                  <Icon name="Plus" size={20} />
                  Создать сделку
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {['Новая заявка', 'Переговоры', 'Согласование', 'Оплата'].map((stage, index) => (
                  <Card key={stage} className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center justify-between">
                      {stage}
                      <Badge variant="secondary">{deals.filter(d => d.stage === stage).length}</Badge>
                    </h3>
                    <div className="space-y-3">
                      {deals.filter(d => d.stage === stage).map((deal) => (
                        <div key={deal.id} className="p-3 bg-muted/50 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer">
                          <p className="font-medium text-sm mb-1">{deal.client}</p>
                          <p className="text-lg font-bold text-primary mb-2">{deal.amount}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Вероятность</span>
                              <span>{deal.probability}%</span>
                            </div>
                            <Progress value={deal.probability} className="h-1.5" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Icon name="MessageSquare" size={12} />
                            {deal.channel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Задачи</h2>
                  <p className="text-muted-foreground">Планирование и контроль выполнения</p>
                </div>
                <Button className="gap-2">
                  <Icon name="Plus" size={20} />
                  Новая задача
                </Button>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">Все задачи</TabsTrigger>
                  <TabsTrigger value="pending">В работе</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <Card className="p-6">
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer ${
                            task.status === 'completed' ? 'bg-primary border-primary' : 'border-muted-foreground'
                          }`}>
                            {task.status === 'completed' && <Icon name="Check" size={12} className="text-primary-foreground" />}
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="Clock" size={14} />
                                {task.dueDate}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {task.assignee}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            task.status === 'completed' ? 'secondary' :
                            task.status === 'in_progress' ? 'default' : 'outline'
                          }>
                            {task.status === 'completed' ? 'Завершено' :
                             task.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Icon name="MoreVertical" size={20} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Настройки</h2>
                <p className="text-muted-foreground">Управление аккаунтами и интеграциями</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Telegram аккаунты</h3>
                    <p className="text-sm text-muted-foreground mt-1">Подключенные каналы и чаты</p>
                  </div>
                  <Button className="gap-2">
                    <Icon name="Plus" size={20} />
                    Добавить аккаунт
                  </Button>
                </div>

                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          channel.type === 'channel' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <Icon name={channel.type === 'channel' ? 'Radio' : 'Users'} size={24} className={
                            channel.type === 'channel' ? 'text-blue-600' : 'text-green-600'
                          } />
                        </div>
                        <div>
                          <p className="font-semibold">{channel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {channel.type === 'channel' 
                              ? `${channel.subscribers?.toLocaleString()} подписчиков`
                              : `${channel.members} участников`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
                <h3 className="text-xl font-semibold mb-4">Автоматизация</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Автоответчик сообщений</p>
                      <p className="text-sm text-muted-foreground">Автоматические ответы на входящие сообщения</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Роли и права доступа</p>
                      <p className="text-sm text-muted-foreground">Управление доступом сотрудников к функциям</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Переадресация сообщений</p>
                      <p className="text-sm text-muted-foreground">Автоматическое распределение диалогов между операторами</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
};

export default Index;
