export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Elzem Hırdavat",
  description: "Hırdavat ve Mobilya Aksesuarları",
  navItems: [
    {
      label: "Ana Sayfa",
      href: "/",
    },
    {
      label: "Ürün Panelleri",
      href: "/create",
    },
  ],
  navMenuItems: [
    {
      label: "Ana Sayfa",
      href: "/",
    },
    {
      label: "Ürün Panelleri",
      href: "/create",
    },
  ],
  links: {
    github: "https://github.com/frontio-ai/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
