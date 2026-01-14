import { Provider, createStore } from 'jotai';
import { ReactNode } from 'react';

const JotaiProvider = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const appStore = createStore();
  return <Provider store={appStore}>{children}</Provider>;
};

export default JotaiProvider;
