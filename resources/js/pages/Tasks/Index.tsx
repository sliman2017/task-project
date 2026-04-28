import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Edit, CheckCircle2, XCircle, Calendar, List, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';

interface Task {
  id: number;
  title: string;
  description: string|null;
  due_date: string|null;
  is_completed: boolean;
  list_id: number;
  list: {
    id: number;
    title: string;
  }
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

const breadcrumbs: BreadcrumbItem[] = [
    {   title: 'Tasks',
        href: '/tasks', 
    },
];

export default function TasksIndex({ tasks, lists, filters, flash }: Props) {
    const [open, setIsOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task|null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [showToast, setShowToast] = useState(!!flash.success || !!flash.error);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [completedFilter, setCompletedFilter] = useState<'completed' | 'pending' | 'all'>(filters.filter as 'all' | 'pending' | 'completed');
    const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
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
        }
        else if (flash?.error) {
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
}