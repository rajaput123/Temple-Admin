import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { dummySocialChannels, dummySocialPosts, dummyContentCalendars } from '@/data/communications-data';
import type { SocialPost, SocialPlatform, ContentCalendar } from '@/types/communications';
import { usePermissions } from '@/hooks/usePermissions';
import { CreatePostModal } from '@/components/pr/communication/CreatePostModal';
import { PostLog } from '@/components/pr/communication/PostLog';
import { toast } from 'sonner';
import '@/styles/pr-communication.css';

const platformIcons: Record<SocialPlatform, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Share2,
  whatsapp_business: Share2,
  telegram: Share2,
};

export default function SocialDigital() {
  const { checkWriteAccess } = usePermissions();
  const [channels, setChannels] = useState(dummySocialChannels);
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    // Merge scheduled content from calendar into posts
    const calendarPosts: SocialPost[] = dummyContentCalendars.map((cal: ContentCalendar) => ({
      id: cal.id,
      platform: 'facebook' as SocialPlatform, // Default platform, can be enhanced
      content: cal.content,
      mediaUrls: [],
      status: cal.status === 'scheduled' ? 'scheduled' : cal.status === 'published' ? 'published' : 'draft',
      moderationStatus: 'approved' as any,
      isPinned: false,
      priority: 'normal' as any,
      engagementMetrics: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
      },
      publishedAt: cal.status === 'published' ? cal.scheduledDate : undefined,
      scheduledAt: cal.status === 'scheduled' ? `${cal.scheduledDate}T${cal.scheduledTime || '09:00'}:00` : undefined,
      createdBy: cal.createdBy,
      createdAt: cal.createdAt,
      version: 1,
      isLocked: false,
    }));
    return [...dummySocialPosts, ...calendarPosts];
  });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'posts'>('posts');

  // Component mount/unmount logging
  useEffect(() => {
    console.log('[SocialDigital] Component mounted');
    return () => {
      console.log('[SocialDigital] Component unmounted');
    };
  }, []);

  // Global error handler
  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      console.error('[SocialDigital] Global error caught:', e.error);
      setHasError(true);
      setErrorMessage(e.error?.message || 'An unexpected error occurred');
    };
    
    const unhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[SocialDigital] Unhandled promise rejection:', e.reason);
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

  const canWrite = checkWriteAccess('communications');


  const handleCreatePost = (data: {
    content: string;
    platforms: SocialPlatform[];
    mediaFiles?: File[];
  }) => {
    // Convert to SocialPost format (using communications type)
    const newPost: SocialPost = {
      id: `POST-${String(posts.length + 1).padStart(3, '0')}`,
      platform: data.platforms[0] as any, // Using first platform for compatibility
      content: data.content,
      mediaUrls: data.mediaFiles?.map(f => URL.createObjectURL(f)) || [],
      status: 'published',
      moderationStatus: 'approved',
      isPinned: false,
      priority: 'normal' as any,
      engagementMetrics: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
      },
      publishedAt: new Date().toISOString(),
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      version: 1,
      isLocked: false,
    };

    setPosts(prev => [newPost, ...prev]);
    toast.success('Post created successfully', {
      description: `Posted to ${data.platforms.length} platform(s)`,
    });
    setIsPostModalOpen(false);
    setActiveTab('posts');
  };


  // Error state
  if (hasError) {
    return (
      <MainLayout>
        <PageHeader
          title="Social & Digital"
          description="Manage social media presence and digital content"
          breadcrumbs={[
            { label: 'Hub', href: '/hub' },
            { label: 'PR & Communication', href: '/pr' },
            { label: 'Social & Digital', href: '/pr/social' },
          ]}
        />
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Social & Digital</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage || 'An unexpected error occurred'}</p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const channelColumns = [
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (value: unknown, row: any) => {
        const Icon = platformIcons[row.platform] || Share2;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium capitalize">{row.platform.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      key: 'accountName',
      label: 'Account',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div>
          <div className="font-medium">{row.accountName}</div>
          <div className="text-xs text-gray-500">{row.accountHandle}</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: unknown, row: any) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.isActive ? 'default' : 'secondary'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {row.isOfficial && (
            <Badge variant="outline" className="text-xs">Official</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'managedBy',
      label: 'Managed By',
      render: (value: unknown, row: any) => (
        <div className="text-sm">{row.managedBy.length} users</div>
      ),
    },
  ];

  // Dynamic button based on active tab
  const getHeaderAction = () => {
    if (!canWrite) return undefined;

    switch (activeTab) {
      case 'posts':
        return (
          <Button 
            onClick={() => setIsPostModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        );
      case 'channels':
        return (
          <Button 
            onClick={() => toast({ title: 'Coming Soon', description: 'Channel management feature will be available soon.' })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Channel
          </Button>
        );
      default:
        return undefined;
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Social & Digital"
        description="Manage official social media accounts, content publishing, and moderation"
        actions={getHeaderAction()}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">
            <Share2 className="h-4 w-4 mr-2" />
            Social Channels
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Share2 className="h-4 w-4 mr-2" />
            Social Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <DataTable data={channels} columns={channelColumns} />
        </TabsContent>

        <TabsContent value="posts" className="m-0">
          <PostLog posts={posts} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreatePostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
        onPost={handleCreatePost}
      />
    </MainLayout>
  );
}
