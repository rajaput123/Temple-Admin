import type {
  Announcement,
  Message,
  MessageTemplate,
  DeliveryReport,
  SocialPost,
  LiveStream,
  LiveDarshan,
  CommunityPost,
  SupportTicket,
  PRCommunicationSettings,
  EventLifecycleState,
  DarshanStreamStatus,
} from '@/types/pr-communication';
import {
  mockAnnouncements,
  mockMessages,
  mockTemplates,
  mockDeliveryReports,
  mockSocialPosts,
  mockLiveStreams,
  mockCommunityPosts,
  mockSupportTickets,
} from '@/data/pr-communication-dummy-data';

const STORAGE_KEY = 'pr_communication_store_v1';

interface PRCommunicationStoreState {
  announcements: Announcement[];
  messages: Message[];
  templates: MessageTemplate[];
  deliveryReports: DeliveryReport[];
  socialPosts: SocialPost[];
  liveStreams: LiveStream[];
  liveDarshan: LiveDarshan[];
  communityPosts: CommunityPost[];
  supportTickets: SupportTicket[];
  settings: PRCommunicationSettings;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function initState(): PRCommunicationStoreState {
  try {
    // Ensure all mock data arrays exist, default to empty arrays if missing
    return {
      announcements: Array.isArray(mockAnnouncements) ? mockAnnouncements : [],
      messages: Array.isArray(mockMessages) ? mockMessages : [],
      templates: Array.isArray(mockTemplates) ? mockTemplates : [],
      deliveryReports: Array.isArray(mockDeliveryReports) ? mockDeliveryReports : [],
      socialPosts: Array.isArray(mockSocialPosts) ? mockSocialPosts : [],
      liveStreams: Array.isArray(mockLiveStreams) ? mockLiveStreams : [],
      liveDarshan: [],
      communityPosts: Array.isArray(mockCommunityPosts) ? mockCommunityPosts : [],
      supportTickets: Array.isArray(mockSupportTickets) ? mockSupportTickets : [],
      settings: {
        approvalRequired: {
          announcements: true,
          bulkMessages: true,
          socialPosts: true,
          communityPosts: true,
        },
        sendingLimits: {
          dailyMessageLimit: 10000,
          smsCostLimit: 5000,
          bulkSendThreshold: 1000,
        },
        emergencyControls: {
          killSwitchEnabled: false,
          emergencyOverrideEnabled: true,
        },
      },
    };
  } catch (error) {
    console.error('[PR Store] Error initializing state:', error);
    // Return minimal valid state structure
    return {
      announcements: [],
      messages: [],
      templates: [],
      deliveryReports: [],
      socialPosts: [],
      liveStreams: [],
      liveDarshan: [],
      communityPosts: [],
      supportTickets: [],
      settings: {
        approvalRequired: {
          announcements: true,
          bulkMessages: true,
          socialPosts: true,
          communityPosts: true,
        },
        sendingLimits: {
          dailyMessageLimit: 10000,
          smsCostLimit: 5000,
          bulkSendThreshold: 1000,
        },
        emergencyControls: {
          killSwitchEnabled: false,
          emergencyOverrideEnabled: true,
        },
      },
    };
  }
}

export function getPRCommunicationState(): PRCommunicationStoreState {
  try {
    const stored = safeParse<PRCommunicationStoreState>(sessionStorage.getItem(STORAGE_KEY));
    if (stored) {
      // Validate stored data structure
      if (stored.announcements && Array.isArray(stored.announcements) &&
          stored.messages && Array.isArray(stored.messages) &&
          stored.liveStreams && Array.isArray(stored.liveStreams) &&
          stored.liveDarshan && Array.isArray(stored.liveDarshan) &&
          stored.supportTickets && Array.isArray(stored.supportTickets)) {
        return stored;
      } else {
        console.warn('[PR Store] Stored data structure invalid, reinitializing');
      }
    }
    const initial = initState();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (error) {
    console.error('[PR Store] Error getting state:', error);
    // Return fresh state on error
    const initial = initState();
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (storageError) {
      console.error('[PR Store] Error saving initial state:', storageError);
    }
    return initial;
  }
}

export function setPRCommunicationState(state: PRCommunicationStoreState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Announcement operations
export function getAnnouncements(): Announcement[] {
  try {
    const state = getPRCommunicationState();
    const announcements = state.announcements;
    if (Array.isArray(announcements)) {
      return announcements;
    }
    console.warn('[PR Store] Announcements is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting announcements:', error);
    return [];
  }
}

export function getAnnouncement(id: string): Announcement | undefined {
  return getAnnouncements().find(a => a.id === id);
}

export function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
  const state = getPRCommunicationState();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: `ANN-${String(state.announcements.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.announcements.push(newAnnouncement);
  setPRCommunicationState(state);
  return newAnnouncement;
}

export function updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
  const state = getPRCommunicationState();
  const index = state.announcements.findIndex(a => a.id === id);
  if (index === -1) return null;
  state.announcements[index] = {
    ...state.announcements[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.announcements[index];
}

export function deleteAnnouncement(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.announcements.findIndex(a => a.id === id);
  if (index === -1) return false;
  state.announcements.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

export function publishAnnouncement(id: string, approvedBy?: string): Announcement | null {
  const announcement = getAnnouncement(id);
  if (!announcement) return null;
  return updateAnnouncement(id, {
    status: 'published',
    approvedBy,
    approvedAt: approvedBy ? new Date().toISOString() : undefined,
    publishDate: new Date().toISOString().split('T')[0],
  });
}

// Message operations
export function getMessages(): Message[] {
  try {
    const state = getPRCommunicationState();
    const messages = state.messages;
    if (Array.isArray(messages)) {
      return messages;
    }
    console.warn('[PR Store] Messages is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting messages:', error);
    return [];
  }
}

export function getMessage(id: string): Message | undefined {
  return getMessages().find(m => m.id === id);
}

export function createMessage(message: Omit<Message, 'id' | 'createdAt'>): Message {
  const state = getPRCommunicationState();
  const newMessage: Message = {
    ...message,
    id: `MSG-${String(state.messages.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  state.messages.push(newMessage);
  setPRCommunicationState(state);
  return newMessage;
}

export function sendBulkBroadcast(broadcast: Omit<Message, 'id' | 'createdAt' | 'type'> & { audienceFilter: any }): Message {
  const message = createMessage({
    ...broadcast,
    type: 'bulk',
  });
  return message;
}

export function deleteMessage(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.messages.findIndex(m => m.id === id);
  if (index === -1) return false;
  state.messages.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

export function scheduleMessage(message: Omit<Message, 'id' | 'createdAt' | 'type'> & { scheduledAt: string }): Message {
  return createMessage({
    ...message,
    type: 'scheduled',
    status: 'scheduled',
  });
}

// Template operations
export function getTemplates(): MessageTemplate[] {
  return getPRCommunicationState().templates;
}

export function getTemplate(id: string): MessageTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): MessageTemplate {
  const state = getPRCommunicationState();
  const newTemplate: MessageTemplate = {
    ...template,
    id: `TMP-${String(state.templates.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.templates.push(newTemplate);
  setPRCommunicationState(state);
  return newTemplate;
}

export function updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate | null {
  const state = getPRCommunicationState();
  const index = state.templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  state.templates[index] = {
    ...state.templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.templates[index];
}

export function deleteTemplate(id: string): boolean {
  const state = getPRCommunicationState();
  const index = state.templates.findIndex(t => t.id === id);
  if (index === -1) return false;
  state.templates.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

// Delivery Report operations
export function getDeliveryReports(): DeliveryReport[] {
  return getPRCommunicationState().deliveryReports;
}

export function getDeliveryReportsByMessage(messageId: string): DeliveryReport[] {
  return getDeliveryReports().filter(r => r.messageId === messageId);
}

export function updateDeliveryReport(id: string, updates: Partial<DeliveryReport>): DeliveryReport | null {
  const state = getPRCommunicationState();
  const index = state.deliveryReports.findIndex(r => r.id === id);
  if (index === -1) return null;
  state.deliveryReports[index] = {
    ...state.deliveryReports[index],
    ...updates,
  };
  setPRCommunicationState(state);
  return state.deliveryReports[index];
}

// Social Post operations
export function getSocialPosts(): SocialPost[] {
  return getPRCommunicationState().socialPosts;
}

export function createSocialPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'engagement'>): SocialPost {
  const state = getPRCommunicationState();
  const newPost: SocialPost = {
    ...post,
    id: `SOC-${String(state.socialPosts.length + 1).padStart(3, '0')}`,
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
    createdAt: new Date().toISOString(),
  };
  state.socialPosts.push(newPost);
  setPRCommunicationState(state);
  return newPost;
}

// Live Stream operations
export function getLiveStreams(): LiveStream[] {
  try {
    const state = getPRCommunicationState();
    const liveStreams = state.liveStreams;
    if (Array.isArray(liveStreams)) {
      return liveStreams;
    }
    console.warn('[PR Store] LiveStreams is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting live streams:', error);
    return [];
  }
}

export function getLiveStream(id: string): LiveStream | undefined {
  return getLiveStreams().find(s => s.id === id);
}

export function createLiveStream(stream: Omit<LiveStream, 'id' | 'createdAt' | 'updatedAt' | 'viewerCount' | 'peakViewerCount' | 'logs' | 'lifecycleState'>): LiveStream {
  const state = getPRCommunicationState();
  const newStream: LiveStream = {
    ...stream,
    id: `STR-${String(state.liveStreams.length + 1).padStart(3, '0')}`,
    lifecycleState: 'draft',
    viewerCount: 0,
    peakViewerCount: 0,
    logs: [],
    autoArchiveEnabled: stream.autoArchiveEnabled ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Add creation log
  newStream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: newStream.id,
    action: 'created',
    message: 'Stream event created',
    timestamp: new Date().toISOString(),
    userId: newStream.createdBy,
  });
  
  state.liveStreams.push(newStream);
  setPRCommunicationState(state);
  return newStream;
}

export function startLiveStream(id: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  // Validate state transition
  if (stream.lifecycleState !== 'draft' && stream.lifecycleState !== 'scheduled') {
    console.warn(`[PR Store] Cannot start stream in ${stream.lifecycleState} state`);
    return null;
  }
  
  stream.status = 'live';
  stream.lifecycleState = 'live';
  stream.actualStartTime = new Date().toISOString();
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'started',
    message: 'Stream started successfully',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return stream;
}

export function stopLiveStream(id: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  if (stream.status !== 'live' && stream.lifecycleState !== 'live') {
    console.warn('[PR Store] Stream is not live');
    return stream;
  }
  
  stream.status = 'ended';
  stream.lifecycleState = 'completed';
  stream.endTime = new Date().toISOString();
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'stopped',
    message: 'Stream ended',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  // Auto-archive if enabled (will be processed by autoArchiveCompletedStreams)
  setPRCommunicationState(state);
  return stream;
}

export function updateStreamStatus(id: string, status: LiveStream['status'], viewerCount?: number): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  stream.status = status;
  if (viewerCount !== undefined) {
    stream.viewerCount = viewerCount;
    if (viewerCount > stream.peakViewerCount) {
      stream.peakViewerCount = viewerCount;
    }
  }
  stream.updatedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return stream;
}

export function updateLiveStream(id: string, updates: Partial<LiveStream>): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  // Validate state transitions
  if (updates.lifecycleState && !isValidStateTransition(stream.lifecycleState, updates.lifecycleState)) {
    console.warn(`[PR Store] Invalid state transition from ${stream.lifecycleState} to ${updates.lifecycleState}`);
    return null;
  }
  
  Object.assign(stream, updates);
  stream.updatedAt = new Date().toISOString();
  
  // Add log entry for significant changes
  if (updates.lifecycleState || updates.status) {
    stream.logs.push({
      id: `LOG-${Date.now()}`,
      streamId: id,
      action: updates.lifecycleState === 'archived' ? 'archived' : updates.status === 'live' ? 'started' : 'updated',
      message: `Stream ${updates.lifecycleState || updates.status || 'updated'}`,
      timestamp: new Date().toISOString(),
    });
  }
  
  setPRCommunicationState(state);
  return stream;
}

export function deleteLiveStream(id: string, userId: string): boolean {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return false;
  
  // Cannot delete live streams
  if (stream.status === 'live' || stream.lifecycleState === 'live') {
    console.warn('[PR Store] Cannot delete live stream');
    return false;
  }
  
  const index = state.liveStreams.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  state.liveStreams.splice(index, 1);
  setPRCommunicationState(state);
  return true;
}

export function scheduleLiveStream(id: string, scheduledStartTime: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  // Validate scheduled time is in the future
  const scheduledDate = new Date(scheduledStartTime);
  if (scheduledDate <= new Date()) {
    console.warn('[PR Store] Scheduled time must be in the future');
    return null;
  }
  
  stream.lifecycleState = 'scheduled';
  stream.status = 'scheduled';
  stream.scheduledStartTime = scheduledStartTime;
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'scheduled',
    message: `Stream scheduled for ${scheduledStartTime}`,
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return stream;
}

export function archiveLiveStream(id: string, userId: string): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  // Can only archive completed streams
  if (stream.lifecycleState !== 'completed') {
    console.warn('[PR Store] Can only archive completed streams');
    return null;
  }
  
  stream.lifecycleState = 'archived';
  stream.archivedAt = new Date().toISOString();
  stream.updatedAt = new Date().toISOString();
  
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'archived',
    message: 'Stream archived',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return stream;
}

// Auto-archive completed streams
export function autoArchiveCompletedStreams(): void {
  const state = getPRCommunicationState();
  const now = new Date();
  const archiveThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  state.liveStreams.forEach(stream => {
    if (stream.lifecycleState === 'completed' && 
        stream.autoArchiveEnabled && 
        stream.endTime && 
        !stream.archivedAt) {
      const endTime = new Date(stream.endTime);
      const timeSinceEnd = now.getTime() - endTime.getTime();
      
      if (timeSinceEnd >= archiveThreshold) {
        stream.lifecycleState = 'archived';
        stream.archivedAt = new Date().toISOString();
        stream.updatedAt = new Date().toISOString();
        
        stream.logs.push({
          id: `LOG-${Date.now()}`,
          streamId: stream.id,
          action: 'archived',
          message: 'Stream auto-archived after completion',
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
  
  setPRCommunicationState(state);
}

function isValidStateTransition(current: EventLifecycleState, next: EventLifecycleState): boolean {
  const validTransitions: Record<EventLifecycleState, EventLifecycleState[]> = {
    draft: ['scheduled', 'archived'],
    scheduled: ['live', 'draft', 'archived'],
    live: ['completed'],
    completed: ['archived'],
    archived: [], // Terminal state
  };
  
  return validTransitions[current]?.includes(next) ?? false;
}

export function updateStreamHealthMetrics(id: string, metrics: Partial<LiveStream['healthMetrics']>): LiveStream | null {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === id);
  if (!stream) return null;
  
  if (!stream.healthMetrics) {
    stream.healthMetrics = {
      connectionStatus: 'disconnected',
      lastHealthCheck: new Date().toISOString(),
    };
  }
  
  Object.assign(stream.healthMetrics, metrics, {
    lastHealthCheck: new Date().toISOString(),
  });
  
  stream.updatedAt = new Date().toISOString();
  
  // Log health check
  stream.logs.push({
    id: `LOG-${Date.now()}`,
    streamId: id,
    action: 'health_check',
    message: `Health check: ${metrics.connectionStatus || stream.healthMetrics.connectionStatus}`,
    timestamp: new Date().toISOString(),
    metadata: metrics,
  });
  
  setPRCommunicationState(state);
  return stream;
}

export function addStreamLog(streamId: string, log: Omit<LiveStream['logs'][0], 'id' | 'streamId' | 'timestamp'>): void {
  const state = getPRCommunicationState();
  const stream = state.liveStreams.find(s => s.id === streamId);
  if (!stream) return;
  
  stream.logs.push({
    ...log,
    id: `LOG-${Date.now()}`,
    streamId,
    timestamp: new Date().toISOString(),
  });
  
  setPRCommunicationState(state);
}

// Community Post operations
export function getCommunityPosts(): CommunityPost[] {
  return getPRCommunicationState().communityPosts;
}

export function approveCommunityPost(id: string, approvedBy: string): CommunityPost | null {
  const state = getPRCommunicationState();
  const post = state.communityPosts.find(p => p.id === id);
  if (!post) return null;
  
  post.status = 'approved';
  post.approvedBy = approvedBy;
  post.approvedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return post;
}

// Support Ticket operations
export function getSupportTickets(): SupportTicket[] {
  try {
    const state = getPRCommunicationState();
    const supportTickets = state.supportTickets;
    if (Array.isArray(supportTickets)) {
      return supportTickets;
    }
    console.warn('[PR Store] SupportTickets is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting support tickets:', error);
    return [];
  }
}

export function getSupportTicket(id: string): SupportTicket | undefined {
  return getSupportTickets().find(t => t.id === id);
}

export function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): SupportTicket {
  const state = getPRCommunicationState();
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(state.supportTickets.length + 1).padStart(3, '0')}`;
  const newTicket: SupportTicket = {
    ...ticket,
    id: `TKT-${String(state.supportTickets.length + 1).padStart(3, '0')}`,
    ticketNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.supportTickets.push(newTicket);
  setPRCommunicationState(state);
  return newTicket;
}

export function updateSupportTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
  const state = getPRCommunicationState();
  const index = state.supportTickets.findIndex(t => t.id === id);
  if (index === -1) return null;
  state.supportTickets[index] = {
    ...state.supportTickets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setPRCommunicationState(state);
  return state.supportTickets[index];
}

// Live Darshan operations
export function getLiveDarshan(): LiveDarshan[] {
  try {
    const state = getPRCommunicationState();
    const liveDarshan = state.liveDarshan;
    if (Array.isArray(liveDarshan)) {
      return liveDarshan;
    }
    console.warn('[PR Store] LiveDarshan is not an array, returning empty array');
    return [];
  } catch (error) {
    console.error('[PR Store] Error getting live darshan:', error);
    return [];
  }
}

export function getLiveDarshanById(id: string): LiveDarshan | undefined {
  return getLiveDarshan().find(d => d.id === id);
}

export function createLiveDarshan(darshan: Omit<LiveDarshan, 'id' | 'createdAt' | 'updatedAt' | 'viewerCount' | 'peakViewerCount' | 'uptime' | 'totalUptime' | 'logs'>): LiveDarshan {
  const state = getPRCommunicationState();
  const newDarshan: LiveDarshan = {
    ...darshan,
    id: `DAR-${String(state.liveDarshan.length + 1).padStart(3, '0')}`,
    viewerCount: 0,
    peakViewerCount: 0,
    uptime: 0,
    totalUptime: 0,
    logs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.liveDarshan.push(newDarshan);
  setPRCommunicationState(state);
  return newDarshan;
}

export function updateLiveDarshan(id: string, updates: Partial<LiveDarshan>): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  Object.assign(darshan, updates);
  darshan.updatedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return darshan;
}

export function turnOnLiveDarshan(id: string, userId: string): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  if (darshan.status === 'on') {
    console.warn('[PR Store] Darshan stream is already on');
    return darshan;
  }
  
  darshan.status = 'on';
  darshan.currentSessionStartTime = new Date().toISOString();
  darshan.lastStartedAt = new Date().toISOString();
  darshan.updatedAt = new Date().toISOString();
  
  // Reset reconnect attempts
  if (darshan.reconnectConfig) {
    darshan.reconnectConfig.currentAttempts = 0;
  }
  
  darshan.logs.push({
    id: `LOG-${Date.now()}`,
    darshanId: id,
    action: 'turned_on',
    message: 'Live Darshan stream turned on',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return darshan;
}

export function turnOffLiveDarshan(id: string, userId: string): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  if (darshan.status === 'off') {
    console.warn('[PR Store] Darshan stream is already off');
    return darshan;
  }
  
  // Calculate session uptime and add to total
  if (darshan.currentSessionStartTime) {
    const sessionStart = new Date(darshan.currentSessionStartTime);
    const sessionEnd = new Date();
    const sessionUptime = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
    darshan.totalUptime += sessionUptime;
    darshan.uptime = 0;
    darshan.currentSessionStartTime = undefined;
  }
  
  darshan.status = 'off';
  darshan.lastStoppedAt = new Date().toISOString();
  darshan.updatedAt = new Date().toISOString();
  
  darshan.logs.push({
    id: `LOG-${Date.now()}`,
    darshanId: id,
    action: 'turned_off',
    message: 'Live Darshan stream turned off',
    timestamp: new Date().toISOString(),
    userId,
  });
  
  setPRCommunicationState(state);
  return darshan;
}

export function updateDarshanViewerCount(id: string, viewerCount: number): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  darshan.viewerCount = viewerCount;
  if (viewerCount > darshan.peakViewerCount) {
    darshan.peakViewerCount = viewerCount;
  }
  darshan.updatedAt = new Date().toISOString();
  
  setPRCommunicationState(state);
  return darshan;
}

export function updateDarshanUptime(id: string): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  if (darshan.status === 'on' && darshan.currentSessionStartTime) {
    const sessionStart = new Date(darshan.currentSessionStartTime);
    const now = new Date();
    darshan.uptime = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
    darshan.updatedAt = new Date().toISOString();
  }
  
  setPRCommunicationState(state);
  return darshan;
}

export function reconnectDarshanStream(id: string): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  if (!darshan.reconnectConfig.enabled) {
    console.warn('[PR Store] Auto-reconnect is disabled');
    return darshan;
  }
  
  if (darshan.reconnectConfig.currentAttempts >= darshan.reconnectConfig.maxAttempts) {
    darshan.status = 'error';
    darshan.logs.push({
      id: `LOG-${Date.now()}`,
      darshanId: id,
      action: 'failed',
      message: `Reconnection failed after ${darshan.reconnectConfig.maxAttempts} attempts`,
      timestamp: new Date().toISOString(),
    });
    setPRCommunicationState(state);
    return darshan;
  }
  
  darshan.reconnectConfig.currentAttempts += 1;
  darshan.reconnectConfig.lastAttemptAt = new Date().toISOString();
  darshan.status = 'reconnecting';
  darshan.updatedAt = new Date().toISOString();
  
  darshan.logs.push({
    id: `LOG-${Date.now()}`,
    darshanId: id,
    action: 'reconnected',
    message: `Reconnection attempt ${darshan.reconnectConfig.currentAttempts}/${darshan.reconnectConfig.maxAttempts}`,
    timestamp: new Date().toISOString(),
    metadata: { attempt: darshan.reconnectConfig.currentAttempts },
  });
  
  // Simulate successful reconnection after retry interval
  setTimeout(() => {
    const currentState = getPRCommunicationState();
    const currentDarshan = currentState.liveDarshan.find(d => d.id === id);
    if (currentDarshan && currentDarshan.status === 'reconnecting') {
      currentDarshan.status = 'on';
      currentDarshan.currentSessionStartTime = new Date().toISOString();
      currentDarshan.reconnectConfig.currentAttempts = 0;
      currentDarshan.updatedAt = new Date().toISOString();
      
      currentDarshan.logs.push({
        id: `LOG-${Date.now()}`,
        darshanId: id,
        action: 'reconnected',
        message: 'Stream reconnected successfully',
        timestamp: new Date().toISOString(),
      });
      
      setPRCommunicationState(currentState);
    }
  }, darshan.reconnectConfig.retryInterval * 1000);
  
  setPRCommunicationState(state);
  return darshan;
}

export function addDarshanActivityLog(darshanId: string, log: Omit<LiveDarshan['logs'][0], 'id' | 'darshanId' | 'timestamp'>): void {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === darshanId);
  if (!darshan) return;
  
  darshan.logs.push({
    ...log,
    id: `LOG-${Date.now()}`,
    darshanId,
    timestamp: new Date().toISOString(),
  });
  
  setPRCommunicationState(state);
}

export function updateDarshanHealthMetrics(id: string, metrics: Partial<LiveDarshan['healthMetrics']>): LiveDarshan | null {
  const state = getPRCommunicationState();
  const darshan = state.liveDarshan.find(d => d.id === id);
  if (!darshan) return null;
  
  if (!darshan.healthMetrics) {
    darshan.healthMetrics = {
      connectionStatus: 'disconnected',
      lastHealthCheck: new Date().toISOString(),
    };
  }
  
  Object.assign(darshan.healthMetrics, metrics, {
    lastHealthCheck: new Date().toISOString(),
  });
  
  darshan.updatedAt = new Date().toISOString();
  
  // Log health check
  darshan.logs.push({
    id: `LOG-${Date.now()}`,
    darshanId: id,
    action: 'health_check',
    message: `Health check: ${metrics.connectionStatus || darshan.healthMetrics.connectionStatus}`,
    timestamp: new Date().toISOString(),
    metadata: metrics,
  });
  
  setPRCommunicationState(state);
  return darshan;
}
