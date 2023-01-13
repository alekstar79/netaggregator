<?php
/**
* @noinspection PhpUnused
* @noinspection UnknownInspectionInspection
* @noinspection NestedTernaryOperatorInspection
* @noinspection PhpUndefinedVariableInspection
* @noinspection PhpDefineCanBeReplacedWithConstInspection
*/

declare(strict_types=1);

/**
* html2canvas-php-proxy 1.1.4
* @see https://github.com/brcontainer/html2canvas-php-proxy
* Copyright (c) 2020 Guilherme Nascimento (brcontainer@yahoo.com.br)
* Released under the MIT license
*/

// Turn off errors because the script already own uses "error_get_last"
ini_set('display_errors', 'Off');

// Setup
define('H2CP_PATH', 'cache');               // Relative folder where the images are saved
define('H2CP_PERMISSION', 0666);            // use 644 or 666 for remove execution for prevent sploits
define('H2CP_CACHE', 60 * 5 * 1000);        // Limit access-control and cache, define 0/false/null/-1 to prevent cache
define('H2CP_TIMEOUT', 20);                 // Timeout from load Socket
define('H2CP_MAX_LOOP', 10);                // Configure loop limit for redirects (location header)
define('H2CP_DATAURI', false);              // Enable use of "data URI scheme"
define('H2CP_PREFER_CURL', true);           // Enable curl if avaliable or disable
define('H2CP_SECPREFIX', 'h2cp_');          // Prefix temp filename
define('H2CP_ALLOWED_DOMAINS', '*');        // * allow all domains, *.site.com for sub-domains, or fixed domains use `define('H2CP_ALLOWED_DOMAINS', 'site.com,www.site.com' )
define('H2CP_ALLOWED_PORTS', '80,443');     // Allowed ports
define('H2CP_ALTERNATIVE', 'console.log');  // callback alternative

/*
* Set false for disable SSL check
* Set true for enable SSL check, require config `curl.cainfo=/path/to/cacert.pem` in php.ini
* Set path (string) if need config CAINFO manually like this define('H2CP_SSL_VERIFY_PEER', '/path/to/cacert.pem');
*/
define('H2CP_SSL_VERIFY_PEER', false);

// Constants (don't change)
define('H2CP_EOL', chr(10));
define('H2CP_GMDATECACHE', gmdate('D, d M Y H:i:s'));
define('H2CP_INIT_EXEC', time());

if (empty($_GET['callback'])) {
    $callback = false;
} else {
    $callback = $_GET['callback'];
}

/*
* If execution has reached the time limit prevents page goes blank (off errors)
* or generate an error in PHP, which does not work with the DEBUG (from html2canvas.js)
*/
$maxExec = (int) ini_get('max_execution_time');
define('H2CP_MAX_EXEC', $maxExec < 1 ? 0 : ($maxExec - 5)); // reduces 5 seconds to ensure the execution of the DEBUG

$http_port = 0;
$response = [];
$tmp = null;

/**
* For show ASCII documents with "data uri scheme"
* @param string $str to encode
* @return string
*/
function asciiToInline(string $str): string
{
    static $translate;

    if ($translate === null) {
        $translate = array(
            H2CP_EOL => '%0A',
            ' ' => '%20',
            '"' => '%22',
            '#' => '%23',
            '&' => '%26',
            '\/' => '%2F',
            '\\' => '%5C',
            ':' => '%3A',
            '?' => '%3F',
            chr(0) => '%00',
            chr(8) => '',
            chr(9) => '%09',
            chr(13) => '%0D'
        );
    }

    return strtr($str, $translate);
}

/**
* Detect SSL stream transport
* @return boolean returns false if have an problem, returns true if ok
*/
function supportSSL(): bool
{
    static $supported;

    return $supported ?? ($supported = in_array('ssl', stream_get_transports(), !1));
}

/**
* Remove old files defined by H2CP_CACHE
* @return void
*/
function removeOldFiles()
{
    $p = H2CP_PATH . '/';

    if ((H2CP_MAX_EXEC === 0 || (time() - H2CP_INIT_EXEC) < H2CP_MAX_EXEC) && // prevents this function locks the process that was completed
        (file_exists($p) || is_dir($p))
    ) {
        $h = opendir($p);
        if (false !== $h) {
            while (false !== ($f = readdir($h))) {
                if (
                    is_file($p . $f) &&
                    strpos($f, H2CP_SECPREFIX) !== false &&
                    (H2CP_INIT_EXEC - filectime($p . $f)) > (H2CP_CACHE * 2)
                ) {
                    unlink($p . $f);
                }
            }
        }
    }
}

