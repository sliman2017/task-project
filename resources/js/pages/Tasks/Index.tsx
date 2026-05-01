import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
    List,
    CheckCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    const [isOpen, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [showToast, setShowToast] = useState(
        !!flash.success || !!flash.error,
    );
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [completedFilter, setCompletedFilter] = useState<
        'completed' | 'pending' | 'all'
    >((filters.filter as 'all' | 'pending' | 'completed') || '');
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
        if (!isOpen) {
            setEditingTask(null);
            reset();
        }
    }, [isOpen]);

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
            <div className="m-4">
                <Head title="Tasks" />
                <div className="m-4 flex justify-between">
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                <Plus className="h-5 w-5" />
                                New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader className="mb-4">
                                    <DialogTitle>
                                        {editingTask ? 'Edit Task' : 'New Task'}
                                    </DialogTitle>
                                </DialogHeader>
                                <FieldGroup>
                                    <Field>
                                        <Label htmlFor="title-1">Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            name="title"
                                            placeholder="Task title"
                                        />
                                    </Field>
                                    <Field>
                                        <Label htmlFor="description-1">
                                            Description
                                        </Label>
                                        <Input
                                            id="description-1"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            name="description"
                                            placeholder="Task description"
                                        />
                                    </Field>
                                    <Field>
                                        <Label htmlFor="list-1">List</Label>
                                        <Select
                                            value={data.list_id}
                                            onValueChange={(value) =>
                                                setData('list_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select list" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lists.map((list) => (
                                                    <SelectItem
                                                        key={list.id}
                                                        value={list.id.toString()}
                                                    >
                                                        {list.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <Label htmlFor="due-date-1">
                                            Due Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) =>
                                                setData(
                                                    'due_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="focus:ring-2 focus:ring-primary"
                                        />
                                    </Field>
                                    <Field orientation="horizontal" className="mb-4 w-56">
                                        <Checkbox
                                            id="is_completed"
                                            checked={data.is_completed}
                                            onCheckedChange={(checked:boolean) =>
                                                setData(
                                                    'is_completed',
                                                    checked
                                                )
                                            }
                                            className="mt-2"
                                        />
                                        <FieldLabel
                                            htmlFor="is_completed"
                                            className="ml-2"
                                        >
                                            Completed
                                        </FieldLabel>
                                    </Field>
                                </FieldGroup>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Field className="mr-0 mb-4 flex flex-row items-center">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-8" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="mr-4 flex-1 justify-between text-muted-foreground"
                                variant="outline"
                            >
                                {completedFilter === 'all' || !completedFilter
                                    ? 'Filter by status'
                                    : completedFilter.charAt(0).toUpperCase() +
                                      completedFilter.slice(1)}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-sm font-semibold">
                                    Filter by status
                                </DropdownMenuLabel>

                                <DropdownMenuRadioGroup
                                    value={completedFilter}
                                    onValueChange={(value) =>
                                        setCompletedFilter(
                                            value as
                                                | 'all'
                                                | 'pending'
                                                | 'completed',
                                        )
                                    }
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="pending">
                                        Pending
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="completed">
                                        Completed
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Field>
                <Table className="w-max min-w-full table-auto border">
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>List</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-4 text-center"
                                >
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.data.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.list.title}</TableCell>
                                    <TableCell>
                                        {task.is_completed ? (
                                            <CheckCircle className="text-green-500" />
                                        ) : (
                                            <XCircle className="text-red-500" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {task.due_date
                                            ? new Date(
                                                  task.due_date,
                                              ).toLocaleDateString()
                                            : 'No due date'}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(task)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(task.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="mt-5 flex justify-center space-x-7">
                    <Button
                        variant="outline"
                        disabled={tasks.current_page === 1}
                        onClick={() => handlePageChange(tasks.current_page - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>
                        Page {tasks.current_page} of {tasks.last_page}
                    </span>
                    <Button
                        variant="outline"
                        disabled={tasks.current_page === tasks.last_page}
                        onClick={() => handlePageChange(tasks.current_page + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
