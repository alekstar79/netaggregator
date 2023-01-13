# SampleApi.DefaultApi

All URIs are relative to *https://api.example.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**usersGet**](DefaultApi.md#usersGet) | **GET** /users | Returns a list of users.



## usersGet

> usersGet()

Returns a list of users.

Optional extended description in Markdown.

### Example

```javascript
import SampleApi from 'sample_api';

let apiInstance = new SampleApi.DefaultApi();
apiInstance.usersGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

