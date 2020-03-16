export const apiHost = process.env.REACT_APP_API_URI || '';
export const baseUrl = `${apiHost}/v1`;
export const defaultIndex = 'docuvision_page';
export const githubRepo = 'https://github.com/isarbits/docuvision-studio';
export const socketHost = `ws://${apiHost.replace(/^https?:\/\//, '')}`;
export const elasticHost = `${apiHost}/search-proxy`;
