import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import '@mantine/dropzone/styles.css';
import './styles/global.css';

import NewSession from './pages/NewSession.tsx';
import Login from './pages/Login.tsx';
import { theme } from './theme';
import AnalysisHub from './pages/AnalysisHub.tsx';
import { AppProvider } from './contextAPI/AppContext.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback.tsx';
import axiosInstance from './utils/axiosInstance.ts';
import Steps from './components/Stepper.tsx';
import NotFound from './pages/NotFound.tsx';

const defaultQueryFn = async ({
  queryKey,
}: {
  queryKey: readonly unknown[];
}) => {
  const { data } = await axiosInstance.get(queryKey[0] as string);
  return data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <NewSession />,
    children: [
      { path: 'steps', element: <Steps />, errorElement: <ErrorFallback /> },
    ],
    errorElement: <ErrorFallback />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/analysis-hub',
    element: <AnalysisHub />,
    errorElement: <ErrorFallback />,
  },
  // Catch-all route for 404 pages
  {
    path: '*',
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </AppProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
);
