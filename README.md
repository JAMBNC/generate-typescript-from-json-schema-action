# Fastly EDGE Dictionary key update action

This github action will update the value of an Edge dictionary located within your Fastly service.
It utilizes the Fastly API to update this value. This will always update the lastest version of the service.

## Inputs

### `fastly_service_id`

**Required** The service id associated with your Fastly service.

### `fastly_api_key`

**Required** The API key used to update your Fastly service edge dictionary. The API key must at least have [Engineer Permissions](https://www.fastly.com/documentation/guides/account-info/user-access-and-control/configuring-user-roles-and-permissions/)

### `dictionary_name`

**Required** The name of the edge dictionary that you want to update

### `dictionary_key`

**Required** The key in the dictionary you want to update

### `dictionary_value`

**Required** The value to update the key to

### `purge_surrogate_key`

**Optional** A surrogate key to purge after the dictionary value has been updated. If no key is provided, nothing will be purged.

## Outputs

Nothing, basic logging is provided.

## Example usage

```yaml
uses: fastly-update-dictionary-value-action
with:
  fastly_service_id: <YOUR_FASTLY_SERVICE_ID>
  fastly_api_key: <YOUR_FASTLY_API_KEY>
  dictionary_name: url_map
  dictionary_key: origin
  dictionary_value: custom-origin
```
