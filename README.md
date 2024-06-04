# JS Test Action

This action should never be used under any circumstances, be it life, death, or npm...

https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action

## Inputs

| input    | description               |
|----------|---------------------------|
| chrome:  | Remote Docker host        |
| firefox: | Remote Docker username    |

## Example usage

```yaml
name: "Test JS Test"

on:
  workflow_dispatch:
  release:
    types: [published]

jobs:
  test:
    name: "Test"
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: "Checkout"
        uses: actions/checkout@v3

      - name: "Test JS"
        uses: smashedr/js-test-action@master
        env:
          WEXT_SHIPIT_CHROME_EXTENSION_ID: ""
          WEXT_SHIPIT_CHROME_CLIENT_ID: ""
          WEXT_SHIPIT_CHROME_CLIENT_SECRET: ""
          WEXT_SHIPIT_CHROME_REFRESH_TOKEN: ""
          WEXT_SHIPIT_FIREFOX_JWT_ISSUER: ""
          WEXT_SHIPIT_FIREFOX_JWT_SECRET: ""
        with:
          chrome: "build/chrome.zip"
          firefox: "build/firefox.zip"
```
