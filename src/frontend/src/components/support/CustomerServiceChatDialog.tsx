import { useState } from 'react';
import { MessageCircle, Send, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useSendSupportMessage, useGetUserMessages } from '@/hooks/useSupportChat';
import { formatDate } from '@/utils/format';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CustomerServiceChatDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const sendMessage = useSendSupportMessage();
  const { data: userMessages = [], isLoading, refetch } = useGetUserMessages(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      return;
    }

    try {
      await sendMessage.mutateAsync(message);
      setMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
    }
  };

  // Group messages by thread (original message + responses)
  const threads = userMessages
    .filter((msg) => !msg.isAdminResponse && msg.responseToMsgId === undefined)
    .map((originalMsg) => ({
      original: originalMsg,
      responses: userMessages.filter(
        (msg) => msg.responseToMsgId !== undefined && msg.responseToMsgId === originalMsg.id
      ),
    }))
    .sort((a, b) => Number(b.original.timestamp - a.original.timestamp));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Customer Service Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Customer Service Chat</DialogTitle>
          <DialogDescription>
            {isAuthenticated
              ? 'Submit a question and view replies from our team.'
              : 'You can submit a question, but tracking replies is better when logged in.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Message submission form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Type your question here (minimum 10 characters)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {message.length < 10 && message.length > 0 && `${10 - message.length} more characters needed`}
              </span>
              <Button type="submit" disabled={sendMessage.isPending || message.trim().length < 10} size="sm">
                {sendMessage.isPending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
            {sendMessage.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {sendMessage.error instanceof Error ? sendMessage.error.message : 'Failed to send message'}
                </AlertDescription>
              </Alert>
            )}
            {sendMessage.isSuccess && (
              <Alert>
                <AlertDescription>Message sent successfully! We'll respond as soon as possible.</AlertDescription>
              </Alert>
            )}
          </form>

          {/* Message history for authenticated users */}
          {isAuthenticated && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Your Messages</h3>
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <ScrollArea className="flex-1 border rounded-md p-4">
                {threads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages yet. Submit a question above to get started.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {threads.map((thread) => (
                      <div key={thread.original.id.toString()} className="space-y-3">
                        {/* Original message */}
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-medium text-primary">You</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(thread.original.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{thread.original.content}</p>
                        </div>

                        {/* Responses */}
                        {thread.responses.map((response) => (
                          <div key={response.id.toString()} className="bg-primary/5 rounded-lg p-3 ml-6">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-medium text-primary">Support Team</span>
                              <span className="text-xs text-muted-foreground">{formatDate(response.timestamp)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
