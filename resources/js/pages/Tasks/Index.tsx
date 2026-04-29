import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    Pencil,
    Trash2,
    Edit,
    CheckCircle2,
    XCircle,
    Calendar,
    List,
    CheckCircle,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { dashboard } from '@/routes';

interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    is_completed: boolean;
    list_id: number;
    list: {
        id: number;
        title: string;
    };
}

interface List {
    id: number;
    title: string;
}

interface Props {
    tasks: {
        data: Task[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    lists: List[];
    filters: {
        search?: string;
        filter?: string;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tasks', href: '/tasks' }];

export default function TasksIndex({ tasks, lists, filters, flash }: Props) {
    const [open, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [showToast, setShowToast] = useState(
        !!flash.success || !!flash.error,
    );
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [completedFilter, setCompletedFilter] = useState<
        'completed' | 'pending' | 'all'
    >(filters.filter as 'all' | 'pending' | 'completed');
    const {
        data,
        setData,
        post,
        put,
        processing,
        reset,
        delete: destroy,
    } = useForm({
        title: '',
        description: '',
        due_date: '',
        list_id: '',
        is_completed: false as boolean,
    });

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setShowToast(true);
            setToastType('success');
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setShowToast(true);
            setToastType('error');
        }
    }, [flash]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [showToast]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingTask) {
            put(route('tasks.update', editingTask.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingTask(null);
                },
            });
        } else {
            post(route('tasks.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setData({
            title: task.title,
            description: task.description || '',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            list_id: task.list_id.toString(),
            is_completed: task.is_completed,
        });
        setIsOpen(true);
    };

    const handleDelete = (taskId: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            destroy(route('tasks.destroy', taskId));
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(
            route('tasks.index'),
            {
                search: search,
                filter: completedFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCompletedFilter(e.target.value as 'all' | 'pending' | 'completed');
        router.get(
            route('tasks.index'),
            {
                search: search,
                filter: e.target.value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('tasks.index'),
            {
                search: search,
                filter: completedFilter,
                page: page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex justify-between m-4">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click
                                    save when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="name-1">Name</Label>
                                    <Input
                                        id="name-1"
                                        name="name"
                                        defaultValue="Pedro Duarte"
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="username-1">Username</Label>
                                    <Input
                                        id="username-1"
                                        name="username"
                                        defaultValue="@peduarte"
                                    />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            </div>
        </AppLayout>
    );
}