/**
* Detect if content-type is valid and get charset if available
* @param string $content content-type
* @return array
*/
function checkContentType(string $content): array
{
    $content = strtolower($content);
    $encode = null;

    if (preg_match('#[;](\\s+)?charset[=]#', $content) === 1) {
        $encode = preg_split('#[;](\\s+)?charset[=]#', $content);
        $encode = empty($encode[1]) ? null : trim($encode[1]);
    }

    $mime = trim(
        preg_replace('#[;](.*)?$#', '',
            str_replace('content-type:', '',
                str_replace('/x-', '/', $content)
            )
        )
    );

    if (in_array($mime, [
        'image/bmp', 'image/windows-bmp', 'image/ms-bmp',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'text/html', 'application/xhtml', 'application/xhtml+xml',
        'image/svg+xml', // SVG image
        'image/svg-xml' // Old servers (bug)
    ]) === false) {
        return ['error' => $mime . ' mimetype is invalid'];
    }

    return ['mime' => $mime, 'encode' => $encode];
}

/**
* Enconde string in "json" (only strings), json_encode (native in php) don't support for php4
* @param string $str to encode
* @param bool $onlyEncode
* @return string
*/
function JsonEncodeString(string $str, $onlyEncode = false): string
{
    static $translate;

    if ($translate === null) {
        $translate = [
            0 => '\\0',
            8 => '\\b',
            9 => '\\t',
            10 => '\\n',
            12 => '\\f',
            13 => '\\r',
            34 => '\\"',
            47 => '\\/',
            92 => '\\\\'
        ];
    }

    $enc = '';
    $j = strlen($str);

    for ($i = 0; $i < $j; ++$i) {
        $tmp = $str[$i];
        $c = ord($tmp);

        if ($c > 126) {
            $d = '000' . dechex($c);
            $tmp = '\\u' . substr($d, strlen($d) - 4);
        } else if (isset($translate[$c])) {
            $tmp = $translate[$c];
        } elseif (($c > 31) === false) {
            $d = '000' . dechex($c);
            $tmp = '\\u' . substr($d, strlen($d) - 4);
        }

        $enc .= $tmp;
    }

    if ($onlyEncode) {
        return $enc;
    }

    return '"' . $enc . '"';
}

/**
* Set headers in document
* @param boolean $nocache  If false set cache (if H2CP_CACHE > 0), If true set no-cache in document
* @return void
*/
function setHeaders(bool $nocache)
{
    if ($nocache === false && is_int(H2CP_CACHE) && H2CP_CACHE > 0) {
        // save to browser cache
        header('Last-Modified: ' . H2CP_GMDATECACHE . ' GMT');
        header('Cache-Control: max-age=' . (H2CP_CACHE - 1));
        header('Pragma: max-age=' . (H2CP_CACHE - 1));
        header('Expires: ' . gmdate('D, d M Y H:i:s', H2CP_INIT_EXEC + H2CP_CACHE - 1));
        header('Access-Control-Max-Age:' . H2CP_CACHE);
    } else {
        // no-cache
        header('Pragma: no-cache');
        header('Cache-Control: no-cache');
        header('Expires: '. H2CP_GMDATECACHE .' GMT');
    }

    // set access-control
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Request-Method: *');
    header('Access-Control-Allow-Methods: OPTIONS, GET');
    header('Access-Control-Allow-Headers: *');
}

