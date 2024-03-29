import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      "script",
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-FBBDK66XKD",
      },
    ],
    [
      "script",
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-FBBDK66XKD');",
    ],
  ],
  title: "Faith Docs",
  description: "Docs created by faith",
  // base: "/docs/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Technical", link: "docs/technical/index" },
    ],

    sidebar: [
      {
        text: "Technical",
        collapsed: true,
        items: [
          {
            text: "Home",
            link: "docs/technical/index",
          },
          {
            text: "Developer",
            collapsed: true,
            items: [
              { text: "Quasar", link: "docs/technical/dev/quasar" },
              {
                text: "Design & Animation",
                link: "docs/technical/dev/design_and_animation",
              },
              { text: "Graph", link: "docs/technical/dev/graph" },
              { text: "Database", link: "docs/technical/dev/database" },
              { text: "TypeOrm", link: "docs/technical/dev/typeorm" },
            ],
          },
          {
            text: "Ops",
            collapsed: true,
            items: [
              { text: "Docker", link: "docs/technical/ops/docker" },
              {
                text: "Kube",
                link: "docs/technical/ops/kube",
              },
            ],
          },
        ],
      },
      {
        text: "Management",
        collapsed: true,
        items: [
          {
            text: "Home",
            link: "docs/management/index",
          },
          {
            text: "Agile",
            link: "docs/management/agile",
          },
          {
            text: "One-on-One",
            link: "docs/management/one-on-one",
          },
          {
            text: "OKR/KPI",
            link: "docs/management/okr_kpi",
          },
          {
            text: "Product Management",
            link: "docs/management/product_management",
          },
        ],
      },
      {
        text: "Tools",
        link: "docs/tools",
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/faithinyous" },
      { icon: "linkedin", link: "https://www.linkedin.com/in/faithinyou/" },
    ],
    search: {
      provider: "algolia",
      options: {
        appId: "ITQDGZSRRF",
        apiKey: "059504c8a6dcec3a150a6027721a3513",
        indexName: "faith-docs",
      },
    },
  },
});
