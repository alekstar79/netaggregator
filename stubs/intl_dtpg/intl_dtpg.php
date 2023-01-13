<?php

// Start of intl_dtpg v.

/**
 * Class IntlDateTimePatternGenerator
 * @link https://github.com/ksimka/intl_dtpg
 * @since 7.0
 */
class IntlDateTimePatternGenerator
{
    /**
     * @param string $locale
     */
    public function __construct(string $locale) {}
    /**
     * Return the best pattern matching the input skeleton.
     * It is guaranteed to have all of the fields in the skeleton.
     *
     * @param string $skeleton The skeleton is a pattern containing only the variable fields.
     *           For example, "MMMdd" and "mmhh" are skeletons.
     * @return string The best pattern found from the given skeleton.
     */
    public function findBestPattern(string $skeleton) {}
}
