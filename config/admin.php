<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin User Credentials
    |--------------------------------------------------------------------------
    |
    | These credentials are used by the database seeder to create the default
    | administrator account. Override them via environment variables before
    | running `php artisan db:seed` in production.
    |
    */

    'name' => env('ADMIN_NAME', 'Administrador'),

    'email' => env('ADMIN_EMAIL', 'admin@saporo.com'),

    'password' => env('ADMIN_PASSWORD', 'password'),

];
