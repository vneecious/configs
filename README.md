Some configs and usefuls scripts

## cf-bind-env

Generates a default-json.env from the given service and service key.

Usage:

`cf-bind-env <service_name> <service_key> [-f | --filename [custom-filename.json]]`

### Example

```bash
cf-bind-env my-xsuaa my-xsuaa-key
```

```bash
cf-bind-env my-destination my-destination-key test-env.json
```
