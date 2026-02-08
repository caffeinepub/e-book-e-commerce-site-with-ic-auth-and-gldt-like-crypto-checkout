import { useState } from 'react';
import { useGetAllBooks, useAddBook, useUpdateBook, useUpdateBookContent, useDeleteBook, useUploadBookPdf, useRemoveBookPdf } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, FileText, Upload, X } from 'lucide-react';
import { formatTokenAmount, parseTokenAmount } from '@/utils/format';
import { toast } from 'sonner';
import type { Book } from '@/backend';

export default function AdminCatalogPage() {
  const { data: books = [], isLoading } = useGetAllBooks();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            <AddBookForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No books in catalog yet</p>
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
                <TableHead>PDF</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
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
                    <Badge variant={book.pdf ? 'default' : 'outline'}>
                      {book.pdf ? 'Yes' : 'No'}
                    </Badge>
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
                    <PdfUploadButton book={book} />
                    <DeleteBookButton bookId={book.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
      });
      toast.success('Book added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      });
      toast.success('Book updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="flex items-center space-x-2">
        <Switch
          id="edit-available"
          checked={formData.available}
          onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
        />
        <Label htmlFor="edit-available">Available for purchase</Label>
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
        {updateContent.isPending ? 'Updating...' : 'Update Content'}
      </Button>
    </form>
  );
}

function PdfUploadButton({ book }: { book: Book }) {
  const uploadPdf = useUploadBookPdf();
  const removePdf = useRemoveBookPdf();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      await uploadPdf.mutateAsync({
        bookId: book.id,
        pdfBytes: bytes,
        onProgress: (percentage) => {
          setUploadProgress(percentage);
        },
      });

      toast.success('PDF uploaded successfully');
      setUploadProgress(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePdf = async () => {
    if (!confirm('Are you sure you want to remove the PDF for this book?')) return;

    try {
      await removePdf.mutateAsync(book.id);
      toast.success('PDF removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove PDF');
    }
  };

  if (isUploading) {
    return (
      <div className="inline-flex flex-col items-center gap-1 min-w-[100px]">
        <Progress value={uploadProgress} className="h-2 w-full" />
        <span className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</span>
      </div>
    );
  }

  return (
    <div className="inline-flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        asChild
        disabled={uploadPdf.isPending}
      >
        <label className="cursor-pointer">
          <Upload className="h-4 w-4" />
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </Button>
      {book.pdf && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemovePdf}
          disabled={removePdf.isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function DeleteBookButton({ bookId }: { bookId: string }) {
  const deleteBook = useDeleteBook();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await deleteBook.mutateAsync(bookId);
      toast.success('Book deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete book');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteBook.isPending}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
