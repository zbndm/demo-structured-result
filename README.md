# Structured Results Demo

This is a sample project implementing a full page search with structured data results using [Algolia](https://www.algolia.com).

Learn more on the [Structure Results](https://www.algolia.com/doc/guides/building-search-ui/resources/ui-and-ux-patterns/tutorials/structured-results/js/) guide.

## Preview

![Preview](https://user-images.githubusercontent.com/6137112/73277871-0bd74a00-41eb-11ea-8c91-a701e5b4c36c.gif)

## Usage

### Open the project

To run this project locally, replace the Algolia credentials in [`.env`](.env):

```sh
ALGOLIA_APP_ID=YOUR_APP_ID
ALGOLIA_API_KEY=YOUR_API_KEY
ALGOLIA_INDEX_NAME_MAIN=YOUR_MAIN_INDEX
ALGOLIA_INDEX_NAME_STRUCTURED=YOUR_STRUCTURED_INDEX
```

Then, install the dependencies and run the local server:

```sh
yarn
yarn start
```

Open http://localhost:3000 to see the app.

## Release

This demo is released by [Pocci](https://pocci.algolia.com).

After making change, you need to run `yarn run build` and commit the change in `build/` folder.
