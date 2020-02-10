import { initAuth } from './modules/auth';
import { initProfile } from './modules/profile';
import { initSearch } from './modules/search';
import { initCommunity } from './modules/community';

document.addEventListener('DOMContentLoaded', () => {
  const searchRoot = document.querySelector('.search');

  initAuth();
  initProfile();
  initCommunity();
  if (searchRoot) {
    initSearch();
  }

  console.log('DOM LOADED');
});
