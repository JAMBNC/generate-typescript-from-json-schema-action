# JSON Schema Typescript generation package

This github acio

## Inputs

### `schema_dir`

**Required** The directory of the current repo the base JSON Schema files are located at 


### `token`

**Required** A github token with access to the repo

### `target_repo`

**Required** The repo to push the typescript types to

### `target_branch`

**Required** The target repo branch to push the typescript definitions to.

## Outputs

Nothing, basic logging is provided.

## Example usage

```yaml
uses: 'generate-typescript-from-json-schema'
with:
  schema_dir: './src/my-schemas'
  token: ${{ secrets.GITHUB_TOKEN }}
  target_repo: 'JAMBNC/ts-types-jam'
  target_branch: 'main'
```
