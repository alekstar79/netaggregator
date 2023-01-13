<?php declare(strict_types=1);

namespace App\Model;

/**
* Interface SimpleDBInterface
* @package App\Model
*/
interface SimpleDBInterface
{
    /**
     * Initialize the database client
     * @param array $options
     * @return SimpleDBInterface
     */
    public static function init(array $options): SimpleDBInterface;

    /**
     * Set connection string from array options
     * @param array $options
     */
    public function setConnectionParams(array $options);

    /**
     * Returns the connection string
     * @return string
     */
    public function getConnectionString(): ?string;

    /**
     * DB connection
     */
    public function connect();

    /**
     * Conventional function to run a query with placeholders.
     *
     * Examples:
     * $db->query("DELETE FROM table WHERE id=?i", $id);
     *
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return resource
     */
    public function query(string $query, ...$args);

    /**
     * Asynchronous function to run a query with placeholders.
     *
     * @see query method for example
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return boolean
     */
    public function async(string $query, ...$args): bool;

    /**
     * Get asynchronous query result
     * @return mixed
     */
    public function result();

    /**
     * Deletes records from a table specified by the keys
     * and values in fields
     *
     * @param string $table
     * @param array $fields
     * @return bool
     */
    public function delete(string $table, array $fields): bool;

    /**
     * Conventional function to fetch single row
     * @param resource $result
     * @param int $mode optional fetch mode
     *        PGSQL_ASSOC|PGSQL_NUM|PGSQL_BOTH,
     *        default PGSQL_ASSOC
     *
     * @return array
     */
    public function fetch($result, int $mode = PGSQL_ASSOC): ?array;

    /**
     * Conventional function to get number of affected rows
     * @return int whatever pg_affected_rows returns
     */
    public function affectedRows(): int;

    /**
     * Conventional function to get query status
     * @param $result
     * @return int
     */
    public function resultStatus($result): int;

    /**
     * Conventional function to get number of rows in the resultset
     * @param resource $result
     * @return int whatever pg_num_rows returns
     */
    public function numRows($result): int;

    /**
     * Conventional function to free the resultset
     * @param resource $result
     */
    public function free($result): void;

    /**
     * Helper function to get scalar value right out of query
     * and optional arguments
     *
     * Examples:
     * $name = $db->getOne("SELECT name FROM table WHERE id=1");
     * $name = $db->getOne("SELECT name FROM table WHERE id=?i", $id);
     *
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return string either first column of the first row of resultset
     */
    public function getOne(string $query, ...$args): ?string;

    /**
     * Helper function to get single row right out of query
     * and optional arguments
     *
     * Examples:
     * $data = $db->getRow("SELECT * FROM table WHERE id=1");
     * $data = $db->getRow("SELECT * FROM table WHERE id=?i", $id);
     *
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return array either associative array contains first row of resultset
     */
    public function getRow(string $query, ...$args): ?array;

    /**
     * Helper function to get single column right out of query
     * and optional arguments
     *
     * Examples:
     * $ids = $db->getCol("SELECT id FROM table WHERE cat=1");
     * $ids = $db->getCol("SELECT id FROM tags WHERE tagname = ?s", $tag);
     *
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return array either enumerated array of first fields of all rows of resultset
     */
    public function getCol(string $query, ...$args): ?array;

    /**
     * Helper function to get all the rows of resultset right out of query
     * and optional arguments
     *
     * Examples:
     * $data = $db->getAll("SELECT * FROM table");
     * $data = $db->getAll("SELECT * FROM table LIMIT ?i, ?i", $start, $rows);
     *
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return array enumerated 2d array contains the resultset. Empty if no rows found.
     */
    public function getAll(string $query, ...$args): array;

    /**
     * Helper function to get all the rows of resultset into indexed array
     * right out of query and optional arguments
     *
     * Examples:
     * $data = $db->getInd("id", "SELECT * FROM table");
     * $data = $db->getInd("id", "SELECT * FROM table LIMIT ?i, ?i", $start, $rows);
     *
     * @param string $index name of the field which value is used to index resulting array
     * @param string $query an SQL query with placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the query
     * @return array associative 2d array contains the resultset. Empty if no rows found.
     */
    public function getInd(string $index, string $query, ...$args): array;

    /**
     * Function to parse placeholders either in the full query or
     * a query part unlike native prepared statements,
     * allows ANY query part to be parsed
     *
     * useful for debug
     * and EXTREMELY useful for conditional query building
     * like adding various query parts using loops, conditions, etc.
     * already parsed parts have to be added via ?p placeholder
     *
     * Examples:
     * $query = $db->parse("SELECT * FROM table WHERE foo=?s AND bar=?s", $foo, $bar);
     * echo $query;
     *
     * if ($foo) {
     *     $qpart = $db->parse(" AND foo=?s", $foo);
     * }
     *
     * $data = $db->getAll("SELECT * FROM table WHERE bar=?s ?p", $bar, $qpart);
     *
     * @param string $query whatever expression contains placeholders
     * @param mixed $args unlimited number of arguments to match placeholders in the expression
     * @return string initial expression with placeholders substituted with data.
     */
    public function parse(string $query, ...$args): string;

    /**
     * Function to implement whitelisting feature sometimes we can't allow
     * a non-validated user-supplied data to the query even through
     * placeholder especially if it comes down to SQL OPERATORS
     *
     * Example:
     * $order = $db->whiteList($_GET['order'], array('name','price'));
     * $dir   = $db->whiteList($_GET['dir'],   array('ASC','DESC'));
     *
     * if (!$order || !dir) {
     *     throw new http404(); // non-expected values should cause 404 or similar response
     * }
     *
     * $sql  = "SELECT * FROM table ORDER BY ?p ?p LIMIT ?i,?i"
     * $data = $db->getArr($sql, $order, $dir, $start, $per_page);
     *
     * @param string $input field name to test
     * @param array $allowed an array with allowed variants
     * @param mixed $default optional variable to set if no match found. Default to false.
     * @return string|mixed   either sanitized value
     */
    public function whiteList(string $input, array $allowed, $default = false);

    /**
     * Function to filter out arrays, for the whitelisting purposes
     * useful to pass entire superglobal to the INSERT or UPDATE query
     * OUGHT to be used for this purpose, as there could be fields
     * to which user should have no access to.
     *
     * Example:
     * $allowed = array('title','url','body','rating','term','type');
     * $data    = $db->filterArray($_POST, $allowed);
     * $sql     = "INSERT INTO ?n SET ?u";
     * $db->query($sql,$table,$data);
     *
     * @param  array $input source array
     * @param  array $allowed an array with allowed field names
     * @return array filtered out source array
     */
    public function filterArray(array $input, array $allowed): array;
}
