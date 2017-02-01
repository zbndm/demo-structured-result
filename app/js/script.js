/*
  global $, algoliasearch, algoliasearchHelper, Hogan
*/
$(document).ready(() => {
  // INITIALIZATION
  // ==============

  // Replace with your own values
  const APPLICATION_ID = 'VC519DRAY3';
  const SEARCH_ONLY_API_KEY = '5c796d39dcd489e62b89b38dae03fbc4';
  const INDEX_NAME = 'altCorrecTest';
  const PARAMS = {
    hitsPerPage: 10,
    index: INDEX_NAME,
  };

  // Client + Helper initialization
  const algolia = algoliasearch(APPLICATION_ID, SEARCH_ONLY_API_KEY);
  const algoliaHelper = algoliasearchHelper(algolia, INDEX_NAME, PARAMS);
  const structuredDataHelper = algoliaHelper.derive(searchParameters => searchParameters.setIndex('structured_data'));

  // DOM BINDING
  const $searchInput = $('#search-input');
  const $searchInputIcon = $('#search-input-icon');
  const $main = $('main');
  const $hits = $('#hits');
  const $stats = $('#stats');
  const $structuredData = $('#structured-data');
  const $pagination = $('#pagination');

  // Hogan templates binding
  const hitTemplate = Hogan.compile($('#hit-template').text());
  const statsTemplate = Hogan.compile($('#stats-template').text());
  const paginationTemplate = Hogan.compile($('#pagination-template').text());
  const noResultsTemplate = Hogan.compile($('#no-results-template').text());
  const structuredDataTemplate = Hogan.compile($('#structured-data-template').text());

  // SEARCH BINDING
  // ==============

  // Input binding
  $searchInput
  .on('input propertychange', e => {
    const query = e.currentTarget.value;

    toggleIconEmptyInput(query);
    algoliaHelper.setQuery(query).search();
  })
  .focus();

  // Search errors
  algoliaHelper.on('error', error => {
    console.log(error); // eslint-disable-line no-console
  });

  // Update URL
  algoliaHelper.on('change', () => {
    setURLParams();
  });

  // Search results
  algoliaHelper.on('result', content => {
    renderStats(content);
    renderHits(content);
    renderPagination(content);
    handleNoResults(content);
  });

  structuredDataHelper.on('result', content => {
    renderStructuredData(content);
  });

  // Initial search
  initFromURLParams();
  algoliaHelper.search();

  // RENDER SEARCH COMPONENTS
  // ========================

  function renderStats(content) {
    const stats = {
      nbHits: content.nbHits,
      nbHitsPlural: content.nbHits !== 1,
      processingTimeMS: content.processingTimeMS,
    };
    $stats.html(statsTemplate.render(stats));
  }

  function renderHits(content) {
    $hits.html(hitTemplate.render(content));
  }

  function renderPagination(content) {
    const pages = [];
    let page;
    if (content.page > 3) {
      pages.push({current: false, number: 1});
      pages.push({current: false, number: '...', disabled: true});
    }
    for (page = content.page - 3; page < content.page + 3; ++page) {
      if (page < 0 || page >= content.nbPages) continue;
      pages.push({current: content.page === page, number: page + 1});
    }
    if (content.page + 3 < content.nbPages) {
      pages.push({current: false, number: '...', disabled: true});
      pages.push({current: false, number: content.nbPages});
    }
    const pagination = {
      pages,
      prevPage: content.page > 0 ? content.page : false,
      nextPage: content.page + 1 < content.nbPages ? content.page + 2 : false,
    };
    $pagination.html(paginationTemplate.render(pagination));
  }

  function renderStructuredData(content) {
    $structuredData.html(structuredDataTemplate.render(content));
  }

  // NO RESULTS
  // ==========

  function handleNoResults(content) {
    if (content.nbHits > 0) {
      $main.removeClass('no-results');
      return;
    }
    $main.addClass('no-results');
    $hits.html(noResultsTemplate.render({query: content.query}));
  }

  // EVENTS BINDING
  // ==============

  $(document).on('click', '.go-to-page', function(e) {
    e.preventDefault();
    $('html, body').animate({scrollTop: 0}, '500', 'swing');
    algoliaHelper.setCurrentPage(Number($(this).data('page')) - 1).search();
  });
  $searchInputIcon.on('click', e => {
    e.preventDefault();
    $searchInput.val('').keyup().focus();
  });
  $(document).on('click', '.clear-all', e => {
    e.preventDefault();
    $searchInput.val('').focus();
    algoliaHelper.setQuery('').search();
  });

  // URL MANAGEMENT
  // ==============

  function initFromURLParams() {
    const URLString = window.location.search.slice(1);
    const URLParams = algoliasearchHelper.url.getStateFromQueryString(URLString);
    const stateFromURL = Object.assign({}, PARAMS, URLParams);
    $searchInput.val(stateFromURL.query);
    algoliaHelper.overrideStateWithoutTriggeringChangeEvent(stateFromURL);
  }

  let URLHistoryTimer = Date.now();
  const URLHistoryThreshold = 700;
  function setURLParams() {
    const trackedParameters = ['attribute:*'];
    if (algoliaHelper.state.query.trim() !== '') trackedParameters.push('query');
    if (algoliaHelper.state.page !== 0) trackedParameters.push('page');
    if (algoliaHelper.state.index !== INDEX_NAME) trackedParameters.push('index');

    const URLParams = window.location.search.slice(1);
    const nonAlgoliaURLParams = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(URLParams);
    const nonAlgoliaURLHash = window.location.hash;
    const helperParams = algoliaHelper.getStateAsQueryString({
      filters: trackedParameters, moreAttributes: nonAlgoliaURLParams,
    });
    if (URLParams === helperParams) return;

    const now = Date.now();
    if (URLHistoryTimer > now) {
      window.history.replaceState(null, '', `?${helperParams}${nonAlgoliaURLHash}`);
    } else {
      window.history.pushState(null, '', `?${helperParams}${nonAlgoliaURLHash}`);
    }
    URLHistoryTimer = now + URLHistoryThreshold;
  }

  window.addEventListener('popstate', () => {
    initFromURLParams();
    algoliaHelper.search();
  });

  // HELPER METHODS
  // ==============

  function toggleIconEmptyInput(query) {
    $searchInputIcon.toggleClass('empty', query.trim() !== '');
  }
});
