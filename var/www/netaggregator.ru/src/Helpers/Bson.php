<?php // This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

/**
* BSON, short for Binary JSON, is a binary-encoded serialization of JSON-like documents. Like JSON, BSON supports the
* embedding of documents and arrays within other documents and arrays. BSON also contains extensions that allow representation
* of data types that are not part of the JSON spec. For example, BSON has a Date type and a BinData type. BSON can be compared
* to binary interchange formats, like Protocol Buffers. BSON is more "schemaless" than Protocol Buffers, which can give it
* an advantage in flexibility but also a slight disadvantage in space efficiency (BSON has overhead for field names within
* the serialized data). BSON was designed to have the following three characteristics:
*
*   Lightweight. Keeping spatial overhead to a minimum is important for any data representation format, especially when
*      used over the network.
*
*   Traversable. BSON is designed to be traversed easily. This is a vital property in its role as the primary data
*      representation for MongoDB.
*
*   Efficient. Encoding data to BSON and decoding from BSON can be performed very quickly in most languages due
*      to the use of C data types.
*
* @see https://github.com/kaitai-io/kaitai_struct_php_runtime
* @see https://github.com/kaitai-io/kaitai_struct_compiler
* @see https://formats.kaitai.io/bson
* @see https://kaitai.io
*/