/**
* Converte relative-url to absolute-url
* @param string $url set base url
* @param string $relative set relative url
* @return string if have an error, return blank string (scheme invalid)
*/
function relativeToAbsolute(string $url, string $relative): string
{
    if (strpos($relative, '//') === 0) { // http link //site.com/test
        return 'http:' . $relative;
    }
    if (preg_match('#^[a-z0-9]+[:]#i', $relative) !== 0) {
        $pu = parse_url($relative);

        if (preg_match('#^https?$#i', $pu['scheme']) === 0) {
            return '';
        }

        $relative = '';

        if (isset($pu['path'])) {
            $relative .= $pu['path'];
        }

        if (isset($pu['query'])) {
            $relative .= '?' . $pu['query'];
        }

        if (isset($pu['fragment'])) {
            $relative .= '#' . $pu['fragment'];
        }

        return relativeToAbsolute($pu['scheme'] . '://' . $pu['host'], $relative);
    }
    if (preg_match('/^[?#]/', $relative) !== 0) {
        return $url . $relative;
    }

    $pu = parse_url($url);
    $pu['path'] = isset($pu['path']) ? preg_replace('#/[^/]*$#', '', $pu['path']) : '';

    $pm = parse_url('http://1/' . $relative);
    $pm['path'] = $pm['path'] ?? '';

    $isPath = $pm['path'] !== '' && strpos(strrev($pm['path']), '/') === 0;

    if (strpos($relative, '/') === 0) {
        $pu['path'] = '';
    }

    $b = $pu['path'] . '/' . $pm['path'];
    $b = str_replace('\\', '/', $b); // Confuso ???

    $ab = explode('/', $b);

    $ab = array_filter($ab, 'strlen');
    $nw = [];

    foreach ($ab as $iValue) {
        if (isset($iValue) === false || $iValue === '.') {
            continue;
        }
        if ($iValue === '..') {
            array_pop($nw);
        } else {
            $nw[] = $iValue;
        }
    }

    $relative  = $pu['scheme'] . '://' . $pu['host'] . '/' . implode('/', $nw) . ($isPath ? '/' : '');

    if (isset($pm['query'])) {
        $relative .= '?' . $pm['query'];
    }
    if (isset($pm['fragment'])) {
        $relative .= '#' . $pm['fragment'];
    }

    $nw = null;
    $ab = null;
    $pm = null;
    $pu = null;

    return $relative;
}

/**
* Validate url
* @param string $url set base url
* @return boolean
*/
function isHttpUrl(string $url): bool
{
    return preg_match('#^https?[:]//.#i', $url) === 1;
}

/**
* Check if url is allowed
* @param string $url set base url
* @return boolean return always boolean
*/
function isAllowedUrl(string $url, &$message): bool
{
    $uri = parse_url($url);

    $domains = array_map('trim', explode(',', H2CP_ALLOWED_DOMAINS));

    if (in_array('*', $domains, !1) === false) {
        $ok = false;

        foreach ($domains as $domain) {
            if ($domain === $uri['host']) {
                $ok = true;
                break;

            }
            if (strpos($domain, '*') !== false) {
                $domain = strtr($domain, ['*' => '\\w+', '.' => '\\.']);

                if (preg_match('#^' . $domain . '$#i', $uri['host']) === 1) {
                    $ok = true;
                    break;
                }
            }
        }

        if ($ok === false) {
            $message = '"' . $uri['host'] . '" domain is not allowed';
            return false;
        }
    }

    if (empty($uri['port'])) {
        $port = strcasecmp('https', $uri['scheme']) === 0 ? 443 : 80;
    } else {
        $port = $uri['port'];
    }

    $ports = array_map('trim', explode(',', H2CP_ALLOWED_PORTS));

    if (in_array($port, $ports, !1)) {
        return true;
    }

    $message = '"' . $port . '" port is not allowed';

    return false;
}

/**
* Create folder for images download
* @return boolean
*/
function createFolder(): bool
{
    if (file_exists(H2CP_PATH) === false || is_dir(H2CP_PATH) === false) {
        return mkdir(H2CP_PATH, H2CP_PERMISSION);
    }

    return true;
}

/**
* Create temp file which will receive the download
* @param string $basename set url
* @param boolean $isEncode If true uses the "first" temporary name
* @return boolean|array If you can not create file return false, If create file return array
* @throws Exception
*/
function createTmpFile(string $basename, bool $isEncode)
{
    $folder = preg_replace('#/$#', '', H2CP_PATH) . '/';

    if ($isEncode === false) {
        $basename = H2CP_SECPREFIX . strlen($basename) . '.' . sha1($basename);
    }

    $tmpMime  = '.' . random_int(0, 1000) . '_';
    $tmpMime .= $isEncode ? time() : H2CP_INIT_EXEC;

    if (file_exists($folder . $basename . $tmpMime)) {
        return createTmpFile($basename, true);
    }

    $source = fopen($folder . $basename . $tmpMime, 'wb');

    if ($source !== false) {
        return array(
            'location' => $folder . $basename . $tmpMime,
            'source' => $source
        );
    }

    return false;
}

