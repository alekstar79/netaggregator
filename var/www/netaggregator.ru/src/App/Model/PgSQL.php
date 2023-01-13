<?php /** @noinspection PhpUnhandledExceptionInspection */

declare(strict_types=1);

namespace App\Model;

/**
* Class PgSQL
* @package App\Model
*/
class PgSQL implements SimpleDBInterface
{
    private const DSN = [
        'user' => 'postgres',
        'host' => 'localhost',
        'port' => 5432,
        'dbname' => '',
        'password' => ''
    ];

    /** @var string */
    private string $dsn;

    /** @var resource */
    private $conn;

    public function __construct(array $options = [])
    {
        set_error_handler(static function() {
            return true;
        });

        if ($options) {
            $this->setConnectionParams($options);
        }
    }

    public function __destruct()
    {
        restore_error_handler();

        if (is_resource($this->conn)) {
            pg_close($this->conn);
        }

        unset($this->dsn, $this->conn);
    }

    public static function init(array $options): SimpleDBInterface
    {
        return new self($options);
    }

    public function setConnectionParams(array $options): self
    {
        $options = $this->filterArray($options, array_keys(self::DSN));
        $options = array_merge(self::DSN, $options);
        $dsn = '';

        foreach ($options as $key => $value) {
            $dsn .= $value ? sprintf('%s=%s ', $key, $value) : '';
        }

        $this->dsn = trim($dsn);
        return $this->connect();
    }

    public function getConnectionString(): ?string
    {
        return $this->dsn;
    }

    public function connect(): self
    {
        $conn = pg_connect($this->dsn);
        $stat = pg_connection_status($conn);

        if (is_resource($conn) && $stat === PGSQL_CONNECTION_OK) {
            $this->conn = $conn;
        } else {
            $this->error('Connection failed');
        }

        return $this;
    }

    public function query(string $query, ...$args)
    {
        return $this->rawQuery($this->prepareQuery($query, $args));
    }

    public function async(string $query, ...$args): bool
    {
        return $this->asyncQuery($this->prepareQuery($query, $args));
    }

    public function result()
    {
        return pg_get_result($this->conn);
    }

    public function delete(string $table, array $fields): bool
    {
        return pg_delete($this->conn, $table, $fields);
    }

    public function fetch($result, int $mode = PGSQL_ASSOC): ?array
    {
        return pg_fetch_array($result, null, $mode) ?: null;
    }

    public function affectedRows(): int
    {
        return pg_affected_rows($this->conn);
    }

    public function resultStatus($result): int
    {
        return pg_result_status($result);
    }

    public function numRows($result): int
    {
        return pg_num_rows($result);
    }

    public function free($result): void
    {
        pg_free_result($result);
    }

    public function createIN(array $data): string
    {
        if (!$data) {
            $this->error('Empty array for IN (?a) placeholder');
        }

        $query = $comma = '';
        foreach ($data as $value) {
            $query .= $comma . $this->escapeString($value);
            $comma  = ',';
        }

        return $query;
    }

    public function createSET(array $data): string
    {
        if (!$data) {
            $this->error('Empty array for SET (?u) placeholder');
        }

        $query = $comma = '';
        foreach ($data as $key => $value) {
            $query .= sprintf('%s = %s', $comma . $key, $this->escapeString($value));
            $comma  = ',';
        }

        return $query;
    }

    public function getOne(string $query, ...$args): ?string
    {
        $query = $this->prepareQuery($query, $args);

        if ($res = $this->rawQuery($query)) {
            $row = $this->fetch($res);
            $this->free($res);

            if (is_array($row)) {
                return reset($row);
            }
        }

        return null;
    }

    public function getRow(string $query, ...$args): ?array
    {
        $query = $this->prepareQuery($query, $args);

        if ($res = $this->rawQuery($query)) {
            $ret = $this->fetch($res);
            $this->free($res);

            return $ret;
        }

        return null;
    }

