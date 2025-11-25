import {createClient} from "@sanity/client";
import imageURLBuilder from "@sanity/image-url";

export const config = {
  projectId: "ea0nujn4",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
};

export const client = createClient(config);

const adminConfig = {
    ...config,
    token: process.env.EXPO_PUBLIC_SANITY_API_TOKEN,
}

export const adminClient = createClient(adminConfig);

const builder = imageURLBuilder(config);

export const urlFor = (source: string) => {
  return builder.image(source);
};
