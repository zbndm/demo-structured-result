import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';
import { index, configure } from 'instantsearch.js/es/widgets';
import { connectHits } from 'instantsearch.js/es/connectors';

import { pagination, products, searchBox } from './widgets';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

const search = instantsearch({
  searchClient,
  indexName: process.env.ALGOLIA_INDEX_NAME_MAIN,
  routing: {
    stateMapping: singleIndex(process.env.ALGOLIA_INDEX_NAME_MAIN),
  },
});

const structuredResults = connectHits(({ hits, widgetParams }) => {
  const result = hits[0];
  const { container } = widgetParams;

  if (
    result &&
    result._rankingInfo.words - 1 === result._rankingInfo.proximityDistance
  ) {
    container.innerHTML = `
      <img src="${result.url}" alt=${result.name} />
      <h3>${result.name}</h3>
    `;
    return;
  }

  container.innerHTML = `
    <p>No structured results for this query – try e.g. "Acer".</p>
  `;
});

search.addWidgets([
  pagination,
  products,
  searchBox,
  index({ indexName: process.env.ALGOLIA_INDEX_NAME_STRUCTURED }).addWidgets([
    configure({
      page: 0,
      hitsPerPage: 1,
      getRankingInfo: true,
    }),
    structuredResults({
      container: document.querySelector('#structured-result'),
    }),
  ]),
]);

search.start();
