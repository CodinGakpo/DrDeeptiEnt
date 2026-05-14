import { useEffect } from "react";
import { defaultSeo, SITE_NAME, SITE_URL } from "./config";

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  const scriptId = `jsonld-${id}`;
  let tag = document.head.querySelector(`#${scriptId}`);
  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = scriptId;
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  const tag = document.head.querySelector(`#jsonld-${id}`);
  if (tag) {
    tag.remove();
  }
}

export function useSeo(options = {}) {
  useEffect(() => {
    const seo = {
      ...defaultSeo,
      ...options,
    };

    const canonical = seo.canonical || `${SITE_URL}${window.location.pathname}`;
    const title = seo.title?.includes("|") ? seo.title : `${seo.title} | ${SITE_NAME}`;

    document.title = title;

    upsertMeta("meta[name='description']", {
      name: "description",
      content: seo.description,
    });
    upsertMeta("meta[name='robots']", {
      name: "robots",
      content: seo.robots,
    });

    upsertMeta("meta[property='og:type']", { property: "og:type", content: seo.type });
    upsertMeta("meta[property='og:title']", {
      property: "og:title",
      content: title,
    });
    upsertMeta("meta[property='og:description']", {
      property: "og:description",
      content: seo.description,
    });
    upsertMeta("meta[property='og:url']", {
      property: "og:url",
      content: canonical,
    });
    upsertMeta("meta[property='og:image']", {
      property: "og:image",
      content: seo.image,
    });
    upsertMeta("meta[property='og:site_name']", {
      property: "og:site_name",
      content: SITE_NAME,
    });

    upsertMeta("meta[name='twitter:card']", {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta("meta[name='twitter:title']", {
      name: "twitter:title",
      content: title,
    });
    upsertMeta("meta[name='twitter:description']", {
      name: "twitter:description",
      content: seo.description,
    });
    upsertMeta("meta[name='twitter:image']", {
      name: "twitter:image",
      content: seo.image,
    });

    upsertLink("canonical", canonical);

    if (seo.structuredData) {
      upsertJsonLd("primary", seo.structuredData);
    } else {
      removeJsonLd("primary");
    }
  }, [options]);
}
