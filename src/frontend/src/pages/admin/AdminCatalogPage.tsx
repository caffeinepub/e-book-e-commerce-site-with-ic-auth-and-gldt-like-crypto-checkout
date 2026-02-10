import { useState } from 'react';
import { useGetAllBooks, useAddBook, useUpdateBook, useUpdateBookContent, useDeleteBook } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, ShieldCheck, Copy, Image, Music, Video } from 'lucide-react';
import { formatTokenAmount, parseTokenAmount } from '@/utils/format';
import { toast } from 'sonner';
import BookMediaManager from '@/components/admin/BookMediaManager';
import type { Book } from '@/backend';

export default function AdminCatalogPage() {
  const { data: books = [], isLoading } = useGetAllBooks();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'available'>('all');

  const filteredBooks = viewFilter === 'all' 
    ? books 
    : books.filter(book => book.available);

  const availableCount = books.filter(book => book.available).length;
  const unavailableCount = books.length - availableCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Catalog</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            <AddBookForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={viewFilter} onValueChange={(value) => setViewFilter(value as 'all' | 'available')}>
          <TabsList>
            <TabsTrigger value="all">
              All Books ({books.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available Only ({availableCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {viewFilter === 'all' && unavailableCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {unavailableCount} unavailable book{unavailableCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {viewFilter === 'all' ? 'No books in catalog yet' : 'No available books'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell className="font-mono">{formatTokenAmount(book.price)} GLDT</TableCell>
                  <TableCell>
                    <Badge variant={book.available ? 'default' : 'secondary'}>
                      {book.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {book.singleCopy && (
                        <Badge variant="outline" className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          Single
                        </Badge>
                      )}
                      {book.kycRestricted && (
                        <Badge variant="outline" className="text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          KYC
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {book.media.pdf && (
                        <Badge variant="default" className="text-xs">
                          PDF
                        </Badge>
                      )}
                      {book.media.images.length > 0 && (
                        <Badge variant="default" className="text-xs">
                          <Image className="h-3 w-3 mr-1" />
                          {book.media.images.length}
                        </Badge>
                      )}
                      {book.media.audio.length > 0 && (
                        <Badge variant="default" className="text-xs">
                          <Music className="h-3 w-3 mr-1" />
                          {book.media.audio.length}
                        </Badge>
                      )}
                      {book.media.video.length > 0 && (
                        <Badge variant="default" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          {book.media.video.length}
                        </Badge>
                      )}
                      {!book.media.pdf && book.media.images.length === 0 && book.media.audio.length === 0 && book.media.video.length === 0 && (
                        <Badge variant="outline" className="text-xs">
                          None
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingBook(book);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingBook(book);
                        setIsContentDialogOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingBook(book);
                        setIsMediaDialogOpen(true);
                      }}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <DeleteBookButton bookId={book.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          {editingBook && (
            <EditBookForm
              book={editingBook}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingBook(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Book Content</DialogTitle>
          </DialogHeader>
          {editingBook && (
            <EditContentForm
              book={editingBook}
              onSuccess={() => {
                setIsContentDialogOpen(false);
                setEditingBook(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Media Attachments</DialogTitle>
          </DialogHeader>
          {editingBook && <BookMediaManager book={editingBook} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddBookForm({ onSuccess }: { onSuccess: () => void }) {
  const addBook = useAddBook();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    price: '',
    content: '',
    singleCopy: false,
    kycRestricted: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = parseTokenAmount(formData.price);
      await addBook.mutateAsync({
        id: formData.id,
        title: formData.title,
        author: formData.author,
        price,
        content: formData.content || null,
        singleCopy: formData.singleCopy,
        kycRestricted: formData.kycRestricted,
      });
      toast.success('Book added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="id">Book ID</Label>
        <Input
          id="id"
          value={formData.id}
          onChange={(e) => setFormData({ ...formData, id: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (GLDT)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="1"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content (optional)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
        />
      </div>
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="singleCopy" className="text-base">Single Copy Only</Label>
          <p className="text-sm text-muted-foreground">
            Only one copy can be sold (sold out after first purchase)
          </p>
        </div>
        <Switch
          id="singleCopy"
          checked={formData.singleCopy}
          onCheckedChange={(checked) => setFormData({ ...formData, singleCopy: checked })}
        />
      </div>
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="kycRestricted" className="text-base">KYC Required (One Per Person)</Label>
          <p className="text-sm text-muted-foreground">
            Requires unique identifier; prevents same person from buying twice
          </p>
        </div>
        <Switch
          id="kycRestricted"
          checked={formData.kycRestricted}
          onCheckedChange={(checked) => setFormData({ ...formData, kycRestricted: checked })}
        />
      </div>
      <Button type="submit" disabled={addBook.isPending} className="w-full">
        {addBook.isPending ? 'Adding...' : 'Add Book'}
      </Button>
    </form>
  );
}

function EditBookForm({ book, onSuccess }: { book: Book; onSuccess: () => void }) {
  const updateBook = useUpdateBook();
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    price: formatTokenAmount(book.price),
    available: book.available,
    singleCopy: book.singleCopy,
    kycRestricted: book.kycRestricted,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = parseTokenAmount(formData.price);
      await updateBook.mutateAsync({
        id: book.id,
        title: formData.title,
        author: formData.author,
        price,
        available: formData.available,
        singleCopy: formData.singleCopy,
        kycRestricted: formData.kycRestricted,
      });
      toast.success('Book updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-author">Author</Label>
        <Input
          id="edit-author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-price">Price (GLDT)</Label>
        <Input
          id="edit-price"
          type="number"
          min="0"
          step="1"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="edit-available" className="text-base">Available for Purchase</Label>
          <p className="text-sm text-muted-foreground">
            Toggle book availability in the catalog
          </p>
        </div>
        <Switch
          id="edit-available"
          checked={formData.available}
          onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
        />
      </div>
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="edit-singleCopy" className="text-base">Single Copy Only</Label>
          <p className="text-sm text-muted-foreground">
            Only one copy can be sold (sold out after first purchase)
          </p>
        </div>
        <Switch
          id="edit-singleCopy"
          checked={formData.singleCopy}
          onCheckedChange={(checked) => setFormData({ ...formData, singleCopy: checked })}
        />
      </div>
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="edit-kycRestricted" className="text-base">KYC Required (One Per Person)</Label>
          <p className="text-sm text-muted-foreground">
            Requires unique identifier; prevents same person from buying twice
          </p>
        </div>
        <Switch
          id="edit-kycRestricted"
          checked={formData.kycRestricted}
          onCheckedChange={(checked) => setFormData({ ...formData, kycRestricted: checked })}
        />
      </div>
      <Button type="submit" disabled={updateBook.isPending} className="w-full">
        {updateBook.isPending ? 'Updating...' : 'Update Book'}
      </Button>
    </form>
  );
}

function EditContentForm({ book, onSuccess }: { book: Book; onSuccess: () => void }) {
  const updateContent = useUpdateBookContent();
  const [content, setContent] = useState(book.content || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContent.mutateAsync({ id: book.id, content });
      toast.success('Content updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update content');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Book Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="font-mono text-sm"
        />
      </div>
      <Button type="submit" disabled={updateContent.isPending} className="w-full">
        {updateContent.isPending ? 'Saving...' : 'Save Content'}
      </Button>
    </form>
  );
}

function DeleteBookButton({ bookId }: { bookId: string }) {
  const deleteBook = useDeleteBook();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBook.mutateAsync(bookId);
      toast.success('Book deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete book');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleteBook.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
