import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Facebook,
  Instagram,
  Mail,
  Search,
  Phone,
  MoreVertical,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { messages as initialMessages } from '../data/mockData'
import { cn } from '../../lib/cn'
import type { Message, MessagePlatform } from '../types'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const platformConfig: Record<
  MessagePlatform,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  facebook: {
    icon: <Facebook size={14} />,
    label: 'Facebook',
    color: 'text-[#1877F2]',
    bg: 'bg-[#1877F2]',
  },
  instagram: {
    icon: <Instagram size={14} />,
    label: 'Instagram',
    color: 'text-[#E4405F]',
    bg: 'bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]',
  },
  direct: {
    icon: <Mail size={14} />,
    label: 'Direct',
    color: 'text-primary',
    bg: 'bg-primary',
  },
}

function formatTimestamp(ts: string) {
  const date = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString('en-PH', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

function formatChatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatChatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Messages() {
  const [messageList] = useState<Message[]>(initialMessages)
  const [activeId, setActiveId] = useState<string>(messageList[0]?.id ?? '')
  const [searchQuery, setSearchQuery] = useState('')

  const activeMessage = messageList.find((m) => m.id === activeId)

  const filteredMessages = messageList.filter(
    (m) =>
      m.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = messageList.filter((m) => m.unread).length

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Messages"
          subtitle={`Guest conversations · ${unreadCount} unread`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Messages' },
          ]}
        />
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-[16px] bg-white shadow-card"
      >
        <div className="flex w-[320px] shrink-0 flex-col border-r border-outline-variant">
          <div className="border-b border-outline-variant p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[12px] border border-outline-variant bg-surface-container-low py-2 pl-9 pr-4 font-body text-body-sm text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((msg) => {
              const platform = platformConfig[msg.platform]
              const isActive = msg.id === activeId

              return (
                <button
                  key={msg.id}
                  onClick={() => setActiveId(msg.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-outline-variant/50 p-4 text-left transition-colors',
                    isActive
                      ? 'bg-primary/5'
                      : 'hover:bg-surface-container-low',
                    msg.unread && !isActive && 'bg-primary/[0.02]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
                      platform.bg
                    )}
                  >
                    {platform.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate font-body text-body-sm',
                          msg.unread
                            ? 'font-semibold text-on-surface'
                            : 'font-medium text-on-surface'
                        )}
                      >
                        {msg.guestName}
                      </span>
                      <span className="shrink-0 font-body text-body-xs text-on-surface-variant">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={cn('shrink-0', platform.color)}>
                        {platform.icon}
                      </span>
                      <p
                        className={cn(
                          'truncate font-body text-body-xs',
                          msg.unread
                            ? 'font-medium text-on-surface'
                            : 'text-on-surface-variant'
                        )}
                      >
                        {msg.lastMessage}
                      </p>
                    </div>
                  </div>
                  {msg.unread && (
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}

            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center py-12">
                <MessageSquare
                  size={32}
                  className="mb-3 text-outline-variant"
                />
                <p className="font-body text-body-sm text-on-surface-variant">
                  No conversations found
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {activeMessage ? (
            <>
              <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-white',
                      platformConfig[activeMessage.platform].bg
                    )}
                  >
                    {platformConfig[activeMessage.platform].icon}
                  </div>
                  <div>
                    <h3 className="font-body text-body-md font-semibold text-on-surface">
                      {activeMessage.guestName}
                    </h3>
                    <p className="font-body text-body-xs text-on-surface-variant">
                      via{' '}
                      {platformConfig[activeMessage.platform].label}
                      {activeMessage.reservationId && (
                        <span>
                          {' '}
                          ·{' '}
                          <span className="text-primary">
                            {activeMessage.reservationId.toUpperCase()}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
                    <Phone size={18} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mb-4 text-center">
                  <span className="inline-block rounded-full bg-surface-container-high px-3 py-1 font-body text-body-xs text-on-surface-variant">
                    {formatChatDate(activeMessage.messages[0]?.timestamp ?? '')}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {activeMessage.messages.map((msg, i) => {
                    const isAdmin = msg.sender === 'admin'

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          'flex',
                          isAdmin ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-[16px] px-4 py-2.5',
                            isAdmin
                              ? 'rounded-br-[4px] bg-primary text-on-primary'
                              : 'rounded-bl-[4px] bg-surface-container-low text-on-surface'
                          )}
                        >
                          <p className="font-body text-body-sm leading-relaxed">
                            {msg.text}
                          </p>
                          <p
                            className={cn(
                              'mt-1 font-body text-[10px]',
                              isAdmin
                                ? 'text-on-primary/60'
                                : 'text-on-surface-variant/60'
                            )}
                          >
                            {formatChatTime(msg.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-outline-variant px-6 py-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    disabled
                    className="flex-1 rounded-[12px] border border-outline-variant bg-surface-container-low px-4 py-2.5 font-body text-body-sm text-on-surface placeholder:text-on-surface-variant/50"
                  />
                  <button
                    disabled
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant/50"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="mt-2 text-center font-body text-body-xs text-on-surface-variant/50">
                  Messaging is view-only. Respond directly on the platform.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <MessageSquare
                size={48}
                className="mb-4 text-outline-variant"
              />
              <p className="font-body text-body-md text-on-surface-variant">
                Select a conversation
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
