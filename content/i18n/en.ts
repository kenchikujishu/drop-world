/**
 * 英語の文言辞書。**この型が全言語の正**。
 * ja.ts はこのファイルの `Dictionary` 型を満たすよう強制されるので、
 * 項目を足したら ja.ts 側もコンパイルエラーで教えてくれる。
 */

export type Section = {
  heading: string;
  /** 段落。行頭が "- " の要素は箇条書きとして描画される。 */
  body: string[];
};

export const en = {
  meta: {
    siteName: 'drop world',
    tagline: 'CAD entourage, drawn for architects',
    description:
      'drop world sells original CAD entourage libraries — people, trees, furniture, vehicles and more — as ready-to-use DWG, DXF, AI and PNG files for architectural drawings.',
  },

  nav: {
    products: 'Products',
    categories: 'Categories',
    license: 'License',
    faq: 'FAQ',
    about: 'About',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close',
    skipToContent: 'Skip to content',
  },

  common: {
    buyNow: 'Buy on Lemon Squeezy',
    buyNote: 'Checkout and download are handled by Lemon Squeezy. You will be taken to their secure page.',
    viewDetails: 'View details',
    items: 'items',
    formats: 'Formats',
    fileSize: 'File size',
    released: 'Released',
    view: 'View',
    category: 'Category',
    allProducts: 'All products',
    browseAll: 'Browse all products',
    results: 'products',
    noResults: 'No products match these filters yet.',
    clearFilters: 'Clear filters',
    filters: 'Filters',
    sort: 'Sort',
    sortNewest: 'Newest first',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    sortNameAsc: 'Name: A–Z',
    priceMin: 'Min price',
    priceMax: 'Max price',
    related: 'More in this category',
    whatsIncluded: "What's included",
    gallery: 'Preview',
    instantDownload: 'Instant download',
    oneTimePayment: 'One-time payment, no subscription',
    commercialUse: 'Commercial use included',
  },

  home: {
    heroKicker: 'CAD entourage library',
    heroTitle: 'Entourage that keeps your drawings honest.',
    heroLead:
      'Scale figures, trees, furniture and vehicles drawn at real dimensions, on tidy layers, ready to paste into your plan, section or elevation. Every set is drawn in-house by drop world.',
    heroCta: 'Browse products',
    heroCtaSecondary: 'Read the license',
    featuredTitle: 'Featured sets',
    featuredLead: 'Recently released libraries.',
    categoriesTitle: 'Browse by category',
    categoriesLead: 'Eight subjects, each drawn in plan, elevation, section and axonometric.',
    howTitle: 'How it works',
    howLead: 'Three steps, no account needed on our side.',
    howSteps: [
      {
        n: '01',
        title: 'Pick a set',
        body: 'Every product page lists the exact file formats, how many pieces are inside, and the total download size.',
      },
      {
        n: '02',
        title: 'Pay through Lemon Squeezy',
        body: 'Checkout opens on Lemon Squeezy, our payment provider and merchant of record. Cards and PayPal are accepted.',
      },
      {
        n: '03',
        title: 'Download and drop it in',
        body: 'A download link arrives by email the moment payment clears. Insert the block, keep your own scale, done.',
      },
    ],
    qualityTitle: 'Drawn for real drawings',
    qualityPoints: [
      {
        title: 'True scale, in millimetres',
        body: 'Figures are drawn at 1:1 in model space with heights between 1,550 and 1,850 mm, so they read correctly at 1:50 through 1:500.',
      },
      {
        title: 'Layered and named',
        body: 'Outline, fill and detail sit on separate layers with consistent names, so you can restyle a whole set with one selection.',
      },
      {
        title: 'Clean geometry',
        body: 'Closed polylines, no stray nodes, no exploded hatches. Files open the same in AutoCAD, Vectorworks, Archicad and Illustrator.',
      },
      {
        title: 'Original artwork',
        body: 'Every piece is drawn by drop world. We hold the copyright to everything we sell — nothing is traced from stock libraries.',
      },
    ],
  },

  products: {
    title: 'All products',
    lead: 'Original CAD entourage sets. Prices are one-time and include commercial use.',
  },

  categoryPage: {
    leadPrefix: 'CAD entourage in the category',
  },

  product: {
    backToProducts: 'All products',
    aboutThisSet: 'About this set',
    specs: 'Specifications',
    licenseShort: 'Licensed for commercial and personal projects. Redistribution of the files themselves is not permitted.',
    licenseLink: 'Read the full license',
    checkoutPending: 'Checkout link coming soon',
    checkoutPendingNote: 'This set is not on sale yet. Please check back shortly.',
  },

  about: {
    title: 'About drop world',
    lead: 'A small drawing studio that makes CAD entourage, and sells it as files.',
    sections: [
      {
        heading: 'What we sell',
        body: [
          'drop world is a digital product store. We sell finished, ready-made CAD entourage libraries as downloadable files. Each product is a fixed set of drawings that you buy once and use as many times as you like within the terms of our license.',
          'We are not a design agency and we do not take commissions, drafting work, or any other service engagements. Everything on this site is an off-the-shelf file, priced and described in advance.',
        ],
      },
      {
        heading: 'How the drawings are made',
        body: [
          'Every set starts from reference photographs and measured dimensions, then is drawn by hand in CAD. We keep line weights consistent across a set so that mixing several products in one drawing still looks deliberate.',
          'Before a set is published we open it in AutoCAD, Vectorworks, Archicad and Adobe Illustrator to confirm that layers, line weights and units survive the round trip.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'All artwork sold on drop world is created by us and we hold the copyright to it. We do not resell, repackage, or trace assets from third-party libraries, and nothing in our catalogue is generated from another vendor’s files.',
        ],
      },
      {
        heading: 'Payments and delivery',
        body: [
          'Payments and file delivery are handled by Lemon Squeezy, which acts as the merchant of record for every order. That means Lemon Squeezy processes your payment, handles applicable sales tax and VAT, issues your receipt, and serves the download link.',
        ],
      },
    ] as Section[],
  },

  contact: {
    title: 'Contact',
    lead: 'Questions about a product, a license, or an order — write to us and we will reply within two business days.',
    emailLabel: 'Email',
    hoursLabel: 'Response time',
    hoursValue: 'Within 2 business days (Mon–Fri, JST)',
    orderLabel: 'Order and payment issues',
    orderValue:
      'For receipts, failed payments, or re-sending a download link, include the order number from your Lemon Squeezy confirmation email.',
    beforeYouWrite: 'Before you write',
    beforeYouWriteBody: 'The FAQ answers most questions about file formats, software support and re-downloads.',
    faqLink: 'Read the FAQ',
  },

  license: {
    title: 'License',
    lead: 'One license comes with every purchase. It covers commercial and personal work. This page explains exactly what it allows.',
    tableTitle: 'At a glance',
    allowed: 'Allowed',
    notAllowed: 'Not allowed',
    rows: [
      { use: 'Use in commercial architectural projects and competition entries', allowed: true },
      { use: 'Use in drawings delivered to a paying client', allowed: true },
      { use: 'Use in printed material, presentations and websites', allowed: true },
      { use: 'Modify, recolour, and combine with your own drawings', allowed: true },
      { use: 'Use on unlimited projects, with no expiry', allowed: true },
      { use: 'Share the files with colleagues inside your own office or studio', allowed: true },
      { use: 'Resell, sublicense, or give away the files themselves', allowed: false },
      { use: 'Include the files in another asset pack, template, or library', allowed: false },
      { use: 'Upload the files to a file-sharing site or public repository', allowed: false },
      { use: 'Claim authorship of the artwork itself', allowed: false },
    ],
    sections: [
      {
        heading: 'What you are buying',
        body: [
          'When you buy a product from drop world you receive a non-exclusive, worldwide, perpetual license to use the files in your own work. You do not acquire the copyright, which stays with drop world.',
          'The license is granted to one person or one legal entity. If you buy as a company, everyone inside that company may use the files on the company’s projects.',
        ],
      },
      {
        heading: 'Delivering work to clients',
        body: [
          'You may include our entourage inside drawings, renderings, presentations and printed documents that you hand over to a client, including editable CAD files, as long as the entourage is part of a larger drawing you produced.',
          'What you may not do is hand over the purchased set on its own — for example forwarding the original download, or extracting the blocks into a separate file for the client to keep as a library.',
        ],
      },
      {
        heading: 'Redistribution',
        body: [
          'The files themselves may not be resold, sublicensed, rented, given away, or made available for download, in original or modified form. This includes bundling them into a template, a plugin, a title block, an asset pack, or a public repository.',
        ],
      },
      {
        heading: 'Attribution',
        body: [
          'No attribution is required. You are welcome to credit drop world, but you are never obliged to.',
        ],
      },
      {
        heading: 'Copyright',
        body: [
          'All artwork sold on drop world is original work created by drop world, and drop world owns the copyright in it. Buying a product does not transfer that copyright.',
        ],
      },
    ] as Section[],
  },

  faq: {
    title: 'Frequently asked questions',
    lead: 'File formats, software, downloads and payment.',
    groups: [
      {
        heading: 'Files and software',
        items: [
          {
            q: 'Which software can open these files?',
            a: 'DWG and DXF files open in AutoCAD, BricsCAD, Vectorworks, Archicad, Rhino, SketchUp (via import) and any other CAD application that reads those formats. AI and EPS files open in Adobe Illustrator and Affinity Designer. PNG files are transparent raster exports for quick presentation work.',
          },
          {
            q: 'Which DWG version are the files saved in?',
            a: 'DWG files are saved in the AutoCAD 2013 format, which every version from 2013 onward can open. A DXF of the same drawing is always included as a fallback for older or non-Autodesk software.',
          },
          {
            q: 'What units are the drawings in?',
            a: 'Millimetres, drawn at 1:1 in model space. If your drawing is set up in metres, scale the block by 0.001 on insert.',
          },
          {
            q: 'Are the drawings on separate layers?',
            a: 'Yes. Outline, fill and detail sit on their own named layers so you can change line weight or colour across a whole set at once.',
          },
          {
            q: 'Can I change the colours and line weights?',
            a: 'Yes. Modifying the artwork for your own project is explicitly allowed by the license.',
          },
        ],
      },
      {
        heading: 'Buying and downloading',
        items: [
          {
            q: 'How do I receive the files?',
            a: 'Checkout happens on Lemon Squeezy. As soon as the payment clears, a download link is emailed to the address you entered at checkout. There is nothing to install and no account to create on drop world.',
          },
          {
            q: 'I did not get the email.',
            a: 'Check your spam folder first, then write to us with the email address you used and we will re-send the link.',
          },
          {
            q: 'Can I download a file again later?',
            a: 'Yes. The download link in your confirmation email stays valid. If it ever stops working, contact us with your order number and we will issue a new one.',
          },
          {
            q: 'Do you offer invoices or receipts?',
            a: 'Lemon Squeezy is the merchant of record and issues a receipt automatically for every order. You can enter a company name and VAT or tax number during checkout so it appears on that receipt.',
          },
          {
            q: 'Which payment methods are accepted?',
            a: 'Major credit and debit cards and PayPal, through Lemon Squeezy’s checkout. drop world never sees or stores your card details.',
          },
          {
            q: 'Is this a subscription?',
            a: 'No. Every product is a one-time purchase with no recurring charge and no expiry on the license.',
          },
        ],
      },
      {
        heading: 'Refunds and support',
        items: [
          {
            q: 'Can I get a refund?',
            a: 'Because the products are downloadable files, sales are final once the download is delivered. We do make exceptions for corrupt or unusable files, duplicate charges, and products that turn out to be materially different from their description. See the refund policy for the details.',
          },
          {
            q: 'A file will not open correctly.',
            a: 'Write to us with the product name and the software and version you are using. If we cannot get it working we will refund the order.',
          },
        ],
      },
    ],
  },

  legal: {
    lastUpdatedLabel: 'Last updated',
    lastUpdated: '15 August 2026',

    terms: {
      title: 'Terms of Service',
      lead: 'These terms govern your use of the drop world website and the products sold on it.',
      sections: [
        {
          heading: '1. Who we are',
          body: [
            'drop world (“we”, “us”) operates this website and sells downloadable CAD entourage files. Contact details are on the Contact page.',
          ],
        },
        {
          heading: '2. What we sell',
          body: [
            'We sell pre-made digital files. We do not provide design, drafting, consulting or any other service, and no product on this site should be understood as an offer of services.',
            'Each product page states the file formats, the number of pieces included, the approximate download size and the price before you buy.',
          ],
        },
        {
          heading: '3. Payments and merchant of record',
          body: [
            'Orders are processed by Lemon Squeezy, which acts as the merchant of record. When you buy from us, your contract of sale for the payment is with Lemon Squeezy, and their terms and privacy policy apply to the transaction alongside these terms.',
            'Lemon Squeezy calculates and remits any applicable sales tax or VAT, issues your receipt, and delivers the download link.',
            'We never receive or store your payment card details.',
          ],
        },
        {
          heading: '4. Delivery',
          body: [
            'Products are delivered electronically. A download link is sent to the email address entered at checkout, normally within a few minutes of payment being confirmed. No physical goods are shipped.',
          ],
        },
        {
          heading: '5. License',
          body: [
            'Your use of the files is governed by our License page, which forms part of these terms. In short: unlimited use in your own commercial and personal projects, no redistribution of the files themselves.',
          ],
        },
        {
          heading: '6. Intellectual property',
          body: [
            'All content on this site, including the artwork inside every product, is the original work of drop world and is protected by copyright. Buying a product grants a license to use it, not ownership of it.',
          ],
        },
        {
          heading: '7. Availability and changes',
          body: [
            'We may add, change, re-price or withdraw products at any time. Changes never affect a license you have already bought.',
            'We may update these terms. The date at the top of this page shows when they last changed; the version in force is the one published at the time of your purchase.',
          ],
        },
        {
          heading: '8. Disclaimer and liability',
          body: [
            'The files are provided as they are. We make no warranty that a given file will suit a particular purpose or open identically in every version of every application.',
            'To the extent permitted by law, our total liability for any claim relating to a product is limited to the amount you paid for that product.',
            'Nothing in these terms limits liability that cannot be limited by law.',
          ],
        },
        {
          heading: '9. Governing law',
          body: [
            'These terms are governed by the laws of Japan. Disputes will be brought before the courts of Japan.',
          ],
        },
      ] as Section[],
    },

    privacy: {
      title: 'Privacy Policy',
      lead: 'What data this site handles, and what it does not.',
      sections: [
        {
          heading: 'The short version',
          body: [
            'This website does not require an account, does not run advertising trackers, and does not collect your payment details. The only personal data connected to a purchase is handled by Lemon Squeezy, our payment provider.',
          ],
        },
        {
          heading: 'Data collected by this website',
          body: [
            'The site is a set of static pages. It does not set cookies for tracking or advertising and does not embed third-party analytics or advertising scripts.',
            'Our hosting provider, Cloudflare, records standard technical request logs — IP address, browser user agent, requested URL and timestamp — for security and reliability. These logs are retained for a limited period and are not used to build a profile of you.',
          ],
        },
        {
          heading: 'Data collected when you buy',
          body: [
            'Checkout takes place on Lemon Squeezy. They collect the information needed to complete the sale — your name, email address, billing country, payment details and, if you enter one, your company name and tax number.',
            'Lemon Squeezy acts as the merchant of record and is the data controller for that transaction. We receive from them only the order details we need to provide support: order number, product, date, and the email address used.',
            'We never see or store your full payment card number.',
          ],
        },
        {
          heading: 'Data you send us by email',
          body: [
            'If you write to our support address, we keep your message and email address for as long as needed to answer you and to keep a record of the support history. We do not add you to a mailing list.',
          ],
        },
        {
          heading: 'Third parties we rely on',
          body: [
            '- Lemon Squeezy — payment processing, tax handling, receipts and file delivery',
            '- Cloudflare — website hosting, DNS, and email forwarding for our support address',
            'Both process data on servers outside Japan. We do not sell or share personal data with anyone else.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'You may ask us what personal data we hold about you, ask for it to be corrected, or ask for it to be deleted. Write to the address on the Contact page and we will respond within a reasonable period.',
            'For data held by Lemon Squeezy as part of your order, requests should go to them directly, as they are the controller for that data.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'If this policy changes, the date at the top of the page is updated.',
          ],
        },
      ] as Section[],
    },

    refund: {
      title: 'Refund Policy',
      lead: 'Digital files, and the specific cases where we refund them anyway.',
      sections: [
        {
          heading: 'The general rule',
          body: [
            'Every product on drop world is a downloadable file. Once the download link has been delivered, the product has been supplied in full and cannot be returned. Sales are therefore final, and by completing checkout you agree to immediate delivery and acknowledge that this ends any statutory cooling-off period that would otherwise apply.',
          ],
        },
        {
          heading: 'When we do refund',
          body: [
            'We issue a full refund in these cases, if you contact us within 14 days of purchase:',
            '- The files are corrupt, incomplete, or will not open, and we cannot resolve it with you',
            '- You were charged more than once for the same order',
            '- The product is materially different from what the product page described — wrong formats, substantially fewer pieces, or missing content',
            '- The download link never arrived and we are unable to deliver the files to you',
          ],
        },
        {
          heading: 'When we do not refund',
          body: [
            '- You changed your mind, or bought the wrong set by mistake, after downloading the files',
            '- Your software cannot open a format that the product page did not claim to support',
            '- You want a different style, level of detail, or subject than the one shown in the preview images',
            'Every product page shows preview images, the exact formats, and the number of pieces included, precisely so that you can judge this before buying. If you are unsure whether a set fits your workflow, write to us before you order.',
          ],
        },
        {
          heading: 'How to request a refund',
          body: [
            'Email us at the address on the Contact page with your order number from the Lemon Squeezy confirmation email, the product name, and a short description of the problem.',
            'We reply within two business days. Approved refunds are processed by Lemon Squeezy back to the original payment method and normally appear within 5–10 business days, depending on your bank.',
          ],
        },
        {
          heading: 'Chargebacks',
          body: [
            'Please contact us before opening a dispute with your bank. Almost every problem — a missing email, a file that will not open — is solved faster by writing to us directly.',
          ],
        },
      ] as Section[],
    },

    tokushoho: {
      title: 'Legal Notice (Japan)',
      lead: 'The statement required under the Japanese Act on Specified Commercial Transactions is published in Japanese.',
      viewJa: 'View the Japanese page',
    },
  },

  footer: {
    tagline: 'Original CAD entourage libraries for architectural drawings.',
    shopHeading: 'Shop',
    infoHeading: 'Information',
    legalHeading: 'Legal',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    refund: 'Refund Policy',
    tokushoho: 'Legal Notice (Japan)',
    paymentNote: 'Payments and downloads are handled by Lemon Squeezy, our merchant of record.',
    copyright: 'drop world. All rights reserved.',
    langLabel: 'Language',
  },
};

/** ja.ts はこの型に適合させる。`as const` は付けない —— 付けると文字列がリテラル型になり、
 *  日本語版が「同じ英文でなければならない」ことになってしまう。 */
export type Dictionary = typeof en;
