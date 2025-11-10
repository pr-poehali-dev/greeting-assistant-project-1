'''
Business: Telegram Bot CRM - управление клиентами через команды бота
Args: event with httpMethod, body, queryStringParameters
Returns: HTTP response with statusCode, headers, body
'''
import json
import os
from typing import Dict, Any, Optional
import urllib.request
import urllib.parse
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_API_BASE = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}'
DATABASE_URL = os.environ.get('DATABASE_URL', '')


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def telegram_api_request(method: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Make request to Telegram Bot API"""
    url = f'{TELEGRAM_API_BASE}/{method}'
    data = urllib.parse.urlencode(params).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))


def send_message(chat_id: int, text: str, parse_mode: str = 'HTML'):
    """Send message to Telegram chat"""
    return telegram_api_request('sendMessage', {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    })


def save_or_update_client(chat_id: int, username: str = None, first_name: str = None, last_name: str = None) -> int:
    """Save new client or update existing one, return client_id"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM clients WHERE telegram_chat_id = %s",
                (chat_id,)
            )
            result = cur.fetchone()
            
            if result:
                client_id = result['id']
                cur.execute(
                    """UPDATE clients 
                       SET telegram_username = %s, first_name = %s, last_name = %s, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (username, first_name, last_name, client_id)
                )
            else:
                cur.execute(
                    """INSERT INTO clients (telegram_chat_id, telegram_username, first_name, last_name)
                       VALUES (%s, %s, %s, %s)
                       RETURNING id""",
                    (chat_id, username, first_name, last_name)
                )
                client_id = cur.fetchone()['id']
            
            conn.commit()
            return client_id
    finally:
        conn.close()


def save_message(client_id: int, telegram_message_id: int, text: str, from_type: str, username: str = None):
    """Save message to database"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO messages (client_id, telegram_message_id, text, from_type, username)
                   VALUES (%s, %s, %s, %s, %s)""",
                (client_id, telegram_message_id, text, from_type, username)
            )
            conn.commit()
    finally:
        conn.close()


def get_clients_list() -> str:
    """Get formatted list of all clients"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT id, telegram_username, first_name, last_name, status, created_at
                   FROM clients 
                   ORDER BY updated_at DESC
                   LIMIT 20"""
            )
            clients = cur.fetchall()
            
            if not clients:
                return "📋 <b>Список клиентов пуст</b>\n\nДобавьте первого клиента с помощью команды /add"
            
            result = "📋 <b>Ваши клиенты:</b>\n\n"
            for client in clients:
                name = client['first_name'] or client['telegram_username'] or f"ID{client['id']}"
                if client['last_name']:
                    name += f" {client['last_name']}"
                
                status_icon = "✅" if client['status'] == 'active' else "⏸"
                username_text = f"@{client['telegram_username']}" if client['telegram_username'] else ""
                
                result += f"{status_icon} <b>{name}</b> {username_text}\n"
                result += f"   ID: {client['id']}\n\n"
            
            return result
    finally:
        conn.close()


def get_client_info(client_id: int) -> str:
    """Get detailed client information"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT * FROM clients WHERE id = %s""",
                (client_id,)
            )
            client = cur.fetchone()
            
            if not client:
                return f"❌ Клиент с ID {client_id} не найден"
            
            name = client['first_name'] or client['telegram_username'] or f"ID{client['id']}"
            if client['last_name']:
                name += f" {client['last_name']}"
            
            result = f"👤 <b>{name}</b>\n\n"
            if client['telegram_username']:
                result += f"📱 @{client['telegram_username']}\n"
            if client['phone']:
                result += f"📞 {client['phone']}\n"
            if client['email']:
                result += f"📧 {client['email']}\n"
            
            result += f"\n📊 Статус: {client['status']}\n"
            result += f"📅 Добавлен: {client['created_at'].strftime('%d.%m.%Y')}\n"
            
            if client['notes']:
                result += f"\n📝 Заметки:\n{client['notes']}\n"
            
            cur.execute(
                """SELECT COUNT(*) as count FROM messages WHERE client_id = %s""",
                (client_id,)
            )
            msg_count = cur.fetchone()['count']
            result += f"\n💬 Всего сообщений: {msg_count}"
            
            return result
    finally:
        conn.close()


