<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

declare(strict_types=1);

namespace Process;

use JsonException;

/**
 * Class PM2
 * @package Process
 */
class PM2 implements PM2Interface
{
    /**
     * @param string $file
     * @param string $alias
     * @param string $exec
     * @param string $restart
     * @param string $args
     * @return string
     */
    private static function line(string $file, string $alias, string $exec, string $restart, string $args): string
    {
        $line = $args ? 'pm2 start %s %s %s %s -- %s' : 'pm2 start %s %s %s %s';
        $line = sprintf($line, $file, $alias, $exec, $restart, $args);

        return trim(preg_replace('/\s+/', ' ', $line));
    }

    /**
     * @param string $re
     * @param string $s
     * @return array
     */
    private static function string(string $re, string $s): array
    {
        return explode('│', trim(preg_replace($re, '', $s), '│'));
    }

    /**
     * @param string $re
     * @param array $output
     * @return array
     */
    private static function parse(string $re, array $output): array
    {
        $exclude = '/PM2|https|\-\-update\-env/';

        return array_values(array_filter(
            array_map(static function($s) use($exclude) {
                if (preg_match($exclude, $s)) {
                    return null;
                }

                return self::string('/\s+/', $s);
            }, array_filter($output, static function($s) use($re) {
                return preg_match($re, $s);
            }))
        ));
    }

    /**
     * @param array $output
     * @return array
     */
    private static function parseList(array $output): array
    {
        if ($output = self::parse('/\w+/', $output)) {
            $k = array_shift($output);
            $k = array_replace($k, [array_search('↺', $k, false) => 'restarts']);

            return array_map(static function($v) use($k) {
                $process = array_combine($k, $v);

                unset($process['namespace'],$process['version'],$process['watching']);

                $process['restarts'] = (int) $process['restarts'];
                $process['pid'] = (int) $process['pid'];
                $process['id'] = (int) $process['id'];

                return $process;
            }, $output);
        }

        return [];
    }

    /**
     * @param array $output
     * @return array
     */
    private static function parseShow(array $output): array
    {
        $fields = '/status|script\sid|script\spath|exec\scwd|exec\smode|created\sat/';

        return array_map(static function($s) {
            [$prop, $value] = self::string('/exec|script|\sat|\s+/', $s);

            switch ($prop) {
                case 'created':
                    $value = strtotime($value);
                    break;
                case 'mode':
                    $value = explode('_', $value)[0];
                    break;
                case 'id':
                    $value = (int) $value;
            }

            return compact('prop','value');
        }, array_filter($output, static function($s) use($fields) {
            return preg_match($fields, $s);
        }));
    }

    /**
     * @param array $output
     * @return array
     */
    private static function sort(array $output): array
    {
        $priority = array_flip(['id','status','cwd','path','mode','created']);

        uksort($output, static function($a, $b) use($priority) {
            return $priority[$a] <=> $priority[$b];
        });

        return $output;
    }

    /**
     * @param array $args
     * @return string
     * @throws JsonException
     */
    public static function encode(array $args): string
    {
        return base64_encode(json_encode($args, JSON_THROW_ON_ERROR | 256));
    }

    /**
     * @param array $args
     * @return array
     * @throws JsonException
     */
    public static function decode(array $args): array
    {
        if ($data = base64_decode(implode($args))) {
            return json_decode($data, true, 512, JSON_THROW_ON_ERROR);
        }

        return [];
    }

    /**
     * @param array $filter
     * @return array
     */
    public static function list(array $filter = []): array
    {
        exec('pm2 list', $output, $ret);

        $output = self::parseList($output);

        if ($filter) {
            $keys = array_keys($filter);
            $c = count($filter);

            $output = array_filter($output, static function($item) use($filter, $keys, $c) {
                if (count(array_intersect_key($item, $filter)) !== $c) {
                    return false;
                }

                $set = 0;
                foreach ($keys as $k) {
                    if (preg_match('~' . preg_quote($filter[$k], '~') . '~', $item[$k])) {
                        $set++;
                    }
                }

                return $set === $c;
            });
        }

        return $output;
    }

    /**
     * @param int|string $entity
     * @return array
     */
    public static function show($entity): array
    {
        exec(sprintf('pm2 show %s', $entity), $output);

        $parsed = [];
        $i = 0;

        foreach (self::parseShow($output) as $cell) {
            if (!isset($parsed[$i][$cell['prop']])) {
                $parsed[$i][$cell['prop']] = $cell['value'];
                continue;
            }

            $i++;
        }

        return array_map([self::class, 'sort'], $parsed);
    }

    /**
     * @param string $file
     * @param string $name
     * @param string|array $args
     * @param string $exec [bash,python,ruby,coffee,php,perl,node]
     * @param string|bool $restart
     * @return array
     * @throws JsonException
     */
    public static function start(string $file, string $name = '', $args = null, string $exec = 'php', bool $restart = false): array
    {
        $name || ($name = explode('.', basename($file))[0]);

        if (is_array($args)) {
            $args = self::encode($args);
        }

        $restart = !$restart ? '--no-autorestart' : '';
        $exec = '--interpreter=' . $exec;
        $alias = '--name ' . $name;

        exec(self::line($file, $alias, $exec, $restart, $args), $output);

        $fields = array_flip(['id','name','mode','pid','status','user']);
        $output = self::parse(sprintf('/name|%s/', $name), $output);

        if (!isset($output[0], $output[1])) {
            return [];
        }

        $output = array_combine($output[0], $output[1]);
        $output = array_filter($output, static function($k) use($fields) {
            return isset($fields[$k]);
        }, 2);

        foreach ($output as $key => &$value) {
            if ($key === 'id' || $key === 'pid') {
                $value = (int) $value;
            }
        }

        return $output;
    }

    /**
     * @param int|string|array $entities
     * @param string|bool $update
     * @return array
     */
    public static function restart($entities = 'all', bool $update = true): array
    {
        if (is_array($entities)) {
            $entities = implode(' ', $entities);
        }

        $update = $update ? '--update-env' : '';

        exec(trim(sprintf('pm2 restart %s %s', $entities, $update)), $output);

        return self::parseList($output);
    }

    /**
     * @param int|string|array $entities
     * @return array
     */
    public static function stop($entities): array
    {
        if (is_array($entities)) {
            $entities = implode(' ', $entities);
        }

        exec(sprintf('pm2 stop %s', $entities), $output);

        return self::parseList($output);
    }

    /**
     * @param int|string|array $entities
     * @return array
     */
    public static function delete($entities): array
    {
        if (is_array($entities)) {
            $entities = implode(' ', $entities);
        }

        exec(sprintf('pm2 delete %s', $entities), $output);

        return self::parseList($output);
    }
}
