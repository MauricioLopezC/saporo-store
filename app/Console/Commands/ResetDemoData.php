<?php

namespace App\Console\Commands;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('demo:reset {--force : Skip confirmation prompt}')]
#[Description('Truncates all tables and re-runs the demo seeder')]
class ResetDemoData extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! $this->option('force') && ! $this->confirm('This will delete ALL data and re-seed the demo database. Continue?')) {
            return self::FAILURE;
        }

        $this->info('Truncating tables...');

        $driver = DB::connection()->getDriverName();

        match ($driver) {
            'sqlite' => DB::statement('PRAGMA foreign_keys = OFF'),
            'mysql' => DB::statement('SET FOREIGN_KEY_CHECKS=0'),
            'pgsql' => DB::statement('SET session_replication_role = replica'),
            default => null,
        };

        $tables = DB::connection()->getSchemaBuilder()->getTableListing();

        foreach ($tables as $table) {
            if ($table === 'migrations') {
                continue;
            }

            DB::table($table)->truncate();
        }

        match ($driver) {
            'sqlite' => DB::statement('PRAGMA foreign_keys = ON'),
            'mysql' => DB::statement('SET FOREIGN_KEY_CHECKS=1'),
            'pgsql' => DB::statement('SET session_replication_role = DEFAULT'),
            default => null,
        };

        $this->info('Seeding demo data...');
        $this->call(DatabaseSeeder::class);

        $this->info('Done.');

        return self::SUCCESS;
    }
}
