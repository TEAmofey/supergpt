/* eslint-disable no-unused-vars */
const backupModels = [
  {
    slug: 'text-davinci-002-render-sha',
    max_tokens: 8191,
    title: 'Default (GPT-3.5)',
    description: 'Our fastest model, great for most everyday tasks.',
    tags: [
      'gpt3.5',
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {},
    enabled_tools: [
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'gpt-4',
    max_tokens: 32767,
    title: 'GPT-4\n    (All Tools)',
    description: 'Browsing, Advanced Data Analysis, and DALL·E are now built into GPT-4',
    tags: [
      'gpt4',
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'gpt-4o-jawbone',
    max_tokens: 34815,
    title: 'GPT-4o\n    with scheduled tasks',
    description: 'Newest and most advanced model',
    tags: [
      'alpha',
      'gpt4',
      'gpt4o',
    ],
    capabilities: {},
    product_features: {},
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'gpt-4o-mini',
    max_tokens: 32767,
    title: 'GPT-4o\n    mini',
    description: 'Browsing, Advanced Data Analysis, and DALL·E are now built into GPT-4',
    tags: [
      'gpt3.5',
      'gpt4',
      'history_off_approved',
      'gpt4o',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'gpt-4o',
    max_tokens: 34815,
    title: 'GPT-4o',
    description: 'Newest\n    and most advanced model',
    tags: [
      'gpt4',
      'history_off_approved',
      'gpt4o',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
      contextual_answers: {
        is_eligible_for_contextual_answers: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'canvas',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'gpt-4-5',
    max_tokens: 34815,
    title: 'gpt-4.5',
    description: 'Newest\n    and most advanced model',
    tags: [
      'gpt4',
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'canvas',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'o3',
    max_tokens: 196608,
    title: 'o3',
    description: 'Our\n    latest and most advanced model',
    tags: [
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
      contextual_answers: {
        is_eligible_for_contextual_answers: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'canvas',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'o4-mini',
    max_tokens: 196608,
    title: 'o4-mini',
    description: 'Our\n    latest and most advanced model',
    tags: [
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
      contextual_answers: {
        is_eligible_for_contextual_answers: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'canvas',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'o4-mini-high',
    max_tokens: 196608,
    title: 'o4-mini-high',
    description: 'Our\n    latest and most advanced model',
    tags: [
      'history_off_approved',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
      contextual_answers: {
        is_eligible_for_contextual_answers: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'search',
      'canvas',
      'image_gen_tool_enabled',
    ],
  },
  {
    slug: 'research',
    max_tokens: 34815,
    title: 'Deep\n    Research',
    description: 'Newest and most advanced model',
    tags: [
      'gpt4',
    ],
    capabilities: {},
    product_features: {
      attachments: {
        type: 'retrieval',
        can_accept_all_mime_types: true,
      },
    },
    enabled_tools: [
      'tools',
      'tools2',
      'image_gen_tool_enabled',
    ],
  },
];
