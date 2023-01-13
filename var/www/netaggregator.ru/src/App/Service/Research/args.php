<?php /** @noinspection ForgottenDebugOutputInspection */

# php /var/www/cloudvps.loc/var/www/netaggregator.ru/src/App/Service/Research/args.php
# php /var/www/netaggregator.ru/src/App/Service/Research/args.php

declare(strict_types=1);

print_r(arguments($argv));

function arguments($args): array
{
    $endofoptions = false;
    array_shift($args);

    $ret = [
        'arguments' => [],
        'commands' => [],
        'options' => [],
        'flags' => []
    ];

    while ($arg = array_shift($args)) {
        // if we have reached end of options, we cast all remaining argvs as arguments
        if ($endofoptions) {
            $ret['arguments'][] = $arg;
            continue;
        }

        // is it a command? (prefixed with --)
        if (strpos($arg, '--') === 0) {
            // is it the end of options flag?
            if (!isset($arg[3])) {
                $endofoptions = true;
                continue;
            }

            $value = '';
            $com = substr($arg, 2);

            // is it the syntax '--option=argument'?
            if (strpos($com, '=')) {
                [$com, $value] = explode('=', $com, 2);

            // is the option not followed by another option but by arguments
            } else if(strpos($args[0],'-') !== 0) {
                while (strpos($args[0],'-') !== 0) {
                    $value .= array_shift($args) . ' ';
                }

                $value = rtrim($value, ' ');
            }

            $ret['options'][$com] = $value ?: true;
            continue;
        }

        // is it a flag or a serial of flags? (prefixed with -)
        if (strpos($arg, '-') === 0) {
            for ($i = 1; isset($arg[$i]); $i++) {
                $ret['flags'][] = $arg[$i];
            }

            continue;
        }

        // finally, it is not option, not flag, not argument
        $ret['commands'][] = $arg;
    }

    if (!count($ret['options']) && !count($ret['flags'])) {
        $ret['arguments'] = array_merge($ret['commands'], $ret['arguments']);
        $ret['commands'] = [];
    }

    return $ret;
}
