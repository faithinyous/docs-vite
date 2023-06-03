# docs.faithstory.info

## Usage

```bash
yarn install
yarn dev # http://localhost:5173
```

## Validate links

```bash
# npm install -g markdown-link-check
markdown-link-check **/*.md
```

## Algolia resources

<https://github.com/JasperFx/lamar/blob/master/docs/.vitepress/algolia-config.json>

change algolia-config.json

- start_urls -> your domain
- index_name -> your index name
- allowed_domains -> your domain

change .vitepress/config.ts

- appId: -> your app id
- apiKey: -> your api key
- indexName: -> your index name




## Notes

- If deploy on Cloud Pages, need to disable `auto minify for HTML and CSS`.

## Change google analytics

> .vitepress/config.ts
>
> change your google analytic ID


