import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/reader',
  },
  {
    path: '/reader',
    name: 'reader',
    component: () => import('@/views/reader/BookReaderView.vue'),
  },
  {
    path: '/reader/book/:id',
    name: 'book-reader',
    component: () => import('@/views/reader/BookReaderView.vue'),
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
    children: [
      {
        path: 'books',
        name: 'library-books',
        component: () => import('@/views/library/BooksView.vue'),
      },
      {
        path: 'articles',
        name: 'library-articles',
        component: () => import('@/views/library/ArticlesView.vue'),
      },
    ],
  },
  {
    path: '/reader/article/:id',
    name: 'article-reader',
    component: () => import('@/views/reader/ArticleReaderView.vue'),
  },
  {
    path: '/vocabulary',
    name: 'vocabulary',
    component: () => import('@/views/VocabularyView.vue'),
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/NotesView.vue'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
