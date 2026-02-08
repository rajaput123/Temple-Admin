// Announcement Types
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type AnnouncementCategory = 'festival' | 'general' | 'emergency' | 'policy';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  description: string; // Rich text HTML
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  audience: AudienceFilter;
  linkedEventId?: string;
  linkedDonationCampaignId?: string;
  publishDate?: string; // ISO date
  expiryDate?: string; // ISO date
  attachments: Attachment[];
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export type MessageChannel = 'sms' | 'email' | 'whatsapp' | 'push';
export type MessageStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
export type MessageType = 'manual' | 'bulk' | 'scheduled' | 'automated';

export interface Message {
  id: string;
  type: MessageType;
  channel: MessageChannel;
  subject?: string; // For email
  content: string;
  recipientIds: string[]; // Devotee/Volunteer IDs
  recipientCount: number;
  status: MessageStatus;
  scheduledAt?: string; // ISO datetime
  sentAt?: string;
  costEstimate?: number; // For SMS
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  templateId?: string;
  createdBy: string;
  createdAt: string;
}

// Bulk Broadcast
export interface BulkBroadcast extends Message {
  audienceFilter: AudienceFilter;
  testRecipients?: string[]; // For test sends
  testSentAt?: string;
}

// Scheduled Message
export interface ScheduledMessage extends Message {
  recurrence?: RecurrenceRule;
  nextRunAt?: string;
  lastRunAt?: string;
  runCount: number;
  maxRuns?: number;
}

// Recurrence
export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  dayOfMonth?: number;
  endDate?: string;
  endAfter?: number; // Number of occurrences
}

// Audience Filter
export interface AudienceFilter {
  type: 'all' | 'donors' | 'volunteers' | 'custom';
  donorFilter?: {
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  volunteerFilter?: {
    activeOnly?: boolean;
    department?: string;
  };
  customFilter?: {
    city?: string[];
    eventAttended?: string[];
    tags?: string[];
  };
}

// Template
export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  channel: MessageChannel;
  subject?: string;
  content: string;
  variables: string[]; // e.g., ['{{name}}', '{{amount}}']
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Delivery Report
export interface DeliveryReport {
  id: string;
  messageId: string;
  recipientId: string;
  channel: MessageChannel;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  openedAt?: string; // For email
  clickedAt?: string; // For email
  cost?: number;
}

// Social Media Post
export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'youtube';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface SocialPost {
  id: string;
  platforms: SocialPlatform[];
  content: string;
  media: Attachment[];
  hashtags: string[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
}

// Community Feed Post
export interface CommunityPost {
  id: string;
  devoteeId: string;
  devoteeName: string;
  content: string;
  media: Attachment[];
  likes: string[]; // Devotee IDs who liked
  comments: Comment[];
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  reportedBy?: string[];
  reportedReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  devoteeId: string;
  devoteeName: string;
  content: string;
  createdAt: string;
}

// Support Ticket
export type TicketStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type TicketCategory = 'complaint' | 'suggestion' | 'inquiry' | 'feedback' | 'technical';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  devoteeId: string;
  devoteeName: string;
  category: TicketCategory;
  subject: string;
  description: string;
  attachments: Attachment[];
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDepartment?: string;
  assignedTo?: string;
  slaDueDate?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Live Streaming Types
export type StreamStatus = 'live' | 'scheduled' | 'offline' | 'ended';
export type StreamPlatform = 'youtube' | 'facebook' | 'custom';
export type EventLifecycleState = 'draft' | 'scheduled' | 'live' | 'completed' | 'archived';

export interface RTMPConfig {
  serverUrl: string;
  streamKey: string;
  rtmpUrl?: string; // Full RTMP URL (serverUrl + streamKey)
  validated: boolean;
  validatedAt?: string;
}

export interface StreamHealthMetrics {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  bitrate?: number; // kbps
  latency?: number; // milliseconds
  frameRate?: number; // fps
  resolution?: string; // e.g., "1920x1080"
  lastHealthCheck: string; // ISO datetime
}

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: Attachment;
  status: StreamStatus;
  lifecycleState: EventLifecycleState; // Event lifecycle state
  platform: StreamPlatform;
  embedUrl?: string; // YouTube/Facebook Live embed URL
  streamKey?: string; // For custom streaming
  rtmpConfig?: RTMPConfig; // RTMP configuration
  linkedEventId?: string;
  scheduledStartTime?: string; // ISO datetime
  actualStartTime?: string;
  endTime?: string;
  viewerCount: number;
  peakViewerCount: number;
  commentsEnabled: boolean;
  chatEnabled: boolean; // Separate chat toggle
  donationLink?: string; // Donation URL
  multiCameraEnabled: boolean;
  cameras: CameraConfig[];
  logs: StreamLog[];
  healthMetrics?: StreamHealthMetrics;
  autoArchiveEnabled: boolean; // Auto-archive after completion
  archivedAt?: string; // When stream was archived
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CameraConfig {
  id: string;
  name: string;
  source: string; // Camera source/URL
  isActive: boolean;
  position: number; // For multi-camera layout
}

export interface StreamLog {
  id: string;
  streamId: string;
  action: 'started' | 'stopped' | 'paused' | 'resumed' | 'error' | 'viewer_joined' | 'viewer_left' | 'created' | 'updated' | 'deleted' | 'scheduled' | 'archived' | 'reconnected' | 'health_check';
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Live Darshan Types
export type DarshanStreamMode = 'continuous' | 'scheduled';
export type DarshanStreamStatus = 'on' | 'off' | 'reconnecting' | 'error';

export interface DarshanStreamSource {
  id: string;
  name: string;
  type: 'camera' | 'rtmp' | 'url';
  source: string; // Camera ID, RTMP URL, or stream URL
  isActive: boolean;
  priority: number; // For failover
}

export interface DarshanStreamSchedule {
  enabled: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
}

export interface DarshanReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  retryInterval: number; // seconds
  currentAttempts: number;
  lastAttemptAt?: string;
}

export interface LiveDarshan {
  id: string;
  name: string;
  description?: string;
  status: DarshanStreamStatus;
  mode: DarshanStreamMode;
  streamSource: DarshanStreamSource;
  schedule?: DarshanStreamSchedule;
  reconnectConfig: DarshanReconnectConfig;
  viewerCount: number;
  peakViewerCount: number;
  uptime: number; // Total seconds stream has been active
  currentSessionStartTime?: string; // ISO datetime of current session
  totalUptime: number; // Cumulative uptime across all sessions
  logs: DarshanActivityLog[];
  healthMetrics?: StreamHealthMetrics;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastStartedAt?: string;
  lastStoppedAt?: string;
}

export interface DarshanActivityLog {
  id: string;
  darshanId: string;
  action: 'turned_on' | 'turned_off' | 'reconnected' | 'failed' | 'scheduled_start' | 'scheduled_stop' | 'source_changed' | 'health_check';
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Common
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// Settings
export interface PRCommunicationSettings {
  approvalRequired: {
    announcements: boolean;
    bulkMessages: boolean;
    socialPosts: boolean;
    communityPosts: boolean;
  };
  sendingLimits: {
    dailyMessageLimit: number;
    smsCostLimit: number;
    bulkSendThreshold: number;
  };
  emergencyControls: {
    killSwitchEnabled: boolean;
    emergencyOverrideEnabled: boolean;
  };
}
