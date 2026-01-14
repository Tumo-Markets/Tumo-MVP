import GeneralProvider from 'src/provider';
import MainContentNoLayout from 'src/components/MainContentNoLayout';

export default function NoLayoutGroup({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GeneralProvider>
      <MainContentNoLayout>{children}</MainContentNoLayout>
    </GeneralProvider>
  );
}
