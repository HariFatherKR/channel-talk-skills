#!/usr/bin/env python3
"""
채널톡 API 호출 헬퍼 스크립트

사용법:
  python channel-api.py users list
  python channel-api.py users get <user_id>
  python channel-api.py chats list [--state=opened|closed]
  python channel-api.py chats get <chat_id>
  python channel-api.py message send --chat-id <chat_id> --message "텍스트"
  python channel-api.py webhook test
"""

import argparse
import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

BASE_URL = "https://api.channel.io"

def get_headers():
    """인증 헤더 반환"""
    access_key = os.getenv("CHANNEL_TALK_ACCESS_KEY")
    secret = os.getenv("CHANNEL_TALK_SECRET")

    if not access_key or not secret:
        print("Error: CHANNEL_TALK_ACCESS_KEY와 CHANNEL_TALK_SECRET 환경변수를 설정하세요.")
        print("  .env 파일에 다음을 추가:")
        print("  CHANNEL_TALK_ACCESS_KEY=your_access_key")
        print("  CHANNEL_TALK_SECRET=your_secret")
        sys.exit(1)

    return {
        "x-access-key": access_key,
        "x-access-secret": secret,
        "Content-Type": "application/json"
    }

def api_request(method: str, endpoint: str, data: dict = None):
    """API 요청 실행"""
    url = f"{BASE_URL}{endpoint}"
    headers = get_headers()

    request = Request(url, method=method, headers=headers)

    if data:
        request.data = json.dumps(data).encode("utf-8")

    try:
        with urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"API Error ({e.code}): {error_body}")
        sys.exit(1)

def cmd_users_list(args):
    """유저 목록 조회"""
    result = api_request("GET", "/open/v5/users")
    print(json.dumps(result, indent=2, ensure_ascii=False))

def cmd_users_get(args):
    """유저 상세 조회"""
    result = api_request("GET", f"/open/v5/users/{args.user_id}")
    print(json.dumps(result, indent=2, ensure_ascii=False))

def cmd_chats_list(args):
    """채팅 목록 조회"""
    endpoint = "/open/v5/user-chats"
    if args.state:
        endpoint += f"?state={args.state}"
    result = api_request("GET", endpoint)
    print(json.dumps(result, indent=2, ensure_ascii=False))

def cmd_chats_get(args):
    """채팅 상세 조회"""
    result = api_request("GET", f"/open/v5/user-chats/{args.chat_id}")
    print(json.dumps(result, indent=2, ensure_ascii=False))

def cmd_message_send(args):
    """메시지 전송"""
    data = {
        "blocks": [
            {"type": "text", "value": args.message}
        ]
    }
    result = api_request("POST", f"/open/v5/user-chats/{args.chat_id}/messages", data)
    print(json.dumps(result, indent=2, ensure_ascii=False))

def cmd_webhook_test(args):
    """웹훅 테스트 (환경 확인)"""
    print("웹훅 테스트")
    print("=" * 40)
    print(f"Access Key: {'설정됨' if os.getenv('CHANNEL_TALK_ACCESS_KEY') else '미설정'}")
    print(f"Secret: {'설정됨' if os.getenv('CHANNEL_TALK_SECRET') else '미설정'}")
    print()
    print("채널톡 설정 > 웹훅에서 웹훅 URL을 등록하세요.")
    print("예: https://your-domain.com/api/channel-talk/webhook")

def main():
    parser = argparse.ArgumentParser(description="채널톡 API 헬퍼")
    subparsers = parser.add_subparsers(dest="command")

    # users 명령어
    users_parser = subparsers.add_parser("users", help="유저 관련 API")
    users_sub = users_parser.add_subparsers(dest="action")

    users_list = users_sub.add_parser("list", help="유저 목록 조회")
    users_list.set_defaults(func=cmd_users_list)

    users_get = users_sub.add_parser("get", help="유저 상세 조회")
    users_get.add_argument("user_id", help="유저 ID")
    users_get.set_defaults(func=cmd_users_get)

    # chats 명령어
    chats_parser = subparsers.add_parser("chats", help="채팅 관련 API")
    chats_sub = chats_parser.add_subparsers(dest="action")

    chats_list = chats_sub.add_parser("list", help="채팅 목록 조회")
    chats_list.add_argument("--state", choices=["opened", "closed"], help="상태 필터")
    chats_list.set_defaults(func=cmd_chats_list)

    chats_get = chats_sub.add_parser("get", help="채팅 상세 조회")
    chats_get.add_argument("chat_id", help="채팅 ID")
    chats_get.set_defaults(func=cmd_chats_get)

    # message 명령어
    message_parser = subparsers.add_parser("message", help="메시지 관련 API")
    message_sub = message_parser.add_subparsers(dest="action")

    message_send = message_sub.add_parser("send", help="메시지 전송")
    message_send.add_argument("--chat-id", required=True, help="채팅 ID")
    message_send.add_argument("--message", required=True, help="메시지 내용")
    message_send.set_defaults(func=cmd_message_send)

    # webhook 명령어
    webhook_parser = subparsers.add_parser("webhook", help="웹훅 관련")
    webhook_sub = webhook_parser.add_subparsers(dest="action")

    webhook_test = webhook_sub.add_parser("test", help="웹훅 설정 확인")
    webhook_test.set_defaults(func=cmd_webhook_test)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
