'''
Business: Telegram Bot API integration for sending/receiving messages
Args: event with httpMethod, body, queryStringParameters
Returns: HTTP response with statusCode, headers, body
'''
import json
import os
from typing import Dict, Any, Optional
import urllib.request
import urllib.parse
import urllib.error

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_API_BASE = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}'


def telegram_api_request(method: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Make request to Telegram Bot API"""
    url = f'{TELEGRAM_API_BASE}/{method}'
    data = urllib.parse.urlencode(params).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))


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
    
    # GET /telegram/updates - get recent updates
    if method == 'GET':
        action = event.get('queryStringParameters', {}).get('action', 'getUpdates')
        
        if action == 'getUpdates':
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
        
        elif action == 'getMe':
            result = telegram_api_request('getMe', {})
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
            chat_id = body_data.get('chat_id')
            text = body_data.get('text')
            
            if not chat_id or not text:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'chat_id and text are required'}),
                    'isBase64Encoded': False
                }
            
            result = telegram_api_request('sendMessage', {
                'chat_id': chat_id,
                'text': text
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
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
