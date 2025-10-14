import { createClient } from "contentful";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_API,
});

const getStoreItems = () =>
  client.getEntries({ content_type: "storeItem", order: "fields.order" }).then((response) => response.items);
const getMeditationItems = () =>
  client.getEntries({ content_type: "meditationItem" }).then((response) => response.items);

const getMeditationPage = () =>
  client.getEntries({ content_type: "meditationHubPage" }).then((response) => response.items[0]);

const getApparelPage = () => client.getEntries({ content_type: "apparelPage" }).then((response) => response.items[0]);
const getHomePage = () => client.getEntries({ content_type: "homepage" }).then((response) => response.items[0]);
const getMembershipPage = () =>
  client.getEntries({ content_type: "membershipPage" }).then((response) => response.items[0]);
const getCarouselSlides = () => client.getEntries({ content_type: "carouselSlide" }).then((response) => response);

const getFAQs = () => client.getEntries({ content_type: "faq" }).then((response) => response);
const getMembershipTiers = () =>
  client.getEntries({ content_type: "membershipTier", order: "fields.order" }).then((response) => response);

const getPrivacyPolicy = () => client.getEntries({ content_type: "privacyPolicy" }).then((response) => response);
const getTsAndCs = () => client.getEntries({ content_type: "termsAndConditions" }).then((response) => response);
const getCollectionImages = () => client.getEntries({ content_type: "collectionImage" }).then((response) => response);

export {
  getCollectionImages,
  getTsAndCs,
  getPrivacyPolicy,
  getMeditationItems,
  getStoreItems,
  getMeditationPage,
  getApparelPage,
  getHomePage,
  getCarouselSlides,
  getFAQs,
  getMembershipPage,
  getMembershipTiers,
};
