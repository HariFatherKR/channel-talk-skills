/**
 * 채널톡 SDK 초기화 컴포넌트 템플릿
 * 파일 위치: components/channel-talk/ChannelTalkProvider.tsx
 *
 * 사용법:
 * 1. npm install @channel.io/channel-web-sdk-loader
 * 2. 이 컴포넌트를 app/layout.tsx에서 사용
 */

'use client'

import { useEffect, useCallback } from 'react'
import * as ChannelService from '@channel.io/channel-web-sdk-loader'

// ============================================
// 타입 정의
// ============================================

interface UserProfile {
  name?: string
  email?: string
  mobileNumber?: string
  avatarUrl?: string
  [key: string]: any  // 커스텀 필드
}

interface ChannelTalkUser {
  id: string
  profile?: UserProfile
  memberHash?: string  // 보안용 해시 (서버에서 생성)
}

interface ChannelTalkProviderProps {
  children: React.ReactNode
  pluginKey: string
  user?: ChannelTalkUser
  language?: 'ko' | 'en' | 'ja'
  hideDefaultButton?: boolean
  zIndex?: number
}

// ============================================
// Provider 컴포넌트
// ============================================

export function ChannelTalkProvider({
  children,
  pluginKey,
  user,
  language = 'ko',
  hideDefaultButton = false,
  zIndex,
}: ChannelTalkProviderProps) {
  // 채널톡 초기화
  useEffect(() => {
    // 스크립트 로드
    ChannelService.loadScript()

    // Boot 옵션 설정
    const bootOption: ChannelService.BootOption = {
      pluginKey,
      language,
      hideChannelButtonOnBoot: hideDefaultButton,
    }

    if (zIndex) {
      bootOption.zIndex = zIndex
    }

    // 로그인 유저인 경우
    if (user) {
      bootOption.memberId = user.id

      if (user.memberHash) {
        bootOption.memberHash = user.memberHash
      }

      if (user.profile) {
        bootOption.profile = user.profile
      }
    }

    // Boot 실행
    ChannelService.boot(bootOption)

    // 클린업
    return () => {
      ChannelService.shutdown()
    }
  }, [pluginKey, user, language, hideDefaultButton, zIndex])

  return <>{children}</>
}

// ============================================
// 유틸리티 Hooks
// ============================================

/**
 * 채널톡 메서드를 사용하기 위한 Hook
 */
export function useChannelTalk() {
  // 채팅창 열기
  const openChat = useCallback(() => {
    ChannelService.showMessenger()
  }, [])

  // 채팅창 닫기
  const closeChat = useCallback(() => {
    ChannelService.hideMessenger()
  }, [])

  // 채팅 버튼 표시
  const showButton = useCallback(() => {
    ChannelService.showChannelButton()
  }, [])

  // 채팅 버튼 숨김
  const hideButton = useCallback(() => {
    ChannelService.hideChannelButton()
  }, [])

  // 이벤트 트래킹
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    ChannelService.track(eventName, properties)
  }, [])

  // 프로필 업데이트
  const updateProfile = useCallback((profile: UserProfile) => {
    ChannelService.updateUser({ profile })
  }, [])

  return {
    openChat,
    closeChat,
    showButton,
    hideButton,
    track,
    updateProfile,
  }
}

/**
 * 읽지 않은 메시지 수를 추적하는 Hook
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    ChannelService.onBadgeChanged((count: number) => {
      setUnreadCount(count)
    })
  }, [])

  return unreadCount
}

// useState import 누락 수정용
import { useState } from 'react'

// ============================================
// 커스텀 채팅 버튼 예시
// ============================================

interface CustomChatButtonProps {
  className?: string
}

export function CustomChatButton({ className }: CustomChatButtonProps) {
  const { openChat } = useChannelTalk()
  const unreadCount = useUnreadCount()

  return (
    <button
      onClick={openChat}
      className={className || 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors'}
    >
      💬 상담하기
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

// ============================================
// 사용 예시: app/layout.tsx
// ============================================

/*
import { ChannelTalkProvider } from '@/components/channel-talk/ChannelTalkProvider'
import { auth } from '@/lib/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // 로그인 유저 정보 설정
  const channelUser = session?.user ? {
    id: session.user.id,
    profile: {
      name: session.user.name,
      email: session.user.email,
      // 커스텀 필드
      plan: 'premium',
      signupDate: session.user.createdAt,
    }
  } : undefined

  return (
    <html lang="ko">
      <body>
        <ChannelTalkProvider
          pluginKey={process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY!}
          user={channelUser}
        >
          {children}
        </ChannelTalkProvider>
      </body>
    </html>
  )
}
*/

// ============================================
// 환경변수 설정
// ============================================

/*
# .env.local

# 클라이언트에서 사용 (NEXT_PUBLIC_ prefix 필수)
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=your_plugin_key

# 서버에서만 사용 (member hash 생성용)
CHANNEL_TALK_SECRET=your_secret
*/
