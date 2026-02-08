import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/pr/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Instagram, Facebook, Twitter, Youtube, Share2, Filter } from 'lucide-react';
import type { SocialPlatform } from '@/types/pr-communication';
import type { SocialPost } from '@/types/communications';
import '@/styles/pr-communication.css';

const platformIcons: Record<SocialPlatform, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
};

const platformLabels: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
};

interface PostLogProps {
  posts: SocialPost[];
}

type PostStatusFilter = 'all' | 'published' | 'scheduled' | 'draft';

export function PostLog({ posts }: PostLogProps) {
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>('all');

  const filteredPosts = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter(post => {
      const status = (post as any).status || 'published';
      return status === statusFilter;
    });
  }, [posts, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const columns = [
    {
      key: 'content',
      label: 'Post',
      render: (_: unknown, row: SocialPost) => {
        const media = (row as any).mediaUrls || (row as any).media || [];
        return (
          <div className="space-y-1.5 min-w-0 max-w-md">
            <div className="text-sm font-medium text-foreground line-clamp-2">
              {row.content}
            </div>
            {media.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{media.length} media file(s)</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'platform',
      label: 'Platform',
      render: (_: unknown, row: SocialPost) => {
        // Handle both single platform (communications type) and multiple platforms (pr-communication type)
        const platforms = (row as any).platforms || [(row as any).platform];
        return (
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((platform: SocialPlatform) => {
              const Icon = platformIcons[platform] || Share2;
              return (
                <Badge key={platform} variant="outline" className="text-xs gap-1">
                  <Icon className="h-3 w-3" />
                  {platformLabels[platform]}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: unknown, row: SocialPost) => {
        const status = (row as any).status || 'published';
        const statusColors: Record<string, string> = {
          published: 'default',
          scheduled: 'secondary',
          draft: 'outline',
          archived: 'outline',
        };
        return (
          <Badge variant={statusColors[status] as any || 'outline'}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'engagement',
      label: 'Engagement',
      render: (_: unknown, row: SocialPost) => {
        const engagement = (row as any).engagementMetrics || (row as any).engagement || {};
        return (
          <div className="text-xs space-y-0.5">
            <div>👍 {engagement.likes || 0}</div>
            <div>💬 {engagement.comments || 0}</div>
            <div>📤 {engagement.shares || 0}</div>
          </div>
        );
      },
    },
    {
      key: 'publishedAt',
      label: 'Published',
      sortable: true,
      render: (_: unknown, row: SocialPost) => {
        const publishedAt = (row as any).publishedAt;
        const scheduledAt = (row as any).scheduledAt;
        return (
          <div className="text-sm text-muted-foreground">
            {publishedAt ? formatDate(publishedAt) : scheduledAt ? `Scheduled: ${formatDate(scheduledAt)}` : '—'}
          </div>
        );
      },
    },
  ];

  if (posts.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-12">
          <EmptyState
            icon={MessageSquare}
            title="No posts created yet"
            description="Create your first social media post to see it here"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Posts & Scheduled Content
            </CardTitle>
            <CardDescription className="mt-1">
              View all your social media posts, scheduled content, and their engagement
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PostStatusFilter)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-sm">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={filteredPosts}
          columns={columns}
          searchable={true}
          searchPlaceholder="Search posts, platforms, or content..."
          emptyMessage="No posts found"
        />
      </CardContent>
    </Card>
  );
}
