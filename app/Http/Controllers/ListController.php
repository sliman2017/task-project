<?php

namespace App\Http\Controllers;

use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lists = TaskList::query()
            ->where('user_id', '=', Auth::id())
            ->with('tasks')
            ->get();
        return Inertia::render('Lists/Index',[
            'lists' => $lists,
            'flash'=> [
                'success'=>session('success'),
                'error'=>session('error'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'=>'required|string|max:255',
            'description'=>'nullable|string',
        ]);

        TaskList::create([
            ...$validated,
            'user_id'=>Auth::id(),
        ]);
        return redirect()->route('lists.index')->with('success','List created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskList $list)
    {
            $validated = $request->validate([
            'title'=>'required|string|max:255',
            'description'=>'nullable|string',
        ]);

        $list->update($validated);
        return redirect()->route('lists.index')->with('success','List updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskList $list)
    {
        $list->delete();
        return redirect()->route('lists.index')->with('success','List deleted successfully');
    }
}
