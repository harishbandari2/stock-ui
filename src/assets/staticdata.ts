export const createNew = [
  {
    name: 'Portfolio',
    icon: 'icon-tree7',
    description: 'Portfolio to track multiple strategies basket',
    enabled: true
  },
  {
    name: 'Startegy',
    icon: 'icon-cogs',
    description: 'Configure Strategy with Conditions',
    enabled: true
  },
  {
    name: 'Broker',
    icon: 'icon-power-cord',
    description: 'Place orders with Brokers',
    enabled: false
  },
  {
    name: 'Import',
    icon: 'icon-upload7',
    description: 'Import Strategy',
    enabled: false
  }
];

export const actions = [
  {
    id: 1,
    name: 'read'
  },
  {
    id: 2,
    name: 'create'
  },
  {
    id: 3,
    name: 'delete'
  }
];

export const connections = [
  {
    id: 1,
    name: 'basic'
  },
  {
    id: 2,
    name: 'oauth'
  },
  {
    id: 3,
    name: 'token'
  }
];

export const fivePaisa = [
  { title: 'Name', description: 'Name of connection', control: 'name' },
  { title: 'Description', description: 'Connection description', control: 'description' },
  { title: 'Vendor Key', description: 'Vendor Key.', control: 'vendorKey' },
  { title: 'Client Id', description: 'Client Id.', control: 'clientCode' }
];

export const zerodha = [
  { title: 'Name', description: 'Name of connection', control: 'name' },
  { title: 'Description', description: 'Connection description', control: 'description' },
  { title: 'API Key', description: 'api_Key', control: 'api_Key' },
  { title: 'API Secret', description: 'api_secret', control: 'api_secret', type: 'password' }
];

export const finvasia = [
  { title: 'Name', description: 'Name of connection', control: 'name' },
  { title: 'Description', description: 'Connection description', control: 'description' },
  { title: 'User Id', description: 'User Id', control: 'userid' },
  { title: 'Vendor code', description: 'vendor_code', control: 'vendor_code' },
  { title: 'API Secret', description: 'api_key', control: 'api_secret', type: 'password' }
];
