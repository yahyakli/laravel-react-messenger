<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'YAHYA AKLI',
            'email' => 'yahya@gmail.com',
            'password' => bcrypt('yahya'),
            'is_admin' => true
        ]);
        User::factory()->create([
            'name' => 'test user',
            'email' => 'test@gmail.com',
            'password' => bcrypt('test'),
            'is_admin' => false
        ]);

        User::factory(10)->create();
    }
}
