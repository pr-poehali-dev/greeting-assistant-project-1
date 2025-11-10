'''
Business: Telegram Bot API integration with auto-save contacts to database
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


def save_or_update_client(chat_id: int, username: str = None, first_name: str = None, last_name: str = None) -> int:
    """Save new client or update existing one, return client_id"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if client exists
            cur.execute(
                "SELECT id FROM clients WHERE telegram_chat_id = %s",
                (chat_id,)
            )
            result = cur.fetchone()
            
            if result:
                # Update existing client
                client_id = result['id']
                cur.execute(
                    """UPDATE clients 
                       SET telegram_username = %s, first_name = %s, last_name = %s, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (username, first_name, last_name, client_id)
                )
            else:
                # Insert new client
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


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
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
    
    # GET /telegram - various actions
    if method == 'GET':
        action = event.get('queryStringParameters', {}).get('action', 'getClients')
        
        if action == 'getClients':
            # Get all clients from database
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
            # Get messages for specific client
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
        
        elif action == 'syncUpdates':
            # Sync new messages from Telegram and save to DB
            offset = event.get('queryStringParameters', {}).get('offset', -1)
            result = telegram_api_request('getUpdates', {
                'offset': offset,
                'limit': 100,
                'timeout': 0
            })
            
            if result.get('ok') and result.get('result'):
                for update in result['result']:
                    if 'message' in update:
                        msg = update['message']
                        chat = msg.get('chat', {})
                        from_user = msg.get('from', {})
                        
                        # Save or update client
                        client_id = save_or_update_client(
                            chat_id=chat.get('id'),
                            username=from_user.get('username'),
                            first_name=from_user.get('first_name'),
                            last_name=from_user.get('last_name')
                        )
                        
                        # Save message
                        save_message(
                            client_id=client_id,
                            telegram_message_id=msg.get('message_id'),
                            text=msg.get('text', ''),
                            from_type='client',
                            username=from_user.get('username') or from_user.get('first_name')
                        )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'getUpdates':
            # Raw Telegram updates (backward compatibility)
            offset = event.get('queryStringParameters', {}).get('offset', -1)
            result = telegram_api_request('getUpdates', {
                'offset': offset,
                'limit': 100,
                'timeout': 0
            })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
    
    # POST /telegram - send message
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'sendMessage')
        
        if action == 'sendMessage':
            client_id = body_data.get('client_id')
            chat_id = body_data.get('chat_id')
            text = body_data.get('text')
            
            if not text or (not client_id and not chat_id):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'client_id/chat_id and text are required'}),
                    'isBase64Encoded': False
                }
            
            # Get chat_id from client_id if needed
            if client_id and not chat_id:
                conn = get_db_connection()
                try:
                    with conn.cursor() as cur:
                        cur.execute("SELECT telegram_chat_id FROM clients WHERE id = %s", (client_id,))
                        result = cur.fetchone()
                        if result:
                            chat_id = result['telegram_chat_id']
                finally:
                    conn.close()
            
            # Send message via Telegram
            result = telegram_api_request('sendMessage', {
                'chat_id': chat_id,
                'text': text
            })
            
            # Save sent message to database
            if result.get('ok') and client_id:
                save_message(
                    client_id=client_id,
                    telegram_message_id=result['result']['message_id'],
                    text=text,
                    from_type='user',
                    username='CRM Bot'
                )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
