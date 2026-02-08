import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Radio, 
  Power, 
  PowerOff, 
  Clock, 
  Users, 
  Activity, 
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { 
  getLiveDarshan,
  turnOnLiveDarshan,
  turnOffLiveDarshan,
  updateDarshanViewerCount,
  updateDarshanUptime,
  reconnectDarshanStream,
  updateDarshanHealthMetrics,
  createLiveDarshan,
  updateLiveDarshan,
} from '@/lib/pr-communication-store';
import type { LiveDarshan, DarshanStreamStatus } from '@/types/pr-communication';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function LiveDarshan() {
  const [darshanStreams, setDarshanStreams] = useState<LiveDarshan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDarshan, setSelectedDarshan] = useState<LiveDarshan | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'on' | 'off'; id: string } | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        const data = getLiveDarshan();
        if (Array.isArray(data)) {
          setDarshanStreams(data);
        } else {
          setDarshanStreams([]);
        }
        setHasError(false);
        setErrorMessage(null);
      } catch (error) {
        console.error('[LiveDarshan] Error loading data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load live darshan streams');
        setDarshanStreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update uptime and viewer counts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = getLiveDarshan();
        if (Array.isArray(data)) {
          setDarshanStreams(data);
          
          // Update uptime for active streams
          data.forEach(darshan => {
            if (darshan.status === 'on') {
              updateDarshanUptime(darshan.id);
              // Simulate viewer count updates
              const newCount = darshan.viewerCount + Math.floor(Math.random() * 10) - 5;
              updateDarshanViewerCount(darshan.id, Math.max(0, newCount));
            }
          });
        }
      } catch (error) {
        console.error('[LiveDarshan] Error updating streams:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeStreams = useMemo(() => {
    return darshanStreams.filter(s => s.status === 'on');
  }, [darshanStreams]);

  const handleTurnOn = (id: string) => {
    setConfirmAction({ type: 'on', id });
    setConfirmDialogOpen(true);
  };

  const handleTurnOff = (id: string) => {
    setConfirmAction({ type: 'off', id });
    setConfirmDialogOpen(true);
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;
    
    try {
      const userId = 'current-user'; // Get from auth context
      let result: LiveDarshan | null = null;
      
      if (confirmAction.type === 'on') {
        result = turnOnLiveDarshan(confirmAction.id, userId);
        if (result) {
          toast.success('Live Darshan stream turned on successfully');
        } else {
          toast.error('Failed to turn on stream');
        }
      } else {
        result = turnOffLiveDarshan(confirmAction.id, userId);
        if (result) {
          toast.success('Live Darshan stream turned off successfully');
        } else {
          toast.error('Failed to turn off stream');
        }
      }
      
      if (result) {
        const updated = getLiveDarshan();
        setDarshanStreams(updated);
        setSelectedDarshan(result);
      }
    } catch (error) {
      console.error('[LiveDarshan] Error:', error);
      toast.error('An error occurred');
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleReconnect = (id: string) => {
    try {
      const result = reconnectDarshanStream(id);
      if (result) {
        toast.success('Reconnection initiated');
        const updated = getLiveDarshan();
        setDarshanStreams(updated);
      } else {
        toast.error('Failed to reconnect');
      }
    } catch (error) {
      console.error('[LiveDarshan] Reconnect error:', error);
      toast.error('Reconnection failed');
    }
  };

  const getStatusBadge = (status: DarshanStreamStatus) => {
    switch (status) {
      case 'on':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
            ON
          </Badge>
        );
      case 'off':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            OFF
          </Badge>
        );
      case 'reconnecting':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            RECONNECTING
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            ERROR
          </Badge>
        );
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader
          title="Live Darshan"
          description="Manage continuous temple darshan streaming"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Darshan', href: '/pr/live-darshan' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Loading live darshan streams...</p>
          </div>
        </Card>
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Live Darshan"
          description="Manage continuous temple darshan streaming"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Live Darshan', href: '/pr/live-darshan' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Streams</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Live Darshan"
        description="Manage continuous temple darshan streaming"
        breadcrumbs={[
          { label: 'Hub', href: '/hub' },
          { label: 'PR & Communication', href: '/pr' },
          { label: 'Live Darshan', href: '/pr/live-darshan' },
        ]}
      />

      <div className="space-y-6">
        {/* Active Streams */}
        {activeStreams.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Streams</h3>
            {activeStreams.map(darshan => (
              <Card key={darshan.id} className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Radio className="h-5 w-5 text-green-600" />
                      <div>
                        <CardTitle>{darshan.name}</CardTitle>
                        <CardDescription>{darshan.description || 'Continuous temple darshan'}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(darshan.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Viewers</p>
                        <p className="text-lg font-semibold">{darshan.viewerCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                        <p className="text-lg font-semibold">{formatUptime(darshan.uptime + darshan.totalUptime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Peak Viewers</p>
                        <p className="text-lg font-semibold">{darshan.peakViewerCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mode</p>
                        <p className="text-lg font-semibold capitalize">{darshan.mode}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTurnOff(darshan.id)}
                    >
                      <PowerOff className="h-4 w-4 mr-2" />
                      Turn Off
                    </Button>
                    {darshan.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReconnect(darshan.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconnect
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDarshan(darshan)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* All Streams List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Streams</h3>
            <Button onClick={() => {
              // Create new darshan stream
              const newDarshan = createLiveDarshan({
                name: 'New Live Darshan',
                description: 'Continuous temple darshan stream',
                status: 'off',
                mode: 'continuous',
                streamSource: {
                  id: 'src-1',
                  name: 'Main Camera',
                  type: 'camera',
                  source: 'camera-1',
                  isActive: true,
                  priority: 1,
                },
                reconnectConfig: {
                  enabled: true,
                  maxAttempts: 5,
                  retryInterval: 10,
                  currentAttempts: 0,
                },
                createdBy: 'current-user',
              });
              setDarshanStreams(getLiveDarshan());
              toast.success('New Live Darshan stream created');
            }}>
              <Radio className="h-4 w-4 mr-2" />
              Create Stream
            </Button>
          </div>

          {darshanStreams.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No live darshan streams configured</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {darshanStreams.map(darshan => (
                <Card key={darshan.id} className={darshan.status === 'on' ? 'border-green-200' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{darshan.name}</CardTitle>
                      {getStatusBadge(darshan.status)}
                    </div>
                    <CardDescription>{darshan.description || 'Live Darshan stream'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Viewers:</span>
                        <span className="font-medium">{darshan.viewerCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="font-medium">{formatUptime(darshan.uptime + darshan.totalUptime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mode:</span>
                        <span className="font-medium capitalize">{darshan.mode}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {darshan.status === 'off' ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleTurnOn(darshan.id)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          Turn On
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleTurnOff(darshan.id)}
                        >
                          <PowerOff className="h-4 w-4 mr-2" />
                          Turn Off
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDarshan(darshan)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'on' ? 'Turn On Live Darshan' : 'Turn Off Live Darshan'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'on'
                ? 'Are you sure you want to turn on this live darshan stream? The stream will start immediately.'
                : 'Are you sure you want to turn off this live darshan stream? All viewers will be disconnected.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'on' ? 'default' : 'destructive'}
              onClick={confirmActionHandler}
            >
              {confirmAction?.type === 'on' ? 'Turn On' : 'Turn Off'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
