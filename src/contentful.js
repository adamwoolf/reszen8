import { createClient } from "contentful";
const client = createClient({
    space: "jnlo9oy3q5fc",
    accessToken: "3KaS-6qNzJgJiWW5Xe8t_pQXR1sIDb85Gvz0uYoRG6E",
});
const getStoreItems = () => client.getEntries({ content_type: "storeItem", order: "fields.order" }).then((response) => response.items);
const getMeditationPage = () => client.getEntries({ content_type: "meditationHubPage" }).then((response) => response.items[0]);
const getApparelPage = () => client.getEntries({ content_type: "apparelPage" }).then((response) => response.items[0]);
const getHomePage = () => client.getEntries({ content_type: "homepage" }).then((response) => response.items[0]);
const getCarouselSlides = () => client.getEntries({ content_type: "carouselSlide" }).then((response) => response);
export { getStoreItems, getMeditationPage, getApparelPage, getHomePage, getCarouselSlides };