/**
* Download http request using curl extension (If found HTTP 3xx)
* @param string $url url requested
* @param resource $toSource save downloaded url contents
* @return array retuns array
* @noinspection CurlSslServerSpoofingInspection
* @noinspection PhpStrictTypeCheckingInspection
*/
function curlDownloadSource(string $url, $toSource): ?array
{
    $uri = parse_url($url);

    // Reformat url
    $currentUrl  = (empty($uri['scheme']) ? 'http': $uri['scheme']) . '://';
    $currentUrl .= empty($uri['host']) ? '': $uri['host'];

    if (isset($uri['port'])) {
        $currentUrl .= ':' . $uri['port'];
    }

    $currentUrl .= empty($uri['path']) ? '/': $uri['path'];
    $currentUrl .= empty($uri['query']) ? '': ('?' . $uri['query']);

    $ch = curl_init();

    if (H2CP_SSL_VERIFY_PEER) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    } elseif (is_string(H2CP_SSL_VERIFY_PEER)) {
        if (is_file(H2CP_SSL_VERIFY_PEER)) {
            curl_close($ch);
            return ['error' => 'Not found certificate: ' . H2CP_SSL_VERIFY_PEER];
        }

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_CAINFO, H2CP_SSL_VERIFY_PEER);
    } else {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    }

    curl_setopt($ch, CURLOPT_TIMEOUT, H2CP_TIMEOUT);
    curl_setopt($ch, CURLOPT_URL, $currentUrl);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, H2CP_MAX_LOOP);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);

    if (isset($uri['user'])) {
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_USERPWD, $uri['user'] . ':' . ($uri['pass'] ?? ''));
    }

    $headers = [];

    if (false === empty($_SERVER['HTTP_ACCEPT'])) {
        $headers[] = 'Accept: ' . $_SERVER['HTTP_ACCEPT'];
    }

    if (false === empty($_SERVER['HTTP_USER_AGENT'])) {
        $headers[] = 'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'];
    }

    if (false === empty($_SERVER['HTTP_REFERER'])) {
        $headers[] = 'Referer: ' . $_SERVER['HTTP_REFERER'];
    }

    $headers[] = 'Host: ' . $uri['host'];
    $headers[] = 'Connection: close';

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $data = curl_exec($ch);
    $curl_err = curl_errno($ch);

    $result = null;

    if ($curl_err !== 0) {
        $result = ['error' => 'CURL failed: ' . $curl_err];
    } else {
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

        if ($httpCode !== 200) {
            $result = array('error' => 'Request returned HTTP_' . $httpCode);
        }

        if ($result === null) {
            $result = checkContentType($contentType);

            if (empty($result['error'])) {
                fwrite($toSource, $data);
            }
        }
    }

    curl_close($ch);

    return $result;
}

