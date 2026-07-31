import { MetadataRoute } from "next";

const BASE_URL = "https://facelove.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}`,
          "en-US": `${BASE_URL}/en`,
          es: `${BASE_URL}/es`,
        },
      },
    },
    {
      url: `${BASE_URL}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/genres`,
          "en-US": `${BASE_URL}/en/genres`,
          es: `${BASE_URL}/es/generos`,
        },
      },
    },
    {
      url: `${BASE_URL}/themes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/themes`,
          "en-US": `${BASE_URL}/en/themes`,
          es: `${BASE_URL}/es/temas`,
        },
      },
    },
    {
      url: `${BASE_URL}/authors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/authors`,
          "en-US": `${BASE_URL}/en/authors`,
          es: `${BASE_URL}/es/autores`,
        },
      },
    },
    {
      url: `${BASE_URL}/stories`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/stories`,
          "en-US": `${BASE_URL}/en/stories`,
          es: `${BASE_URL}/es/historias`,
        },
      },
      images: [
        {
          url: `${BASE_URL}/images/stories-og.png`,
          width: 1200,
          height: 630,
          title: "FaceLove - Explore Nossas Histórias",
        },
      ],
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/search`,
          "en-US": `${BASE_URL}/en/search`,
          es: `${BASE_URL}/es/buscar`,
        },
      },
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          "pt-BR": `${BASE_URL}/community`,
          "en-US": `${BASE_URL}/en/community`,
          es: `${BASE_URL}/es/comunidad`,
        },
      },
      images: [
        {
          url: `${BASE_URL}/images/community-og.png`,
          width: 1200,
          height: 630,
          title: "FaceLove - Junte-se à Comunidade",
        },
      ],
    },
  ];

  return staticPages;
}
