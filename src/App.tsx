import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { RootFamilyPage } from './pages/RootFamilyPage';
import { FlashcardPage } from './pages/FlashcardPage';
import { AffixPage } from './pages/AffixPage';
import { ProgressPage } from './pages/ProgressPage';
import { SuggestPage } from './pages/SuggestPage';

const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,                 element: <HomePage /> },
      { path: 'browse',              element: <BrowsePage /> },
      { path: 'browse/root/:rootId', element: <RootFamilyPage /> },
      { path: 'flashcards',          element: <FlashcardPage /> },
      { path: 'affixes',             element: <AffixPage /> },
      { path: 'progress',            element: <ProgressPage /> },
      { path: 'suggest',             element: <SuggestPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