/**
* Download http request recursive (If found HTTP 3xx)
* @param string $url url requested
* @param resource $toSource save downloaded url contents
* @param $caller
* @return array
*/
function downloadSource(string $url, $toSource, $caller): array
{
    $errno = 0;
    $errstr = '';

    ++$caller;

    if ($caller > H2CP_MAX_LOOP) {
        return ['error' => 'Limit of ' . H2CP_MAX_LOOP . ' redirects was exceeded, maybe there is a problem: ' . $url];
    }

    $uri = parse_url($url);
    $secure = strcasecmp($uri['scheme'], 'https') === 0;

    if ($secure && supportSSL() === false) {
        return ['error' => 'No SSL stream support detected'];
    }

    $port = empty($uri['port']) ? ($secure ? 443 : 80) : ((int) $uri['port']);
    $host = ($secure ? 'ssl://' : '') . $uri['host'];

    $fp = fsockopen($host, $port, $errno, $errstr, H2CP_TIMEOUT);

    if ($fp === false) {
        return ['error' => 'SOCKET: ' . $errstr . '(' . $errno . ') - ' . $host . ':' . $port];
    }

    fwrite(
        $fp, 'GET ' . (
            empty($uri['path'])  ? '/' : $uri['path']
        ) . (
            empty($uri['query']) ? '' : ('?' . $uri['query'])
        ) . ' HTTP/1.0' . H2CP_EOL
    );

    if (isset($uri['user'])) {
        $auth = base64_encode($uri['user'] . ':' . ($uri['pass'] ?? ''));
        fwrite($fp, 'Authorization: Basic ' . $auth . H2CP_EOL);
    }
    if (false === empty($_SERVER['HTTP_ACCEPT'])) {
        fwrite($fp, 'Accept: ' . $_SERVER['HTTP_ACCEPT'] . H2CP_EOL);
    }
    if (false === empty($_SERVER['HTTP_USER_AGENT'])) {
        fwrite($fp, 'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'] . H2CP_EOL);
    }
    if (false === empty($_SERVER['HTTP_REFERER'])) {
        fwrite($fp, 'Referer: ' . $_SERVER['HTTP_REFERER'] . H2CP_EOL);
    }

    fwrite($fp, 'Host: ' . $uri['host'] . H2CP_EOL);
    fwrite($fp, 'Connection: close' . H2CP_EOL . H2CP_EOL);

    $isRedirect = true;
    $isBody = false;
    $isHttp = false;
    $encode = null;
    $mime = null;

    while (false === feof($fp)) {
        if (H2CP_MAX_EXEC !== 0 && (time() - H2CP_INIT_EXEC) >= H2CP_MAX_EXEC) {
            return ['error' => 'Maximum execution time of ' . (H2CP_MAX_EXEC + 5) . ' seconds exceeded, configure this with ini_set/set_time_limit or "php.ini" (if safe_mode is enabled)'];
        }

        $data = fgets($fp);

        if ($data === false) {
            continue;
        }
        if ($isHttp === false) {
            if (preg_match('#^HTTP/1\.#i', $data) === 0) {
                fclose($fp); // Close connection

                return ['error' => 'This request did not return a HTTP response valid'];
            }

            $tmp = preg_replace('#(HTTP/1[.]\\d |\D)#i', '',
                preg_replace('#^(HTTP/1[.]\\d \\d{3}) [\\w\\W]+$#i', '$1', $data)
            );

            if ($tmp === '304') {
                fclose($fp); // Close connection

                return ['error' => 'Request returned HTTP_304, this status code is incorrect because the html2canvas not send Etag'];
            }

            $isRedirect = preg_match('#^3\\d{2}$#', $tmp) !== 0;

            if ($isRedirect === false && $tmp !== '200') {
                fclose($fp);

                return ['error' => 'Request returned HTTP_' . $tmp];
            }

            $isHttp = true;

            continue;
        }
        if ($isBody === false) {
            if (preg_match('#^location[:]#i', $data) !== 0) { // 200 force 302
                fclose($fp); // Close connection

                $data = trim(preg_replace('#^location[:]#i', '', $data));

                if ($data === '') {
                    return ['error' => '"Location:" header is blank'];
                }

                $nextUri = $data;
                $data = relativeToAbsolute($url, $data);

                if ($data === '') {
                    return ['error' => 'Invalid scheme in url (' . $nextUri . ')'];
                }

                if (isHttpUrl($data) === false) {
                    return ['error' => '"Location:" header redirected for a non-http url (' . $data . ')'];
                }

                return downloadSource($data, $toSource, $caller);

            }
            if (preg_match('#^content-length[:](\\s)?0$#i', $data) !== 0) {
                fclose($fp);

                return ['error' => 'source is blank (Content-length: 0)'];

            }
            if (preg_match('#^content-type[:]#i', $data) !== 0) {
                $response = checkContentType($data);

                if (isset($response['error'])) {
                    fclose($fp);
                    return $response;
                }

                $encode = $response['encode'];
                $mime = $response['mime'];

            } else if (trim($data) === '') {
                $isBody = true;
                continue;
            }
        } elseif ($isRedirect) {
            fclose($fp);

            return ['error' => 'The response should be a redirect "' . $url . '", but did not inform which header "Localtion:"'];
        } elseif ($mime === null) {
            fclose($fp);

            return ['error' => 'Not set the mimetype from "' . $url . '"'];
        } else {
            fwrite($toSource, $data);
        }
    }

    fclose($fp);

    if ($isBody === false) {
        return ['error' => 'Content body is empty'];
    }
    if ($mime === null) {
        return ['error' => 'Not set the mimetype from "' . $url . '"'];
    }

    return compact('mime','encode');
}

