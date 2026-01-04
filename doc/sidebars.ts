import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: ['installation', 'configuration'],
    },
    {
      type: 'category',
      label: 'Helping Out',
      items: ['contributing'],
    },
    {
      type: 'link',
      label: 'Demo',
      href: 'https://jaberio.github.io/dashlet/',
    },
    {
      type: 'link',
      label: 'GitHub',
      href: 'https://github.com/jaberio/dashlet',
    },
  ],
};

export default sidebars;
