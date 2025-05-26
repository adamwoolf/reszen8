import { createClient } from "contentful";

const client = createClient({
  space: "jnlo9oy3q5fc",
  accessToken: "3KaS-6qNzJgJiWW5Xe8t_pQXR1sIDb85Gvz0uYoRG6E",
});

const getStoreItems = () =>
  client.getEntries({ content_type: "storeItem", order: "fields.order" }).then((response) => response.items);

export { getStoreItems };
