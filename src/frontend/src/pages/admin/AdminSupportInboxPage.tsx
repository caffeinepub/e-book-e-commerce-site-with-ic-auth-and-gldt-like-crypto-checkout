import { useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAdminSupportInbox, useRespondToMessage } from '@/hooks/useSupportChat';
import { formatDate } from '@/utils/format';
import type { CustomerMessage } from '@/backend';

export default function AdminSupportInboxPage() {
  const { data: allMessages = [], isLoading, refetch } = useGetAdminSupportInbox();
  const respondToMessage = useRespondToMessage();
  const [selectedMessageId, setSelectedMessageId] = useState<bigint | null>(null);
  const [replyText, setReplyText] = useState('');

  // Group messages by thread
  const threads = allMessages
    .filter((msg) => !msg.isAdminResponse && msg.responseToMsgId === undefined)
    .map((originalMsg) => ({
      original: originalMsg,
      responses: allMessages.filter(
        (msg) => msg.responseToMsgId !== undefined && msg.responseToMsgId === originalMsg.id
      ),
    }))
    .sort((a, b) => Number(b.original.timestamp - a.original.timestamp));

  const handleReply = async (messageId: bigint) => {
    if (replyText.trim().length < 10) {
      return;
    }

    try {
      await respondToMessage.mutateAsync({ messageId, response: replyText });
      setReplyText('');
      setSelectedMessageId(null);
    } catch (error: any) {
      console.error('Failed to send reply:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support Inbox</h2>
          <p className="text-muted-foreground">View and respond to customer messages</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No support messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Card key={thread.original.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Message from {thread.original.author.toString().slice(0, 10)}...
                    </CardTitle>
                    <CardDescription>{formatDate(thread.original.timestamp)}</CardDescription>
                  </div>
                  {thread.responses.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {thread.responses.length} {thread.responses.length === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original message */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{thread.original.content}</p>
                </div>

                {/* Existing responses */}
                {thread.responses.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2">
                    {thread.responses.map((response) => (
                      <div key={response.id.toString()} className="bg-primary/5 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-medium text-primary">You replied</span>
                          <span className="text-xs text-muted-foreground">{formatDate(response.timestamp)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {selectedMessageId === thread.original.id ? (
                  <div className="space-y-3 pl-4 border-l-2">
                    <Textarea
                      placeholder="Type your reply here (minimum 10 characters)..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(thread.original.id)}
                        disabled={respondToMessage.isPending || replyText.trim().length < 10}
                      >
                        {respondToMessage.isPending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMessageId(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {respondToMessage.isError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {respondToMessage.error instanceof Error
                            ? respondToMessage.error.message
                            : 'Failed to send reply'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMessageId(thread.original.id)}
                    className="ml-4"
                  >
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
