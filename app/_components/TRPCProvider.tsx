"use client"; 

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { api } from '@/utils/api'; // The client we created earlier

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`; 
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`; 
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // We create a new QueryClient instance for each request
  const [queryClient] = useState(() => new QueryClient());

  // We create a new tRPC client instance for each request
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`, 
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
}