<?php

declare(strict_types=1);

# root directory
$root = dirname(__DIR__, 2);

# root users
$allowed = [25520481];

# graphical extensions
$images = ['jpg','jpeg','png','gif','ico','bmp'];

# video extensions
$video = ['mp4'];

# pdf extensions
$pdf = ['pdf'];

# editable extensions
$extensions = [
    'css','sass','styl','html','htm','htaccess','md',
    'txt','tpl','log','lng','xml','ini','sql','twig',
    'c','cpp','cs','ts','py','go','hs','swift','java',
    'lua','php','json','js','mjs','vue','rjs','rb',
    'rbw','bash','sh'
];

# excluded paths
$exclude = [
    'node_modules', 'vendor', 'venv',
    '/nuxt/.nuxt', 'assets', 'cache',
    'VkApi', 'logs', 'lock'
];

# readme file
$readme = __DIR__ . '/readme.txt';

return compact('root','allowed','images','video','pdf','extensions','exclude','readme');