def process_command(chat_id: int, text: str, username: str, first_name: str) -> str:
    """Process bot commands"""
    parts = text.split(maxsplit=1)
    command = parts[0].lower()
    args = parts[1] if len(parts) > 1 else ""
    
    if command == '/start':
        save_or_update_client(chat_id, username, first_name, None)
        return """👋 <b>Добро пожаловать в TG CRM!</b>

Я помогу вам управлять клиентами прямо в Telegram.

<b>Доступные команды:</b>

📋 /list - список всех клиентов
➕ /add - добавить нового клиента
👤 /info [ID] - информация о клиенте
✏️ /edit [ID] - редактировать клиента
❌ /delete [ID] - удалить клиента

Просто напишите мне, и я автоматически сохраню контакт!"""
    
    elif command == '/list':
        return get_clients_list()
    
    elif command == '/info':
        if not args.isdigit():
            return "❌ Укажите ID клиента: /info 1"
        return get_client_info(int(args))
    
    elif command == '/add':
        return """➕ <b>Добавить клиента</b>

Перешлите мне сообщение от клиента, и я автоматически добавлю его в базу!

Или используйте формат:
/save Имя Фамилия @username +79001234567"""
    
    elif command == '/save':
        if not args:
            return "❌ Укажите данные клиента"
        
        save_or_update_client(chat_id, username, args, None)
        return f"✅ Клиент сохранён!\n\n{args}"
    
    else:
        save_or_update_client(chat_id, username, first_name, None)
        save_message(
            client_id=save_or_update_client(chat_id, username, first_name, None),
            telegram_message_id=0,
            text=text,
            from_type='client',
            username=username or first_name
        )
        return "✅ Сообщение сохранено!\n\nИспользуйте /list для просмотра всех клиентов"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if 'message' in body_data:
            msg = body_data['message']
            chat = msg.get('chat', {})
            from_user = msg.get('from', {})
            text = msg.get('text', '')
            
            chat_id = chat.get('id')
            username = from_user.get('username')
            first_name = from_user.get('first_name', 'Клиент')
            
            response_text = ""
            
            if text.startswith('/'):
                response_text = process_command(chat_id, text, username, first_name)
            else:
                client_id = save_or_update_client(
                    chat_id=chat_id,
                    username=username,
                    first_name=first_name,
                    last_name=from_user.get('last_name')
                )
                
                save_message(
                    client_id=client_id,
                    telegram_message_id=msg.get('message_id'),
                    text=text,
                    from_type='client',
                    username=username or first_name
                )
                
                response_text = "✅ Сохранено!"
            
            if TELEGRAM_BOT_TOKEN:
                try:
                    send_message(chat_id, response_text)
                except:
                    pass
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        action = event.get('queryStringParameters', {}).get('action', 'getClients')
        
        if action == 'getClients':
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """SELECT id, telegram_chat_id, telegram_username, first_name, last_name, 
                                  phone, email, status, created_at
                           FROM clients 
                           ORDER BY updated_at DESC"""
                    )
                    clients = cur.fetchall()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'clients': clients}, default=str),
                        'isBase64Encoded': False
                    }
            finally:
                conn.close()
        
        elif action == 'getMessages':
            client_id = event.get('queryStringParameters', {}).get('client_id')
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id required'}),
                    'isBase64Encoded': False
                }
            
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """SELECT id, telegram_message_id, text, from_type, username, created_at
                           FROM messages 
                           WHERE client_id = %s
                           ORDER BY created_at ASC""",
                        (client_id,)
                    )
                    messages = cur.fetchall()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'messages': messages}, default=str),
                        'isBase64Encoded': False
                    }
            finally:
                conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }