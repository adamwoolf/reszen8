const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const TOKEN = import.meta.env.VITE_CONTENTFUL_API;
const GRAPHQL_URL = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

async function fetchGraphQL(query: string) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text(); // get raw response
  if (!res.ok) {
    console.error("GraphQL fetch failed:", text);
    throw new Error("Failed to fetch Contentful GraphQL data");
  }

  return JSON.parse(text).data;
}

// single GraphQL query for all content types
const ALL_CONTENT_QUERY = `
query AllContent {
  homepageCollection {
    items { sys { id } title description tagline  }
  }
  membershipPageCollection {
    items { sys { id } title subtitle }
  }
  enterprisePageCollection {
    items { sys { id } title subtitle description reasonsList bottomText ctaLabel optionsHeading }
  }
  
  faqCollection {
    items { sys { id } question answer }
  }
  membershipTierCollection(order: order_ASC) {
    items { sys { id } title price billing description id features order freeTrial badge priceId medCredits yearlyPriceId yearlyPriceDescription yearlyMeditationCredits yearlyId yearlyBilling yearlyPrice  }
  }
  enterpriseOptionCollection(order: order_ASC) {
    items { sys { id } title subtitle price billing description features order bestFor ctaLabel  }
  }
  privacyPolicyCollection {
    items { sys { id } text }
  }
  termsAndConditionsCollection {
    items { sys { id } text }
  }
  meditationThemeCollection {
   items  { sys { id } title description }
  }
  collectionImageCollection(order: order_ASC) {
    items {
      sys { id }
      collectionName
      order
      image {
        url
      }
    }
  }
}

`;

// fetch all content once
let cachedContent: any = null;
async function getAllContent() {
  if (!cachedContent) {
    cachedContent = await fetchGraphQL(ALL_CONTENT_QUERY);
  }
  return cachedContent;
}

// keep the same exported functions as before
const getStoreItems = async () => {
  const data = await getAllContent();
  return data.storeItemCollection.items;
};

const getMeditationItems = async () => {
  const data = await getAllContent();
  return data.meditationItemCollection.items;
};

const getMeditationPage = async () => {
  const data = await getAllContent();
  return data.meditationHubPageCollection.items[0];
};

const getApparelPage = async () => {
  const data = await getAllContent();
  return data.apparelPageCollection.items[0];
};

const getHomePage = async () => {
  const data = await getAllContent();
  return data.homepageCollection.items[0];
};
const getEnterprisePage = async () => {
  const data = await getAllContent();
  return data.enterprisePageCollection.items[0];
};

const getMembershipPage = async () => {
  const data = await getAllContent();
  return data.membershipPageCollection.items[0];
};

const getCarouselSlides = async () => {
  const data = await getAllContent();
  return data.carouselSlideCollection.items;
};

const getFAQs = async () => {
  const data = await getAllContent();
  return data.faqCollection.items;
};

const getMembershipTiers = async () => {
  const data = await getAllContent();
  return data.membershipTierCollection.items;
};
const getEnterpriseOptions = async () => {
  const data = await getAllContent();
  return data.enterpriseOptionCollection.items;
};

const getPrivacyPolicy = async () => {
  const data = await getAllContent();
  return data.privacyPolicyCollection.items[0];
};

const getTsAndCs = async () => {
  const data = await getAllContent();
  return data.termsAndConditionsCollection.items[0];
};

const getCollectionImages = async () => {
  const data = await getAllContent();
  return data.collectionImageCollection.items;
};
const getMeditationThemes = async () => {
  const data = await getAllContent();
  return data.meditationThemeCollection.items;
};

export {
  getMeditationThemes,
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
  getEnterpriseOptions,
  getEnterprisePage,
};