    public function getCol(string $query, ...$args): array
    {
        $query = $this->prepareQuery($query, $args);
        $ret = [];

        if ($res = $this->rawQuery($query)) {
            while($row = $this->fetch($res)) {
                $ret[] = reset($row);
            }

            $this->free($res);
        }

        return $ret;
    }

    public function getAll(string $query, ...$args): array
    {
        $query = $this->prepareQuery($query, $args);
        $ret = [];

        if ($res = $this->rawQuery($query)) {
            while($row = $this->fetch($res)) {
                $ret[] = $row;
            }

            $this->free($res);
        }

        return $ret;
    }

    public function getInd(string $index, string $query, ...$args): array
    {
        $query = $this->prepareQuery($query, $args);
        $ret = [];

        if ($res = $this->rawQuery($query)) {
            while($row = $this->fetch($res)) {
                $key = $row[$index];
                unset($row[$index]);
                $ret[$key] = $row;
            }

            $this->free($res);
        }

        return $ret;
    }

    public function parse(string $query, ...$args): string
    {
        return $this->prepareQuery($query, $args);
    }

    public function whiteList(string $input, array $allowed, $default = false)
    {
        if ($idx = array_search($input, $allowed, true)) {
            /** @var string|int $idx */
            return $allowed[$idx];
        }

        return $default;
    }

    public function filterArray(array $input, array $allowed): array
    {
        foreach(array_keys($input) as $key ) {
            if (!in_array($key, $allowed, true)) {
                unset($input[$key]);
            }
        }

        return $input;
    }

    private function rawQuery(string $query)
    {
        if (!$result = pg_query($this->conn, $query)) {
            $error = pg_last_error($this->conn);
            $this->error($error);
        }

        return $result;
    }

    private function asyncQuery(string $query): bool
    {
        return !pg_connection_busy($this->conn) && pg_send_query($this->conn, $query);
    }

    private function prepareQuery(string $query, array $args): string
    {
        $array = preg_split('~(\?[nsiuap])~u', $query, 0, PREG_SPLIT_DELIM_CAPTURE);
        $pnum  = 0;
        $anum  = 0;

        if (count($array) > 1) {
            $pnum = (int) floor(count($array) / 2);
            $anum = count($args);
            $query = '';
        }
        if ($pnum !== $anum) {
            $this->error("Number of args ($anum) doesn't match number of placeholders ($pnum)");
        }

        foreach ($array as $i => $part) {
            if (($i % 2) === 0) {
                $query .= $part;
                continue;
            }

            $value = array_shift($args);
            switch ($part) {
                case '?s': $part = $this->escapeString($value); break;
                case '?n': $part = $this->escapeIdent($value); break;
                case '?i': $part = $this->escapeInt($value); break;
                case '?u': $part = $this->createSET($value); break;
                case '?a': $part = $this->createIN($value); break;
                case '?p': $part = $value;
            }

            $query .= $part;
        }

        return $query;
    }

    private function escapeInt($value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (!is_numeric($value)) {
            $this->error('Integer (?i) placeholder expects numeric value, '. gettype($value) .' given');
        }
        if (is_float($value)) {
            $value = number_format($value, 0, '.', '');
        }

        return (string) $value;
    }

    /** @noinspection JsonEncodingApiUsageInspection */
    private function escapeString($value): string
    {
        switch (true) {
            case $value === null:
                $value = 'NULL';
                break;

            case !is_scalar($value):
                $value = "'". json_encode($value) ."'";
                break;

            default:
                $value = "'". $value ."'";
        }

        return $value;
    }

    private function escapeIdent($value): string
    {
        if (!$value) {
            $this->error('Empty value for identifier (?n) placeholder');
        }

        return pg_escape_identifier($value);
    }

    private function error(string $error): void
    {
        throw new PgSQLException(__CLASS__ .': '. $error);
    }
}
