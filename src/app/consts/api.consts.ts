export const BaseURL = `http://localhost:443`;

// `http://ec2-43-204-238-31.ap-south-1.compute.amazonaws.com:3000`;
//`http://localhost:443`;

export const auth = {
  user: `/user`,
  login: `/user/login`,
  userinfo: `/users/userinfo`,
  register: `/user/register`,
  reset: `/user/resetpassword`,
  update: `/user/update`
};

export const Apps = {
  applications: `/apps`,
  connectors: `/connectors`,
  connections: `/apps/connections`,
  connection: `/apps/connection`,
  login5paisa: `/broker/login/5paisa`,
  loginfinvasia: `/broker/finvasia`
};

export const Components = {
  components: `/components`,
  actions: `/actions`,
  actionobjects: `/actionobjects`
};

export const Transformer = {
  transformerTypes: `/transformertypes`,
  transformers: `/transformers`
};

export const Trade = {
  trade: `/trades`,
  exitPosition: '/trades/exitposition',
  strategy: '/strategy',
  startAlgo: '/strategy/enable',
  nodes: `/nodes`,
  start: '/trades/start',
  terminate: '/strategy/terminate',
  portfolio: `/portfolio`,
  scrip: `/scrips/scrip`,
  ltp: `/scrips/price`,
  order: `/orders`
};

export const Flow = {
  flows: `/projects`,
  nodes: `/nodes`
};

export const Rbac = {
  role: `/role`,
  users: `/users`,
  account: `/users/account`
};

export const Metadata = {
  meta: `/metadata`
};

export const Utils = {
  convertSql: `/util/convert`
};
