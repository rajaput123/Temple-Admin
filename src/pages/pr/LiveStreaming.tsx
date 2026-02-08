import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Radio, Play, Square, Clock, Users, AlertCircle, Calendar, Trash2, Edit, Archive, Plus } from 'lucide-react';
import { 
  getLiveStreams, 
  startLiveStream, 
  stopLiveStream,
  updateStreamStatus,
  deleteLiveStream,
  scheduleLiveStream,
  archiveLiveStream,
  updateLiveStream,
  createLiveStream,
} from '@/lib/pr-communication-store';
import type { LiveStream, StreamStatus, EventLifecycleState } from '@/types/pr-communication';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LiveStreaming() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'start' | 'stop' | 'delete' | 'archive'; id: string } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [newStreamDescription, setNewStreamDescription] = useState('');
  const [newStreamScheduledTime, setNewStreamScheduledTime] = useState('');
  const [newStreamPlatform, setNewStreamPlatform] = useState<'youtube' | 'facebook' | 'custom'>('youtube');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
  const [editStreamTitle, setEditStreamTitle] = useState('');
  const [editStreamDescription, setEditStreamDescription] = useState('');
  const [editScheduledTime, setEditScheduledTime] = useState('');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[LiveStreaming] Component mounted');
    return () => {
      console.log('[LiveStreaming] Component unmounted');
    };
  }, []);

  // Safe data fetching
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        console.log('[LiveStreaming] Loading data...');
        const data = getLiveStreams();
        if (Array.isArray(data)) {
          setStreams(data);
          console.log('[LiveStreaming] Data loaded successfully:', data.length);
        } else {
          console.warn('[LiveStreaming] Invalid data structure, using empty array');
          setStreams([]);
        }
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[LiveStreaming] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load live streams');
        setStreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update streams periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = getLiveStreams();
        if (Array.isArray(data)) {
          setStreams(data);
          // Simulate viewer count updates for live streams
          data.forEach(stream => {
            if (stream.status === 'live') {
              const newCount = stream.viewerCount + Math.floor(Math.random() * 10) - 5;
              updateStreamStatus(stream.id, 'live', Math.max(0, newCount));
            }
          });
        }
      } catch (error) {
        console.error('[LiveStreaming] Error updating streams:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[LiveStreaming] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[LiveStreaming] Unhandled promise rejection:', e.reason);
      setHasError(true);
      setErrorMessage(e.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejection);
    
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, []);

  const activeStreams = useMemo(() => {
    return streams.filter(s => s.status === 'live');
  }, [streams]);

  const scheduledStreams = useMemo(() => {
    // Show both scheduled streams AND draft streams (newly created)
    return streams.filter(s => 
      s.status === 'scheduled' || 
      (s.lifecycleState === 'draft' && s.status === 'offline') ||
      s.lifecycleState === 'scheduled'
    );
  }, [streams]);

  const pastStreams = useMemo(() => {
    // Show completed and archived streams
    return streams.filter(s => 
      s.status === 'ended' || 
      s.lifecycleState === 'completed' ||
      s.lifecycleState === 'archived'
    );
  }, [streams]);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="Live Streaming"
          description="Manage live video broadcasts"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Streaming', href: '/pr/live-streaming' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading live streams...</p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  // Error state
  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Live Streaming"
          description="Manage live video broadcasts"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Streaming', href: '/pr/live-streaming' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Live Streams</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const handleGoLive = (streamId: string) => {
    setConfirmAction({ type: 'start', id: streamId });
    setConfirmDialogOpen(true);
  };

  const handleEndStream = (streamId: string) => {
    setConfirmAction({ type: 'stop', id: streamId });
    setConfirmDialogOpen(true);
  };

  const handleDelete = (streamId: string) => {
    setConfirmAction({ type: 'delete', id: streamId });
    setConfirmDialogOpen(true);
  };

  const handleArchive = (streamId: string) => {
    setConfirmAction({ type: 'archive', id: streamId });
    setConfirmDialogOpen(true);
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;
    
    try {
      const userId = 'current-user'; // Get from auth context
      let result: LiveStream | null = null;
      let success = false;
      
      switch (confirmAction.type) {
        case 'start':
          result = startLiveStream(confirmAction.id, userId);
          if (result) {
            toast.success('Stream started successfully');
            success = true;
          } else {
            toast.error('Failed to start stream. Check stream state.');
          }
          break;
        case 'stop':
          result = stopLiveStream(confirmAction.id, userId);
          if (result) {
            toast.success('Stream ended successfully');
            success = true;
            setSelectedStream(null);
          } else {
            toast.error('Failed to end stream');
          }
          break;
        case 'delete':
          success = deleteLiveStream(confirmAction.id, userId);
          if (success) {
            toast.success('Stream deleted successfully');
            setSelectedStream(null);
          } else {
            toast.error('Failed to delete stream. Stream may be live.');
          }
          break;
        case 'archive':
          result = archiveLiveStream(confirmAction.id, userId);
          if (result) {
            toast.success('Stream archived successfully');
            success = true;
          } else {
            toast.error('Failed to archive stream. Stream must be completed.');
          }
          break;
      }
      
      // Refresh streams list after any action
      if (success || result) {
        const updatedStreams = getLiveStreams();
        if (Array.isArray(updatedStreams)) {
          setStreams(updatedStreams);
          // Set selected stream if it was started
          if (result && confirmAction.type === 'start') {
            setSelectedStream(result);
          } else if (result && confirmAction.type !== 'delete' && confirmAction.type !== 'stop') {
            setSelectedStream(result);
          }
        }
      }
    } catch (error) {
      console.error('[LiveStreaming] Error:', error);
      toast.error('An error occurred');
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: StreamStatus) => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
            LIVE
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            🟡 SCHEDULED
          </Badge>
        );
      case 'offline':
      case 'ended':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            ⚫ OFFLINE
          </Badge>
        );
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '0:00:00';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Live Streaming"
        description="Manage live video broadcasts"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Live Streaming', href: '/pr/live-streaming' },
        ]}
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Stream
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Main Video Player Section - Only show when there are live streams */}
        {activeStreams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Now</h3>
            </div>

            {/* Video Player - Show active stream */}
            {activeStreams.map(stream => (
              <Card key={stream.id} className="rounded-xl border-2 border-red-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Stream Player - Prominent */}
                    <div className="lg:col-span-2">
                      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                        {/* Video Container */}
                        <div className="aspect-video relative">
                          {stream.embedUrl && stream.platform === 'youtube' ? (
                            <iframe
                              src={stream.embedUrl.replace('live-stream-id', 'dQw4w9WgXcQ')}
                              className="absolute inset-0 w-full h-full"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                              style={{ border: 'none' }}
                            />
                          ) : stream.embedUrl && stream.platform === 'facebook' ? (
                            <iframe
                              src={stream.embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                              allowFullScreen
                              style={{ border: 'none' }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                              <div className="text-white text-center z-10">
                                <div className="relative mb-4">
                                  <Video className="h-24 w-24 mx-auto opacity-30" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                                  </div>
                                </div>
                                <p className="text-xl font-semibold mb-2">{stream.title}</p>
                                <p className="text-sm opacity-75">Live Stream Ready</p>
                                <p className="text-xs opacity-50 mt-2">Video player will appear here</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4 z-20">
                            {getStatusBadge(stream.status)}
                          </div>
                          
                          {/* Video Controls Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm font-semibold">{stream.viewerCount.toLocaleString()} watching</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-xs">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">{formatDuration(stream.actualStartTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Control Panel */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">{stream.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Viewers</span>
                          </div>
                          <span className="text-xl font-bold">{stream.viewerCount}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Duration</span>
                          </div>
                          <span className="text-sm font-mono">{formatDuration(stream.actualStartTime)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Peak Viewers</span>
                          </div>
                          <span className="text-sm font-bold">{stream.peakViewerCount}</span>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={() => handleEndStream(stream.id)}
                      >
                        <Square className="h-4 w-4" />
                        End Stream
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stream List */}
        <Tabs defaultValue="scheduled" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="past">Past Streams</TabsTrigger>
            </TabsList>
            <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Stream
            </Button>
          </div>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledStreams.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium">No scheduled streams</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Create a new stream to get started</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Stream
                  </Button>
                </CardContent>
              </Card>
            ) : (
              scheduledStreams.map(stream => (
                <Card key={stream.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {stream.lifecycleState === 'draft' && (
                              <span className="text-orange-600 font-medium mr-2">Draft •</span>
                            )}
                            {stream.scheduledStartTime 
                              ? `Scheduled: ${new Date(stream.scheduledStartTime).toLocaleString()}`
                              : stream.lifecycleState === 'draft' 
                              ? 'Not scheduled yet'
                              : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(stream.status)}
                        {stream.status !== 'live' && stream.lifecycleState !== 'live' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              setEditingStream(stream);
                              setEditStreamTitle(stream.title);
                              setEditStreamDescription(stream.description);
                              setEditScheduledTime(stream.scheduledStartTime ? new Date(stream.scheduledStartTime).toISOString().slice(0, 16) : '');
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                        {stream.lifecycleState !== 'draft' && stream.status !== 'live' && (
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => handleGoLive(stream.id)}
                          >
                            <Play className="h-4 w-4" />
                            Start Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastStreams.length === 0 ? (
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium">No past streams</p>
                  <p className="text-sm text-muted-foreground mt-1">Past streams will appear here</p>
                </CardContent>
              </Card>
            ) : (
              pastStreams.map(stream => (
                <Card key={stream.id} className="rounded-xl border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Ended: {stream.endTime ? new Date(stream.endTime).toLocaleString() : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(stream.status)}
                        <div className="text-sm text-muted-foreground">
                          Peak: {stream.peakViewerCount} viewers
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'start' && 'Start Live Stream'}
              {confirmAction?.type === 'stop' && 'Stop Live Stream'}
              {confirmAction?.type === 'delete' && 'Delete Stream Event'}
              {confirmAction?.type === 'archive' && 'Archive Stream Event'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'start' && 'Are you sure you want to start this live stream? The stream will begin immediately and viewers will be able to join.'}
              {confirmAction?.type === 'stop' && 'Are you sure you want to stop this live stream? All viewers will be disconnected and the stream will end.'}
              {confirmAction?.type === 'delete' && 'Are you sure you want to delete this stream event? This action cannot be undone. Live streams cannot be deleted.'}
              {confirmAction?.type === 'archive' && 'Are you sure you want to archive this stream? Archived streams are moved to historical records.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'delete' || confirmAction?.type === 'stop' ? 'destructive' : 'default'}
              onClick={confirmActionHandler}
            >
              {confirmAction?.type === 'start' && 'Start Stream'}
              {confirmAction?.type === 'stop' && 'Stop Stream'}
              {confirmAction?.type === 'delete' && 'Delete'}
              {confirmAction?.type === 'archive' && 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Stream Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Live Stream Event</DialogTitle>
            <DialogDescription>
              Create a new live streaming event. You can schedule it for later or start it immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stream-title">
                Stream Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stream-title"
                value={newStreamTitle}
                onChange={(e) => setNewStreamTitle(e.target.value)}
                placeholder="e.g., Maha Shivaratri Live Darshan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stream-description">Description</Label>
              <Textarea
                id="stream-description"
                value={newStreamDescription}
                onChange={(e) => setNewStreamDescription(e.target.value)}
                placeholder="Describe the live stream event..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stream-platform">Platform</Label>
                <Select
                  value={newStreamPlatform}
                  onValueChange={(value) => setNewStreamPlatform(value as 'youtube' | 'facebook' | 'custom')}
                >
                  <SelectTrigger id="stream-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="custom">Custom RTMP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-scheduled-time">Scheduled Start Time (Optional)</Label>
                <Input
                  id="stream-scheduled-time"
                  type="datetime-local"
                  value={newStreamScheduledTime}
                  onChange={(e) => setNewStreamScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave scheduled time empty to create as draft. Set a future date/time to schedule automatically.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setNewStreamTitle('');
              setNewStreamDescription('');
              setNewStreamScheduledTime('');
              setNewStreamPlatform('youtube');
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newStreamTitle.trim()) {
                  toast.error('Stream title is required');
                  return;
                }
                
                try {
                  // Validate scheduled time if provided
                  if (newStreamScheduledTime) {
                    const scheduledDate = new Date(newStreamScheduledTime);
                    if (scheduledDate <= new Date()) {
                      toast.error('Scheduled time must be in the future');
                      return;
                    }
                  }

                  const newStream = createLiveStream({
                    title: newStreamTitle,
                    description: newStreamDescription,
                    thumbnail: {
                      id: 'thumb-1',
                      name: 'default-thumbnail.png',
                      url: '/placeholder.svg',
                      type: 'image/png',
                      size: 0,
                      uploadedAt: new Date().toISOString(),
                    },
                    status: newStreamScheduledTime ? 'scheduled' : 'offline',
                    platform: newStreamPlatform,
                    scheduledStartTime: newStreamScheduledTime || undefined,
                    commentsEnabled: true,
                    chatEnabled: true,
                    multiCameraEnabled: false,
                    cameras: [],
                    autoArchiveEnabled: true,
                    createdBy: 'current-user',
                  });

                  // If scheduled time was provided, schedule the stream
                  if (newStreamScheduledTime) {
                    scheduleLiveStream(newStream.id, new Date(newStreamScheduledTime).toISOString(), 'current-user');
                  }
                  
                  const updatedStreams = getLiveStreams();
                  setStreams(updatedStreams);
                  setCreateDialogOpen(false);
                  setNewStreamTitle('');
                  setNewStreamDescription('');
                  setNewStreamScheduledTime('');
                  setNewStreamPlatform('youtube');
                  toast.success(newStreamScheduledTime ? 'Stream scheduled successfully' : 'Stream event created successfully');
                } catch (error) {
                  console.error('[LiveStreaming] Error creating stream:', error);
                  toast.error('Failed to create stream');
                }
              }}
              disabled={!newStreamTitle.trim()}
            >
              Create Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stream Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Live Stream Event</DialogTitle>
            <DialogDescription>
              Update stream details and schedule. You can schedule it for later or start it immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stream-title">
                Stream Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-stream-title"
                value={editStreamTitle}
                onChange={(e) => setEditStreamTitle(e.target.value)}
                placeholder="e.g., Maha Shivaratri Live Darshan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-stream-description">Description</Label>
              <Textarea
                id="edit-stream-description"
                value={editStreamDescription}
                onChange={(e) => setEditStreamDescription(e.target.value)}
                placeholder="Describe the live stream event..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-scheduled-time">Scheduled Start Time (Optional)</Label>
              <Input
                id="edit-scheduled-time"
                type="datetime-local"
                value={editScheduledTime}
                onChange={(e) => setEditScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to start manually. Set a future date/time to schedule.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialogOpen(false);
                setEditingStream(null);
                setEditStreamTitle('');
                setEditStreamDescription('');
                setEditScheduledTime('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editStreamTitle.trim()) {
                  toast.error('Stream title is required');
                  return;
                }

                if (!editingStream) return;
                
                try {
                  const updates: Partial<LiveStream> = {
                    title: editStreamTitle,
                    description: editStreamDescription,
                  };

                  // If scheduled time is provided, schedule the stream
                  if (editScheduledTime) {
                    const scheduledDate = new Date(editScheduledTime);
                    if (scheduledDate <= new Date()) {
                      toast.error('Scheduled time must be in the future');
                      return;
                    }
                    scheduleLiveStream(editingStream.id, scheduledDate.toISOString(), 'current-user');
                  }

                  // Update stream details
                  const updated = updateLiveStream(editingStream.id, updates);
                  
                  if (updated) {
                    const updatedStreams = getLiveStreams();
                    setStreams(updatedStreams);
                    setEditDialogOpen(false);
                    setEditingStream(null);
                    setEditStreamTitle('');
                    setEditStreamDescription('');
                    setEditScheduledTime('');
                    toast.success('Stream updated successfully');
                  } else {
                    toast.error('Failed to update stream');
                  }
                } catch (error) {
                  console.error('[LiveStreaming] Error updating stream:', error);
                  toast.error('Failed to update stream');
                }
              }}
              disabled={!editStreamTitle.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