if (empty($_SERVER['HTTP_HOST'])) {
    $response = array('error' => 'The client did not send the Host header');
} elseif (empty($_SERVER['SERVER_PORT'])) {
    $response = array('error' => 'The Server-proxy did not send the PORT (configure PHP)');
} elseif (H2CP_MAX_EXEC < 10) {
    $response = array('error' => 'Execution time is less 15 seconds, configure this with ini_set/set_time_limit or "php.ini" (if safe_mode is enabled), recommended time is 30 seconds or more');
} elseif (H2CP_MAX_EXEC <= H2CP_TIMEOUT) {
    $response = array('error' => 'The execution time is not configured enough to TIMEOUT in SOCKET, configure this with ini_set/set_time_limit or "php.ini" (if safe_mode is enabled), recommended that the "max_execution_time =;" be a minimum of 5 seconds longer or reduce the TIMEOUT in "define(\'H2CP_TIMEOUT\', ' . H2CP_TIMEOUT . ');"');
} elseif (empty($_GET['url'])) {
    $response = array('error' => 'No such parameter "url"');
} elseif (isHttpUrl($_GET['url']) === false) {
    $response = array('error' => 'Only http scheme and https scheme are allowed');
} elseif (isAllowedUrl($_GET['url'], $message) === false) {
    $response = array('error' => $message);
} elseif (createFolder() === false) {
    $err = error_get_last();
    $response = array('error' => 'Can not create directory'. (
        $err !== null && empty($err['message']) ? '' : (': ' . $err['message'])
    ));
    $err = null;
} else {
    $http_port = $_SERVER['SERVER_PORT'];
    $tmp = createTmpFile($_GET['url'], false);

    if ($tmp === false) {
        $err = error_get_last();
        $response = ['error' => 'Can not create file'. (
            $err !== null && empty($err['message']) ? '' : (': ' . $err['message'])
        )];
        $err = null;
    } elseif (H2CP_PREFER_CURL && function_exists('curl_init')) {
        $response = curlDownloadSource($_GET['url'], $tmp['source']);
    } else {
        $response = downloadSource($_GET['url'], $tmp['source'], 0);
    }
    if ($tmp) {
        fclose($tmp['source']);
    }
}

// set MIME-type
header('Content-Type: application/javascript');

if (is_array($response) && false === empty($response['mime'])) {
    clearstatcache();

    if (false === file_exists($tmp['location'])) {
        $response = ['error' => 'Request was downloaded, but file can not be found, try again'];
    } elseif (filesize($tmp['location']) < 1) {
        $response = ['error' => 'Request was downloaded, but there was some problem and now the file is empty, try again'];
    } else {
        $extension = str_replace(
            ['image/', 'text/', 'application/', 'windows-bmp', 'ms-bmp', 'svg+xml', 'svg-xml', 'xhtml+xml', 'jpeg'],
            ['', '', '', 'bmp', 'bmp', 'svg', 'svg', 'xhtml', 'jpg'],
            $response['mime']
        );

        $locationFile = preg_replace('#[.][0-9_]+$#', '.' . $extension, $tmp['location']);

        if (file_exists($locationFile)) {
            unlink($locationFile);
        }
        if (rename($tmp['location'], $locationFile)) {
            setHeaders(false); // set cache
            removeOldFiles();

            $mime = $response['mime'];

            if ($response['encode'] !== null) {
                $mime .= ';charset=' . JsonEncodeString($response['encode'], true);
            }
            if ($callback === false) {
                header('Content-Type: ' . $mime);
                echo file_get_contents($locationFile);

            } else if (H2CP_DATAURI) {
                $tmp = $response = null;

                header('Content-Type: application/javascript');

                if (strpos($mime, 'image/svg') !== 0 && strpos($mime, 'image/') === 0) {
                    echo $callback, '("data:', $mime, ';base64,',
                        base64_encode(file_get_contents($locationFile)),
                    '");';
                } else {
                    echo $callback, '("data:', $mime, ',',
                        asciiToInline(file_get_contents($locationFile)),
                    '");';
                }
            } else {
                $tmp = $response = null;

                header('Content-Type: application/javascript');

                $dir_name = dirname($_SERVER['SCRIPT_NAME']);

                if ($dir_name === '\/' || $dir_name === '\\') {
                    $dir_name = '';
                }

                echo $callback, '(',
                    JsonEncodeString(
                        ($http_port === 443 ? 'https://' : 'http://') .
                        preg_replace('#[:]\\d+$#', '', $_SERVER['HTTP_HOST']) .
                        ($http_port === 80 || $http_port === 443 ? '' : (':' . $_SERVER['SERVER_PORT'])) .
                        $dir_name. '/' .
                        $locationFile
                    ),
                ');';
            }

            exit();
        }

        $response = ['error' => 'Failed to rename the temporary file'];
    }
}

if (is_array($tmp) && isset($tmp['location']) && file_exists($tmp['location'])) {
    unlink($tmp['location']); // Remove temporary file if an error occurred
}

setHeaders(true); // no-cache

header('Content-Type: application/javascript');

removeOldFiles();

if ($callback === false) {
    $callback = H2CP_ALTERNATIVE;
}

echo $callback, '(', JsonEncodeString('error: html2canvas-proxy-php: ' . $response['error']), ');';
