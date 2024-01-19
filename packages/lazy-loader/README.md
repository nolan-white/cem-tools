# Custom Element Lazy Loader

Create a single entry point for your users to lazy-load your custom elements/web components as needed!

As components get loaded the component configurations get removed from the list and when all of the components have been loaded the loader will shut off to help improve performance.

## Usage

This package includes two ways to generate the custom data config file:

1. calling a function in your build pipeline
2. as a plugin for the [Custom Element Manifest Analyzer](https://custom-elements-manifest.open-wc.org/)

### Install

```bash
npm i -D custom-element-lazy-loader
```

### Build Pipeline

```js
import { generateCustomElementLoader } from "custom-element-lazy-loader";
import manifest from "./path/to/custom-elements.json";

const options = {...};

generateCustomElementLazyLoader(manifest, options);
```

### CEM Analyzer

#### Set-up

Ensure the following steps have been taken in your component library prior to using this plugin:

- Install and set up the [Custom Elements Manifest Analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/)
- Create a [config file](https://custom-elements-manifest.open-wc.org/analyzer/config/#config-file)

#### Import

```js
// custom-elements-manifest.config.js

import { customElementLazyLoaderPlugin } from "custom-element-lazy-loader";

const options = {...};

export default {
  plugins: [
    customElementLazyLoaderPlugin(options)
  ],
};
```

Once you run the analyzer, you should see a new file (`loader.js` by default) that users can import to load your components!

```js
<script type="module" src="https://my-cdn.com/loader.js"></script>;

// or

import "my-project/loader.js";
```

## Configuration

The configuration has the following parameters:

```ts
export type Options = {
  /** The template for creating the component's import path */
  importPathTemplate: (name: string, tagName: string) => string;
  /** Path to output directory. Default is `./` */
  outdir?: string;
  /** The of the loader file. Default is `loader.js` */
  fileName?: string;
  /** Additional components that may not be included in your Custom Elements Manifest */
  additionalComponents: ComponentConfig;
  /** Class names of any components you would like to exclude from the custom data */
  exclude?: string[];
  /** Enables logging during the component loading process */
  debug?: boolean;
  /** Adds a prefix to tag name */
  prefix?: string;
  /** Adds a suffix to tag name */
  suffix?: string;
};
```

### Import Path Template

This option is _required_ because it tells the loader where to find you component's module to load from. This should reference the path where you component is defined in the browser (using `customElements.define()` or some other mechanism). This path can also reference a resource outside of the project like a CDN.

Remember that this path is relative to the location of this file. For example, if this file is generated at the root of your project and the component definitions are in the `dist/components` directory could reference them like this:

```ts
{
  importPathTemplate: (name, tagName) =>
    `./dist/components/${name}/${tagName}.definition.js`;
}
```

This would generate imports for each of the components like:

```
'./dist/components/MyButton/my-button.definition.js'
'./dist/components/MyBadge/my-badge.definition.js'
'./dist/components/MyCard/my-card.definition.js'
...
```

### Debugging

If you set the `debug` option to true, this will add additional logging during the loading process to help you identify any issues that are happening during the loading process. Additional logs include:

- when a tag name is already registered
- when there is an undefined component, but it is not in your list of components
- when a component is successfully loaded
- when a component fails to load (this one is always logged)

### Adding Additional Components

If you are using additional components in your project that are not included in your Custom Elements Manifest (ie - third-party components), you can add them to your loader using the `additionalComponents` option. In this example, I am importing components from [Shoelace](https://shoelace.style/) that are also being used in my project.

```ts
{
  additionalComponents: {
    "sl-button": {
      importPath:
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/button/button.js",
    },
    "sl-icon": {
      importPath:
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/icon/icon.js",
    },
    "sl-input": {
      importPath:
        "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/components/input/input.js",
    },
  }
}
```

The component configurations use the following type:

```ts
type ComponentConfig = {
  /** The key is the component's tag-name (in lower-case) */
  [key: string]: {
    /** The path to the module where the component is defined */
    importPath: string;
    /** Any components used within this component that will be registered at the same time */
    dependencies?: string[];
  };
};
```

## Runtime Configuration

If you are using the loader post-build and need to add configurations, you can modify some of the options using the `updateConfig` function. The function takes in a config parameter that has the following options:

```ts
/** Configuration options for the `updateConfig` function */
type RuntimeConfiguration = {
  /** Additional components that may not be included in your Custom Elements Manifest */
  components?: ComponentConfig;
  /** The root element to observe for your custom elements */
  rootElement?: Element;
};
```

### Adding Components

This option allows you to add additional custom elements to watch for that may not have been included in the original build of the loader. This is similar to the `additionalComponents` option, but it adds them at runtime.

### Setting the Root Element

The loader will observe the document body for any new components that get added, but if you know your components will only be added to a subset of the DOM, you can specify an element to observe the children in to improve performance.

```ts
{
  rootElement: document.querySelector("#my-app");
}
```